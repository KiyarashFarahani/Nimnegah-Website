import { describe, it, expect } from 'vitest'
import { toEnglishDigits, isValidIranianPhone, safeRedirect } from '../validations'

describe('toEnglishDigits', () => {
  it('converts Persian digits to English', () => {
    expect(toEnglishDigits('۰۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789')
  })

  it('leaves English digits unchanged', () => {
    expect(toEnglishDigits('09123456789')).toBe('09123456789')
  })

  it('handles mixed Persian and English digits', () => {
    expect(toEnglishDigits('۰۹12۳۴۵۶78۹')).toBe('09123456789')
  })

  it('handles empty string', () => {
    expect(toEnglishDigits('')).toBe('')
  })
})

describe('isValidIranianPhone', () => {
  it('accepts valid 09xxxxxxxxx format', () => {
    expect(isValidIranianPhone('09123456789')).toBe(true)
  })

  it('accepts valid Persian digit phone', () => {
    expect(isValidIranianPhone('۰۹۱۲۳۴۵۶۷۸۹')).toBe(true)
  })

  it('rejects phone without leading 0', () => {
    expect(isValidIranianPhone('9123456789')).toBe(false)
  })

  it('rejects phone that is too short', () => {
    expect(isValidIranianPhone('0912345678')).toBe(false)
  })

  it('rejects phone that is too long', () => {
    expect(isValidIranianPhone('091234567890')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidIranianPhone('')).toBe(false)
  })

  it('rejects non-numeric input', () => {
    expect(isValidIranianPhone('abcdefghijk')).toBe(false)
  })
})

describe('safeRedirect', () => {
  it('accepts relative path', () => {
    expect(safeRedirect('/dashboard')).toBe('/dashboard')
  })

  it('falls back to /dashboard for absolute URL', () => {
    expect(safeRedirect('https://evil.com')).toBe('/dashboard')
  })

  it('falls back for protocol-relative URL', () => {
    expect(safeRedirect('//evil.com')).toBe('/dashboard')
  })

  it('uses custom fallback', () => {
    expect(safeRedirect('https://evil.com', '/courses')).toBe('/courses')
  })

  it('accepts nested relative path', () => {
    expect(safeRedirect('/dashboard/learn/some-course')).toBe('/dashboard/learn/some-course')
  })
})
