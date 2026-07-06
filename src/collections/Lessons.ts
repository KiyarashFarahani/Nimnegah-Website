import type { CollectionConfig } from 'payload'

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'video',
      type: 'relationship',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'duration',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Duration in seconds',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isFree',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Allow non-enrolled users to watch this lesson',
      },
    },
  ],
}
