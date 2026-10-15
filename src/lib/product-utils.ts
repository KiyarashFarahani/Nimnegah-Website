import type { SerializedEditorState } from 'lexical'

export type ProductFile = {
  id: number
  filename: string
  filesize?: number | null
  mimeType?: string | null
}

export type Product = {
  id: string | number
  title: string
  slug: string
  description?: SerializedEditorState
  price: number
  originalPrice?: number | null
  status?: 'draft' | 'published' | 'coming_soon'
  thumbnail?: { url: string } | null
  category?: { name: string } | null
  files?: ProductFile[]
  filesCount?: number
}

export function formatFileSize(bytes?: number | null): string {
  if (bytes == null || bytes <= 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  const rounded = size >= 10 || unitIndex === 0 ? Math.round(size) : Math.round(size * 10) / 10
  return `${rounded.toLocaleString('fa-IR')} ${units[unitIndex]}`
}
