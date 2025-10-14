'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataTableBulkActions } from '@/components/data-table/bulk-actions';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DownloadIcon, FileSpreadsheetIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { exportToCSV, exportToJSON, formatFilename } from '@/lib/export-utils';
import JSZip from 'jszip';

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

/**
 * 导出评论数据为CSV文件
 */
async function exportCommentCSV(data: any[], filename: string) {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // 获取所有字段名
  const headers = Object.keys(data[0]);
  
  // 创建CSV内容
  const csvContent = [
    // 添加BOM以支持中文
    '\uFEFF',
    // 表头
    headers.join(','),
    // 数据行
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // 处理包含逗号、引号或换行符的值
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // 创建并下载文件
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 下载评论的图片和CSV文件，生成zip包（简化结构）
 */
async function downloadCommentImagesAndText(comments: CommentListItem[], filename: string = 'comments-content.zip') {
  if (comments.length === 0) {
    console.warn('No comments to download');
    return;
  }

  const zip = new JSZip();
  let imageIndex = 1;

  // 1. 创建CSV文件
  const csvData = comments.map(comment => ({
    '用户': comment.author.name,
    '账号': comment.author.account,
    '内容': comment.content,
    '发布时间': comment.publishTime,
    '笔记链接': comment.noteLink,
    '点赞数': comment.likes.raw,
    '回复数': comment.replies.raw,
    '图片数量': comment.pictures.length,
    '图片URLs': comment.pictures.join('; ')
  }));

  // 生成CSV内容
  const headers = Object.keys(csvData[0]);
  const csvContent = [
    '\uFEFF', // BOM for Chinese support
    headers.join(','),
    ...csvData.map(row => 
      headers.map(header => {
        const value = (row as any)[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // 添加CSV文件到zip
  zip.file('comments.csv', csvContent);

  // 2. 下载所有图片到根目录
  for (const comment of comments) {
    if (comment.pictures && comment.pictures.length > 0) {
      for (const imageUrl of comment.pictures) {
        try {
          const response = await fetch(imageUrl);
          if (response.ok) {
            const blob = await response.blob();
            const imageFilename = `image_${imageIndex}.${getFileExtension(imageUrl)}`;
            zip.file(imageFilename, blob);
            imageIndex++;
          }
        } catch (error) {
          console.error(`Failed to download image ${imageUrl}:`, error);
        }
      }
    }
  }

  // 生成并下载zip文件
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 从URL获取文件扩展名
 */
function getFileExtension(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const extension = pathname.split('.').pop();
    return extension || 'jpg';
  } catch {
    return 'jpg';
  }
}

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
      // 将评论数据转换为CSV格式，使用多语言字段名
      const csvData = selectedData.map(comment => ({
        [t('user')]: comment.author.name,
        [t('account')]: comment.author.account,
        [t('content')]: comment.content,
        [t('time')]: comment.publishTime,
        [t('noteLink')]: comment.noteLink,
        [t('likes')]: comment.likes.raw,
        [t('replies')]: comment.replies.raw,
        [t('pictures')]: comment.pictures.length,
        [t('pictures') + ' URLs']: comment.pictures.join('; ') // 添加图片URL字段
      }));
      
      // 直接使用简单的CSV导出逻辑
      await exportCommentCSV(csvData, filename);
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
      exportToJSON(selectedData as any, filename);
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
      await downloadCommentImagesAndText(selectedData, filename);
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
  const [preview, setPreview] = useState<string[] | null>(null)

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
                onClick={() => setPreview(pictures)}
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


