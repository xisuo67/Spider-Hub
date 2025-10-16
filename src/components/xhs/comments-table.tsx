'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { DataTableBulkActions } from '@/components/data-table/bulk-actions';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DownloadIcon, FileSpreadsheetIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatFilename, downloadCommentImages, exportCommentsToCSV, exportCommentsToJSON, downloadCommentBundle } from '@/lib/export-utils';
import { ImageLightbox, LightboxSlide } from '@/components/xhs/image-lightbox';

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

const columnHelper = createColumnHelper<CommentListItem>()

// 移除旧的内置导出与下载实现，统一使用 lib/export-utils 中的方法

interface CommentBulkActionsProps {
  selectedData: CommentListItem[];
  onExportCSV: () => void;
  onDownloadDetails: () => void;
  onDownloadImages: () => void;
}

function CommentBulkActions({
  selectedData,
  onExportCSV,
  onDownloadDetails,
  onDownloadImages
}: CommentBulkActionsProps) {
  const t = useTranslations('Xhs.CommentList');
  const locale = useLocale();
  const [loading, setLoading] = useState({
    csv: false,
    json: false,
    images: false
  });

  const handleExportCSV = async () => {
    if (loading.csv) return;
    
    setLoading(prev => ({ ...prev, csv: true }));
    try {
      const filename = formatFilename('xhs-comments', 'csv');
      exportCommentsToCSV(selectedData, filename, locale);
      toast.success(t('exportingCSV', { count: selectedData.length }));
      onExportCSV();
    } catch (error) {
      console.error('CSV export failed:', error);
      toast.error(t('exportFailed'));
    } finally {
      setLoading(prev => ({ ...prev, csv: false }));
    }
  };

  const handleDownloadDetails = async () => {
    if (loading.json) return;
    
    setLoading(prev => ({ ...prev, json: true }));
    try {
      const filename = formatFilename('xhs-comments-details', 'json');
      exportCommentsToJSON(selectedData, filename);
      toast.success(t('downloadingDetails', { count: selectedData.length }));
      onDownloadDetails();
    } catch (error) {
      console.error('JSON export failed:', error);
      toast.error(t('exportFailed'));
    } finally {
      setLoading(prev => ({ ...prev, json: false }));
    }
  };

  const handleDownloadImages = async () => {
    if (loading.images) return;
    
    setLoading(prev => ({ ...prev, images: true }));
    try {
      const filename = formatFilename('xhs-comments-content', 'zip');
      await downloadCommentBundle(selectedData, filename, locale);
      toast.success(t('downloadingImages', { count: selectedData.length }));
      onDownloadImages();
    } catch (error) {
      console.error('Images export failed:', error);
      toast.error(t('exportFailed'));
    } finally {
      setLoading(prev => ({ ...prev, images: false }));
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportCSV}
              disabled={loading.csv || loading.json || loading.images}
              className="flex items-center gap-2"
            >
              {loading.csv ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheetIcon className="h-4 w-4" />
              )}
              {loading.csv ? t('exporting') : t('exportCSV')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('exportCSVTooltip')}</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadDetails}
              disabled={loading.csv || loading.json || loading.images}
              className="flex items-center gap-2"
            >
              {loading.json ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <DownloadIcon className="h-4 w-4" />
              )}
              {loading.json ? t('exporting') : t('downloadDetails')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('downloadDetailsTooltip')}</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadImages}
              disabled={loading.csv || loading.json || loading.images}
              className="flex items-center gap-2"
            >
              {loading.images ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <DownloadIcon className="h-4 w-4" />
              )}
              {loading.images ? t('exporting') : t('downloadImages')}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('downloadImagesTooltip')}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export function CommentsTable({ data }: CommentsTableProps) {
  const t = useTranslations('Xhs.CommentList')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxSlides, setLightboxSlides] = useState<LightboxSlide[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const handleOpenPreview = (pictures: string[], startIndex: number = 0) => {
    const slides: LightboxSlide[] = pictures.map(url => ({
      src: url,
      type: 'image' as const
    }))
    setLightboxSlides(slides)
    setLightboxIndex(startIndex)
    setLightboxOpen(true)
  }

  const columns = [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t('selectAll')}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={row.original.id}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor('author', {
      header: t('user'),
      cell: ({ row }) => {
        const author = row.original.author
        return (
          <div className="flex items-center gap-3">
            <img src={author.avatar} alt={author.name} className="h-8 w-8 rounded-full object-cover" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{author.name}</span>
              <span className="text-xs text-muted-foreground">{author.account}</span>
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor('content', {
      header: t('content'),
      cell: ({ row }) => (
        <div className="text-sm whitespace-pre-wrap break-words max-w-[520px]">
          {row.original.content}
        </div>
      ),
    }),
    columnHelper.accessor('pictures', {
      header: t('pictures'),
      cell: ({ row }) => {
        const pictures = row.original.pictures
        return pictures && pictures.length > 0 ? (
          <div className="flex flex-wrap gap-2 max-w-[320px]">
            {pictures.map((url, idx) => (
              <button 
                key={idx} 
                className="h-14 w-14 overflow-hidden rounded" 
                onClick={() => handleOpenPreview(pictures, idx)}
              >
                <img src={url} alt="pic" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null
      },
    }),
    columnHelper.accessor('publishTime', {
      header: t('time'),
      cell: ({ row }) => (
        <div className="text-sm">{row.original.publishTime}</div>
      ),
    }),
    columnHelper.accessor('noteLink', {
      header: t('noteLink'),
      cell: ({ row }) => {
        const noteLink = row.original.noteLink
        return noteLink ? (
          <a 
            href={noteLink} 
            target="_blank" 
            rel="noreferrer" 
            className="text-blue-600 hover:underline text-sm truncate max-w-[200px] block"
          >
            {noteLink}
          </a>
        ) : null
      },
    }),
    columnHelper.accessor('likes', {
      header: () => <div className="text-right">{t('likes')}</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <div className="text-sm font-medium">{row.original.likes.formatted}</div>
        </div>
      ),
    }),
    columnHelper.accessor('replies', {
      header: () => <div className="text-right">{t('replies')}</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <div className="text-sm font-medium">{row.original.replies.formatted}</div>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
  })

  return (
    <div className="space-y-3">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={header.id === 'select' ? 'w-10' : ''}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
                ))}
            </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.id === 'select' ? 'w-10' : 'align-top'}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {t('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTableBulkActions table={table} entityName="comment">
        <CommentBulkActions
          selectedData={table.getFilteredSelectedRowModel().rows.map(row => row.original)}
          onExportCSV={() => {
            // 可以在这里添加额外的逻辑，比如清除选择
          }}
          onDownloadDetails={() => {
            // 可以在这里添加额外的逻辑
          }}
          onDownloadImages={() => {
            // 可以在这里添加额外的逻辑
          }}
        />
      </DataTableBulkActions>

      <ImageLightbox
        slides={lightboxSlides}
        open={lightboxOpen}
        index={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}


