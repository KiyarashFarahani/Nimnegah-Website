import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { user: { equals: user.id } }
    },
    create: () => false,
    update: () => false,
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      admin: {
        description: 'Final charged amount in Tomans (after any discount)',
      },
    },
    {
      name: 'originalAmount',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Course price before discount (for audit)',
      },
    },
    {
      name: 'discountAmount',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Amount deducted by the discount code',
      },
    },
    {
      name: 'coupon',
      type: 'relationship',
      relationTo: 'coupons',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'zarinpalRefId',
      type: 'text',
    },
    {
      name: 'authority',
      type: 'text',
    },
  ],
  hooks: {
    afterChange: [
      ({ doc, previousDoc, req }) => {
        if (doc.status !== 'completed') return
        if (previousDoc?.status === 'completed') return
        if (!doc.coupon) return

        const couponId =
          typeof doc.coupon === 'object' && doc.coupon !== null
            ? doc.coupon.id
            : doc.coupon

        if (!couponId) return

        req.payload
          .findByID({
            collection: 'coupons',
            id: couponId,
            depth: 0,
            overrideAccess: true,
          })
          .then((coupon) => {
            const current =
              typeof coupon?.timesUsed === 'number' ? coupon.timesUsed : 0
            return req.payload.update({
              collection: 'coupons',
              id: couponId,
              data: { timesUsed: current + 1 },
              overrideAccess: true,
            })
          })
          .catch((err) => {
            console.error('[Coupon] Failed to increment timesUsed:', err)
          })
      },
    ],
  },
}
