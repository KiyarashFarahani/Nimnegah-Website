import type { SerializedEditorState } from 'lexical'

export type Course = {
  id: string | number
  title: string
  slug: string
  description?: SerializedEditorState
  price: number
  duration?: number
  level?: string
  status?: 'draft' | 'published' | 'coming_soon'
  courseType?: 'self-hosted' | 'spotplayer'
  thumbnail?: { url: string } | null
  category?: { name: string } | null
  lessonsCount?: number
}

export const GRADIENTS = [
  'from-blue-600/20 via-blue-500/10 to-cyan-600/20',
  'from-cyan-600/20 via-blue-500/10 to-blue-600/20',
  'from-amber-600/20 via-orange-500/10 to-red-600/20',
]

export const ACCENTS = [
  'from-blue-400 to-cyan-400',
  'from-cyan-400 to-blue-400',
  'from-amber-400 to-orange-400',
]

export const LEVEL_MAP: Record<string, string> = {
  beginner: 'مبتدی',
  intermediate: 'متوسط',
  advanced: 'پیشرفته',
}

export function formatPrice(price: number): string {
  return price.toLocaleString('fa-IR')
}

export function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const remaining = minutes % 60
    return remaining > 0 ? `${hours} ساعت و ${remaining} دقیقه` : `${hours} ساعت`
  }
  return `${minutes} دقیقه`
}

export function formatLessonDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function getPlainText(richText?: SerializedEditorState): string {
  if (!richText?.root?.children) return ''
  type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] }
  const extractText = (nodes: LexicalNode[]): string => {
    return nodes
      .map((node) => {
        if (node.type === 'text') return node.text || ''
        if (node.children) return extractText(node.children)
        return ''
      })
      .join(' ')
  }
  return extractText(richText.root.children as LexicalNode[]).trim()
}
