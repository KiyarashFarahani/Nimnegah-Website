import { describe, expect, it } from 'vitest'
import { Enrollments } from '@/collections/Enrollments'
import { Orders } from '@/collections/Orders'

describe('database concurrency constraints', () => {
  it('enforces one enrollment per user and course', () => {
    expect(Enrollments.indexes).toContainEqual({
      fields: ['user', 'course'],
      unique: true,
    })
  })

  it.each(['authority', 'idempotencyKey'])('makes order %s unique', (name) => {
    expect(Orders.fields).toContainEqual(
      expect.objectContaining({ name, unique: true }),
    )
  })
})
