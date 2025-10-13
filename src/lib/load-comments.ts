import { type CommentResult } from '@/components/xhs/comments-results-table'
import { normalizeXhsCdnUrl } from './url'

type RawWebPage = {
    data?: {
        comments?: any[]
        comment_count?: number
        has_more?: boolean
        cursor?: string
      }
}

export async function loadMockComments(page: 1 | 2 = 1): Promise<CommentResult[]> {
  // 使用静态导入，避免动态导入在构建时未被打包
  let mod: RawWebPage
  if (page === 1) {
    mod = await import('../app/[locale]/(protected)/xhs/searchnote/comments/webpage1.json') as any
  } else {
    mod = await import('../app/[locale]/(protected)/xhs/searchnote/comments/webpage2.json') as any
  }
  return transformWebPageToComments(mod)
}

export function transformWebPageToComments(raw: RawWebPage): CommentResult[] {
  const list = raw?.data?.comments || []
  return list.map((c: any, idx: number) => {
    const pictures: string[] = Array.isArray(c.pictures)
      ? c.pictures
          .map((p: any) => normalizeXhsCdnUrl(p?.url))
          .filter(Boolean)
      : []

    return {
      id: String(c.id || c.note_id || idx),
      author: {
        avatar: c.user?.images || '',
        name: c.user?.nickname || '',
        level: 0,
        account: c.user?.red_id || '',
      },
      content: c.content || c.desc || c.text || '',
      pictures,
      publishTime: formatTime(c.time),
      likes: { formatted: String(c.like_count ?? 0), raw: Number(c.like_count ?? 0) },
      replies: { formatted: String(c.sub_comment_count ?? 0), raw: Number(c.sub_comment_count ?? 0) },
      isAuthor: c.user?.current_user === 'true' || false,
      isPinned: Boolean(c.is_top || c.top || false),
      noteLink: '',
    }
  })
}

function formatTime(ts: number | string): string {
  if (!ts) return ''
  const n = typeof ts === 'string' ? Number(ts) : ts
  const date = String(n).length > 10 ? new Date(n) : new Date(Number(n) * 1000)
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
}


