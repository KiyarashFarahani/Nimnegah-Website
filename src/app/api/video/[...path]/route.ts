import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { authenticateRequest } from '@/lib/auth'
import { createVideoToken, verifyVideoToken } from '@/lib/video-token'
import fs from 'fs'
import { stat } from 'fs/promises'
import path from 'path'

const MEDIA_DIR = path.resolve(process.cwd(), 'media')

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const url = new URL(request.url)
    const filename = url.searchParams.get('file')
    const expires = Number(url.searchParams.get('expires'))
    const signature = url.searchParams.get('signature') ?? ''
    const secret = process.env.PAYLOAD_SECRET!

    if (filename && verifyVideoToken(filename, expires, signature, secret)) {
      if (process.env.NODE_ENV === 'production') {
        return new Response(null, {
          headers: {
            'X-Accel-Redirect': `/_protected_media/${encodeURIComponent(filename)}`,
            'Cache-Control': 'private, max-age=7200',
          },
        })
      }
      return streamDevelopmentVideo(request, filename)
    }

    const auth = await authenticateRequest(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { path: pathParts } = await params
    const lessonId = Number(pathParts[0])
    if (!Number.isInteger(lessonId)) {
      return NextResponse.json({ error: 'Valid lesson ID required' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const lesson = await payload.findByID({
      collection: 'lessons',
      id: lessonId,
      depth: 1,
    })
    const courseId = typeof lesson.course === 'object' ? lesson.course.id : lesson.course

    if (!lesson.isFree) {
      const enrollment = await payload.find({
        collection: 'enrollments',
        where: {
          and: [
            { user: { equals: auth.user.id } },
            { course: { equals: courseId } },
          ],
        },
        depth: 0,
        limit: 1,
      })
      if (enrollment.docs.length === 0) {
        return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
      }
    }

    const media = typeof lesson.video === 'object' ? lesson.video : null
    if (!media?.filename || path.basename(media.filename) !== media.filename) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const token = createVideoToken(media.filename, secret)
    const redirect = new URL(request.url)
    redirect.search = new URLSearchParams({
      file: token.filename,
      expires: String(token.expires),
      signature: token.signature,
    }).toString()
    return NextResponse.redirect(redirect, 307)
  } catch (error) {
    console.error('Video delivery error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

async function streamDevelopmentVideo(request: Request, filename: string) {
  const filePath = path.join(MEDIA_DIR, filename)
  const fileStat = await stat(filePath)
  const range = request.headers.get('range')
  const start = range ? Number(range.replace(/bytes=/, '').split('-')[0]) : 0
  const requestedEnd = range?.split('-')[1]
  const end = requestedEnd ? Number(requestedEnd) : fileStat.size - 1
  const stream = fs.createReadStream(filePath, { start, end })
  const body = new ReadableStream({
    start(controller) {
      stream.on('data', (chunk: string | Buffer) => {
        const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk
        controller.enqueue(new Uint8Array(buffer))
      })
      stream.on('end', () => controller.close())
      stream.on('error', (error) => controller.error(error))
    },
    cancel() {
      stream.destroy()
    },
  })

  return new Response(body, {
    status: range ? 206 : 200,
    headers: {
      ...(range ? { 'Content-Range': `bytes ${start}-${end}/${fileStat.size}` } : {}),
      'Accept-Ranges': 'bytes',
      'Content-Length': String(end - start + 1),
      'Content-Type': 'video/mp4',
      'Cache-Control': 'private, max-age=7200',
    },
  })
}
