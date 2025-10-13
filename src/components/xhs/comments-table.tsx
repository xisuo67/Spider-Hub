'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';

export interface CommentListItem {
  id: string
  author: {
    avatar: string
    name: string
    account: string
  }
  content: string
  pictures: string[]
  publishTime: string
  noteLink: string
  likes: { formatted: string; raw: number }
  replies: { formatted: string; raw: number }
}

interface CommentsTableProps {
  data: CommentListItem[]
}

export function CommentsTable({ data }: CommentsTableProps) {
  const t = useTranslations('Xhs.CommentList')
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [preview, setPreview] = useState<string[] | null>(null)

  const allSelected = data.length > 0 && data.every((d) => selected[d.id])
  const selectedCount = data.filter((d) => selected[d.id]).length

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {}
    if (checked) data.forEach((d) => (next[d.id] = true))
    setSelected(next)
  }

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }))
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={(v) => toggleAll(Boolean(v))} aria-label={t('selectAll')} />
              </TableHead>
              <TableHead>{t('user')}</TableHead>
              <TableHead>{t('content')}</TableHead>
              <TableHead>{t('pictures')}</TableHead>
              <TableHead>{t('time')}</TableHead>
              <TableHead>{t('noteLink')}</TableHead>
              <TableHead className="text-right">{t('likes')}</TableHead>
              <TableHead className="text-right">{t('replies')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  {t('noResults')}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="w-10">
                    <Checkbox checked={!!selected[item.id]} onCheckedChange={(v) => toggleOne(item.id, Boolean(v))} aria-label={item.id} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* 头像 */}
                      {/* next/image 需要跨域允许，这里使用原生 img 更稳妥 */}
                      <img src={item.author.avatar} alt={item.author.name} className="h-8 w-8 rounded-full object-cover" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.author.name}</span>
                        <span className="text-xs text-muted-foreground">{item.author.account}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="text-sm whitespace-pre-wrap break-words max-w-[520px]">{item.content}</div>
                  </TableCell>
                  <TableCell className="align-top">
                    {item.pictures && item.pictures.length > 0 && (
                      <div className="flex flex-wrap gap-2 max-w-[320px]">
                        {item.pictures.map((url, idx) => (
                          <button key={idx} className="h-14 w-14 overflow-hidden rounded" onClick={() => setPreview(item.pictures)}>
                            <img src={url} alt="pic" className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="align-top text-sm">{item.publishTime}</TableCell>
                  <TableCell className="align-top text-sm truncate max-w-[200px]">
                    {item.noteLink && (
                      <a href={item.noteLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {item.noteLink}
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="text-right align-top">
                    <div className="text-sm font-medium">{item.likes.formatted}</div>
                  </TableCell>
                  <TableCell className="text-right align-top">
                    <div className="text-sm font-medium">{item.replies.formatted}</div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{t('selectedCount', { count: selectedCount })}</div>
          <div className="flex items-center gap-2">
            <Button size="sm">{t('exportCSV')}</Button>
            <Button size="sm" variant="outline">{t('downloadDetails')}</Button>
            <Button size="sm" variant="outline">{t('downloadImages')}</Button>
          </div>
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t('previewTitle')}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="grid grid-cols-3 gap-3">
              {preview.map((url, i) => (
                <img key={i} src={url} alt="preview" className="w-full h-40 object-cover rounded" />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


