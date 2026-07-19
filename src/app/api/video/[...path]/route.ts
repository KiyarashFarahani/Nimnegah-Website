import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { authenticateRequest } from '@/lib/auth'
import fs from 'fs'
import { access, stat } from 'fs/promises'
import path from 'path'

const UPLOADS_DIR = path.resolve(process.cwd(), 'media')

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.success) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { path: pathParts } = await params
    const lessonId = pathParts[0]

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const lesson = await payload.findByID({
      collection: 'lessons',
      id: lessonId,
      depth: 1,
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const courseId =
      typeof lesson.course === 'object' ? lesson.course.id : lesson.course

    const enrollments = await payload.find({
      collection: 'enrollments',
      where: {
        user: { equals: auth.user.id },
        course: { equals: courseId },
      },
      limit: 1,
    })

    if (enrollments.docs.length === 0) {
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
    }

    const media =
      typeof lesson.video === 'object' ? lesson.video : null

    if (!media || !media.filename) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const filePath = path.join(UPLOADS_DIR, media.filename)
    const resolved = path.resolve(filePath)
    if (!resolved.startsWith(UPLOADS_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    try {
      await access(resolved)
    } catch {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
    }

    const fileStat = await stat(resolved)
    const range = request.headers.get('range')

    const contentType = media.mimeType || 'video/mp4'

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileStat.size - 1
      const chunkSize = end - start + 1

      const stream = fs.createReadStream(resolved, { start, end })
      const readable = new ReadableStream({
        start(controller) {
          stream.on('data', (chunk: string | Buffer) => {
            const buf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk
            controller.enqueue(new Uint8Array(buf))
          })
          stream.on('end', () => controller.close())
          stream.on('error', (err) => controller.error(err))
        },
      })

      return new Response(readable, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileStat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
          'Content-Type': contentType,
          'Cache-Control': 'private, max-age=3600',
        },
      })
    }

    const stream = fs.createReadStream(resolved)
    const readable = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: string | Buffer) => {
          const buf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk
          controller.enqueue(new Uint8Array(buf))
        })
        stream.on('end', () => controller.close())
        stream.on('error', (err) => controller.error(err))
      },
    })

    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Length': String(fileStat.size),
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Video streaming error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
