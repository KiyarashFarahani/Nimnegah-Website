import type { CollectionConfig } from 'payload'

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: {
    useAsTitle: 'code',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin',
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Code shown to students (case-insensitive, auto-uppercased)',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Percentage', value: 'percent' },
        { label: 'Fixed amount (Toman)', value: 'fixed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'value',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Percent (e.g. 20) or fixed amount in Tomans (e.g. 200000)',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'scope',
      type: 'select',
      defaultValue: 'all',
      options: [
        { label: 'All courses', value: 'all' },
        { label: 'Specific courses', value: 'courses' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'courses',
      type: 'relationship',
      relationTo: 'courses',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData?.scope === 'courses',
        description: 'Courses this code applies to (when scope is "Specific courses")',
      },
    },
    {
      name: 'startsAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Coupon cannot be used before this date (blank = no start restriction)',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Coupon cannot be used after this date (blank = no expiry)',
      },
    },
    {
      name: 'maxUses',
      type: 'number',
      min: 1,
      admin: {
        position: 'sidebar',
        description: 'Maximum total number of redeems (blank = unlimited)',
      },
    },
    {
      name: 'perUserLimit',
      type: 'number',
      min: 1,
      defaultValue: 1,
      admin: {
        position: 'sidebar',
        description: 'How many times a single user can redeem this code',
      },
    },
    {
      name: 'timesUsed',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Auto-maintained count of completed orders that used this code',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Internal notes only',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.code) {
          data.code = data.code.trim().toUpperCase()
        }
        return data
      },
    ],
  },
}