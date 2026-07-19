import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('jose', () => ({
  jwtVerify: vi.fn(),
}))

vi.mock('payload', () => ({
  getPayload: vi.fn(),
}))

vi.mock('@payload-config', () => ({
  default: {},
}))

vi.mock('@/lib/redis', () => ({
  isTokenBlacklisted: vi.fn(),
}))

import { jwtVerify } from 'jose'
import { getPayload } from 'payload'
import { isTokenBlacklisted } from '@/lib/redis'
import { authenticateRequest } from '../auth'

function makeRequest(cookieHeader?: string): Request {
  const headers = new Headers()
  if (cookieHeader) headers.set('cookie', cookieHeader)
  return new Request('http://localhost/api/dashboard/courses', { headers })
}

describe('authenticateRequest', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.PAYLOAD_SECRET = 'test-secret-value-at-least-32-chars!!'
  })

  it('returns 401 when no cookie is present', async () => {
    const result = await authenticateRequest(makeRequest())
    expect(result.success).toBe(false)
    if (!result.success) expect(result.status).toBe(401)
  })

  it('returns 401 when token is invalid', async () => {
    vi.mocked(jwtVerify).mockRejectedValue(new Error('invalid'))
    const result = await authenticateRequest(makeRequest('payload-token=badtoken'))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.status).toBe(401)
  })

  it('returns 401 when JWT has no id', async () => {
    vi.mocked(jwtVerify).mockResolvedValue({ payload: {} } as never)
    const result = await authenticateRequest(makeRequest('payload-token=sometoken'))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.status).toBe(401)
  })

  it('returns 401 when token is blacklisted', async () => {
    vi.mocked(jwtVerify).mockResolvedValue({
      payload: { id: 1, iat: 1000 },
    } as never)
    vi.mocked(isTokenBlacklisted).mockResolvedValue(true)
    const result = await authenticateRequest(makeRequest('payload-token=sometoken'))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.status).toBe(401)
  })

  it('returns 401 when user not found in DB', async () => {
    vi.mocked(jwtVerify).mockResolvedValue({
      payload: { id: 999, iat: 1000 },
    } as never)
    vi.mocked(isTokenBlacklisted).mockResolvedValue(false)
    vi.mocked(getPayload).mockResolvedValue({
      findByID: vi.fn().mockResolvedValue(null),
    } as never)
    const result = await authenticateRequest(makeRequest('payload-token=sometoken'))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.status).toBe(401)
  })

  it('returns user when everything is valid', async () => {
    const mockUser = { id: 1, phone: '09123456789', name: 'Test', role: 'student' }
    vi.mocked(jwtVerify).mockResolvedValue({
      payload: { id: 1, iat: 1000 },
    } as never)
    vi.mocked(isTokenBlacklisted).mockResolvedValue(false)
    vi.mocked(getPayload).mockResolvedValue({
      findByID: vi.fn().mockResolvedValue(mockUser),
    } as never)
    const result = await authenticateRequest(makeRequest('payload-token=sometoken'))
    expect(result.success).toBe(true)
    if (result.success) expect(result.user.id).toBe(1)
  })
})
