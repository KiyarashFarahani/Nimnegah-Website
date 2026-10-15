import type { CollectionConfig } from 'payload'

export const ProductFiles: CollectionConfig = {
  slug: 'product-files',
  admin: {
    useAsTitle: 'filename',
    description: 'Downloadable files belonging to digital products (never publicly accessible)',
  },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin',
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  upload: {
    staticDir: 'protected/products',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
}
