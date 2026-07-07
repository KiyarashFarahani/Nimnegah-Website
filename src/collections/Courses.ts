import type { CollectionConfig } from 'payload'

export const Courses: CollectionConfig = {
  slug: 'courses',
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
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'level',
      type: 'select',
      defaultValue: 'beginner',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'duration',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Total duration in minutes',
        position: 'sidebar',
      },
    },
    {
      name: 'courseType',
      type: 'select',
      defaultValue: 'self-hosted',
      options: [
        { label: 'Self-hosted videos', value: 'self-hosted' },
        { label: 'SpotPlayer', value: 'spotplayer' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Where the course videos are hosted',
      },
    },
    {
      name: 'spotplayerCourseIds',
      type: 'array',
      admin: {
        description: 'SpotPlayer course IDs to include in the license (from SpotPlayer panel)',
        condition: (_, siblingData) => siblingData?.courseType === 'spotplayer',
      },
      fields: [
        {
          name: 'courseId',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.title && !data?.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
  },
}
