import type { CollectionConfig } from 'payload'

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: async ({ req: { user, payload } }) => {
      if (user?.role === 'admin') return true
      const publishedCourses = await payload.find({
        collection: 'courses',
        where: { status: { in: ['published', 'coming_soon'] } },
        limit: 1000,
      })
      return { course: { in: publishedCourses.docs.map((c) => c.id) } }
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
