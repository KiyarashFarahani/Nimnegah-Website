import { describe, it, expect } from 'vitest'
import {
  formatPrice,
  hasDiscount,
  discountPercent,
  formatDuration,
  formatLessonDuration,
  getPlainText,
  LEVEL_MAP,
} from '../course-utils'

describe('formatPrice', () => {
  it('formats a number with Persian locale separators', () => {
    const result = formatPrice(1500000)
    expect(result).toContain('۱')
    expect(result).toContain('۵۰۰')
    expect(result).toContain('۰۰۰')
  })

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('۰')
  })

  it('formats small numbers', () => {
    expect(formatPrice(100)).toContain('۱۰۰')
  })
})

describe('hasDiscount', () => {
  it('returns true when originalPrice is higher than price', () => {
    expect(hasDiscount(800000, 1000000)).toBe(true)
  })

  it('returns false when originalPrice equals price', () => {
    expect(hasDiscount(1000000, 1000000)).toBe(false)
  })

  it('returns false when originalPrice is lower than price', () => {
    expect(hasDiscount(1000000, 800000)).toBe(false)
  })

  it('returns false when originalPrice is null', () => {
    expect(hasDiscount(1000000, null)).toBe(false)
  })

  it('returns false when originalPrice is undefined', () => {
    expect(hasDiscount(1000000)).toBe(false)
  })

  it('returns false when originalPrice is 0', () => {
    expect(hasDiscount(1000000, 0)).toBe(false)
  })
})

describe('discountPercent', () => {
  it('calculates 20% discount correctly', () => {
    expect(discountPercent(800000, 1000000)).toBe(20)
  })

  it('calculates 50% discount correctly', () => {
    expect(discountPercent(500000, 1000000)).toBe(50)
  })

  it('rounds to nearest integer', () => {
    expect(discountPercent(750000, 1000000)).toBe(25)
  })

  it('returns 0 when no originalPrice', () => {
    expect(discountPercent(800000)).toBe(0)
  })

  it('returns 0 when originalPrice is null', () => {
    expect(discountPercent(800000, null)).toBe(0)
  })

  it('returns 0 when originalPrice <= price', () => {
    expect(discountPercent(1000000, 800000)).toBe(0)
  })
})

describe('formatDuration', () => {
  it('formats minutes under 60', () => {
    expect(formatDuration(45)).toBe('45 دقیقه')
  })

  it('formats exact hours', () => {
    expect(formatDuration(120)).toBe('2 ساعت')
  })

  it('formats hours with remaining minutes', () => {
    expect(formatDuration(90)).toBe('1 ساعت و 30 دقیقه')
  })

  it('formats 1 hour exactly', () => {
    expect(formatDuration(60)).toBe('1 ساعت')
  })

  it('formats zero', () => {
    expect(formatDuration(0)).toBe('0 دقیقه')
  })
})

describe('formatLessonDuration', () => {
  it('formats seconds under 60', () => {
    expect(formatLessonDuration(45)).toBe('0:45')
  })

  it('pads single-digit seconds', () => {
    expect(formatLessonDuration(5)).toBe('0:05')
  })

  it('formats minutes and seconds', () => {
    expect(formatLessonDuration(125)).toBe('2:05')
  })

  it('formats exact minutes', () => {
    expect(formatLessonDuration(120)).toBe('2:00')
  })

  it('formats zero', () => {
    expect(formatLessonDuration(0)).toBe('0:00')
  })

  it('handles large values', () => {
    expect(formatLessonDuration(3661)).toBe('61:01')
  })
})

describe('getPlainText', () => {
  it('returns empty string for undefined', () => {
    expect(getPlainText(undefined)).toBe('')
  })

  it('returns empty string for empty root', () => {
    expect(getPlainText({ root: { children: [] } } as never)).toBe('')
  })

  it('extracts text from text nodes', () => {
    const richText = {
      root: {
        children: [
          { type: 'text', text: 'Hello' },
          { type: 'text', text: 'World' },
        ],
      },
    } as never
    expect(getPlainText(richText)).toBe('Hello World')
  })

  it('extracts text from nested children', () => {
    const richText = {
      root: {
        children: [
          {
            children: [
              { type: 'text', text: 'Nested' },
              { type: 'text', text: 'Text' },
            ],
          },
        ],
      },
    } as never
    expect(getPlainText(richText)).toBe('Nested Text')
  })

  it('handles nodes without text or children', () => {
    const richText = {
      root: {
        children: [{ type: 'linebreak' }],
      },
    } as never
    expect(getPlainText(richText)).toBe('')
  })

  it('trims whitespace', () => {
    const richText = {
      root: {
        children: [{ type: 'text', text: '  hello  ' }],
      },
    } as never
    expect(getPlainText(richText)).toBe('hello')
  })
})

describe('LEVEL_MAP', () => {
  it('maps beginner', () => {
    expect(LEVEL_MAP.beginner).toBe('مبتدی')
  })

  it('maps intermediate', () => {
    expect(LEVEL_MAP.intermediate).toBe('متوسط')
  })

  it('maps advanced', () => {
    expect(LEVEL_MAP.advanced).toBe('پیشرفته')
  })
})
