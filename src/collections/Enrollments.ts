import type { CollectionConfig } from 'payload'

export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  admin: {
    useAsTitle: 'id',
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
      name: 'progress',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 100,
    },
    {
      name: 'enrolledAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'lastAccessedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'completedLessons',
      type: 'array',
      defaultValue: [],
      admin: {
        position: 'sidebar',
        description: 'Lessons the user has completed',
      },
      fields: [
        {
          name: 'lessonId',
          type: 'number',
          required: true,
        },
        {
          name: 'completedAt',
          type: 'date',
        },
      ],
    },
  ],
}
