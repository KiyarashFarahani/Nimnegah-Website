import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  indexes: [{ fields: ['status'] }],
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return { status: { in: ['published', 'coming_soon'] } }
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'originalPrice',
      type: 'number',
      min: 0,
      admin: {
        description: 'If set and higher than price, the original price will be shown with a strikethrough discount display',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Coming Soon', value: 'coming_soon' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Draft products are hidden from the public catalog.',
      },
    },
    {
      name: 'files',
      type: 'relationship',
      relationTo: 'product-files',
      hasMany: true,
      admin: {
        description: 'Files the buyer can download after purchase',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.title && !data?.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[\s_]+/g, '-')
            .replace(/[/\?#]/g, '')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
  },
}
