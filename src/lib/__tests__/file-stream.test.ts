import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import {
  formatContentRange,
  nodeStreamToWeb,
  parseRangeHeader,
} from '../file-stream'

let tmpDir: string
let bigFile: string
const BIG_FILE_SIZE = 8 * 1024 * 1024

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nimnegah-filestream-'))
  bigFile = path.join(tmpDir, 'large.bin')
  fs.writeFileSync(bigFile, Buffer.alloc(BIG_FILE_SIZE, 7))
})

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

describe('parseRangeHeader', () => {
  it('returns null when there is no header', () => {
    expect(parseRangeHeader(null, 1000)).toBeNull()
  })

  it('returns null for an unparseable header', () => {
    expect(parseRangeHeader('items=0-10', 1000)).toBeNull()
    expect(parseRangeHeader('bytes=abc', 1000)).toBeNull()
    expect(parseRangeHeader('bytes=-', 1000)).toBeNull()
  })

  it('parses an explicit range', () => {
    expect(parseRangeHeader('bytes=0-499', 1000)).toEqual({ start: 0, end: 499 })
    expect(parseRangeHeader('bytes=100-199', 1000)).toEqual({
      start: 100,
      end: 199,
    })
  })

  it('clamps an end that runs past the file', () => {
    expect(parseRangeHeader('bytes=900-5000', 1000)).toEqual({
      start: 900,
      end: 999,
    })
  })

  it('treats an open-ended range as "to the end of file"', () => {
    expect(parseRangeHeader('bytes=900-', 1000)).toEqual({ start: 900, end: 999 })
  })

  it('parses a suffix range', () => {
    expect(parseRangeHeader('bytes=-500', 1000)).toEqual({ start: 500, end: 999 })
    expect(parseRangeHeader('bytes=-5000', 1000)).toEqual({ start: 0, end: 999 })
  })

  it('reports an unsatisfiable range', () => {
    expect(parseRangeHeader('bytes=1000-', 1000)).toBe('unsatisfiable')
    expect(parseRangeHeader('bytes=2000-3000', 1000)).toBe('unsatisfiable')
    expect(parseRangeHeader('bytes=500-100', 1000)).toBe('unsatisfiable')
    expect(parseRangeHeader('bytes=-0', 1000)).toBe('unsatisfiable')
  })
})

describe('formatContentRange', () => {
  it('formats a partial response header', () => {
    expect(formatContentRange({ start: 100, end: 199 }, 1000)).toBe(
      'bytes 100-199/1000',
    )
  })
})

describe('nodeStreamToWeb', () => {
  it('delivers the whole file', async () => {
    const readable = nodeStreamToWeb(fs.createReadStream(bigFile))
    const chunks: Uint8Array[] = []
    for await (const chunk of readable as unknown as AsyncIterable<Uint8Array>) {
      chunks.push(chunk)
    }
    const total = chunks.reduce((sum, c) => sum + c.length, 0)
    expect(total).toBe(BIG_FILE_SIZE)
  })

  it('does not read ahead of the consumer', async () => {
    const stream = fs.createReadStream(bigFile)
    const readable = nodeStreamToWeb(stream)
    const reader = readable.getReader()

    await reader.read()

    // The whole point: the producer must not have slurped the file into
    // memory waiting for a slow consumer.
    expect(stream.bytesRead).toBeLessThan(BIG_FILE_SIZE / 2)

    await reader.cancel()
  })

  it('releases the file descriptor when the consumer cancels', async () => {
    const stream = fs.createReadStream(bigFile)
    const readable = nodeStreamToWeb(stream)
    const reader = readable.getReader()

    await reader.read()
    await reader.cancel()

    expect(stream.destroyed).toBe(true)
  })
})
