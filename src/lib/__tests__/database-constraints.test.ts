import { describe, expect, it } from 'vitest'
import { Enrollments } from '@/collections/Enrollments'
import { Orders } from '@/collections/Orders'
import { ProductPurchases } from '@/collections/ProductPurchases'
import { ProductFiles } from '@/collections/ProductFiles'
import { migrations } from '@/migrations'
import * as productMigration from '@/migrations/20261014_000001'

describe('database concurrency constraints', () => {
  it('enforces one enrollment per user and course', () => {
    expect(Enrollments.indexes).toContainEqual({
      fields: ['user', 'course'],
      unique: true,
    })
  })

  it('enforces one purchase per user and product', () => {
    expect(ProductPurchases.indexes).toContainEqual({
      fields: ['user', 'product'],
      unique: true,
    })
  })

  it.each(['authority', 'idempotencyKey'])('makes order %s unique', (name) => {
    expect(Orders.fields).toContainEqual(
      expect.objectContaining({ name, unique: true }),
    )
  })

  it('supports both course and product orders', () => {
    expect(Orders.fields).toContainEqual(
      expect.objectContaining({ name: 'course' }),
    )
    expect(Orders.fields).toContainEqual(
      expect.objectContaining({ name: 'product' }),
    )
  })

  it('keeps product files out of public read', () => {
    const read = ProductFiles.access?.read
    expect(typeof read).toBe('function')
    expect((read as (args: unknown) => unknown)({ req: { user: null } })).toBe(false)
    expect((read as (args: unknown) => unknown)({ req: { user: { role: 'admin' } } })).toBe(true)
  })

  it('allows any MIME type for digital product files', () => {
    expect(ProductFiles.upload).not.toHaveProperty('mimeTypes')
  })

  it('registers the product migration', () => {
    expect(migrations.map(({ name }) => name)).toContain('20261014_000001')
  })

  it('refuses to roll back persistent product and purchase data', async () => {
    await expect(productMigration.down()).rejects.toThrow('cannot be rolled back without data loss')
  })
})
