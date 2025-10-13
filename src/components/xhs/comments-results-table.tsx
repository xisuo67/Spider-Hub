'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomPagination } from './custom-pagination';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

// 评论数据结构
export interface CommentResult {
  id: string;
  author: {
    avatar: string;
    name: string;
    level: number; // 用户等级
  };
  content: string;
  publishTime: string;
  likes: {
    formatted: string;
    raw: number;
  };
  replies: {
    formatted: string;
    raw: number;
  };
  isAuthor: boolean; // 是否为作者回复
  isPinned: boolean; // 是否为置顶评论
}

// 评论列定义
export function useCommentsColumns(): ColumnDef<CommentResult>[] {
  const t = useTranslations('Xhs.Comments');

  return [
    {
      id: 'author',
      accessorKey: 'author',
      header: ({ column }) => (
        <div className="text-center">
          <span className="text-sm font-medium">{t('author')}</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <img
            src={row.original.author.avatar}
            alt={row.original.author.name}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <div className="text-sm font-medium">{row.original.author.name}</div>
            <div className="text-xs text-muted-foreground">Lv.{row.original.author.level}</div>
          </div>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'content',
      accessorKey: 'content',
      header: ({ column }) => (
        <div className="text-center">
          <span className="text-sm font-medium">{t('content')}</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="max-w-md">
          <p className="text-sm">{row.original.content}</p>
          {row.original.isAuthor && (
            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
              {t('authorReply')}
            </span>
          )}
          {row.original.isPinned && (
            <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full mt-1 ml-1">
              {t('pinned')}
            </span>
          )}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'publishTime',
      accessorKey: 'publishTime',
      header: ({ column }) => (
        <div className="text-center">
          <span className="text-sm font-medium">{t('publishTime')}</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.publishTime}</span>
      ),
    },
    {
      id: 'likes',
      accessorKey: 'likes',
      sortingFn: (rowA, rowB) => {
        return rowA.original.likes.raw - rowB.original.likes.raw;
      },
      header: ({ column }) => (
        <div className="text-center">
          <span className="text-sm font-medium">{t('likes')}</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-sm font-medium">{row.original.likes.formatted}</div>
          <div className="text-sm text-muted-foreground">{row.original.likes.raw.toLocaleString()}</div>
        </div>
      ),
    },
    {
      id: 'replies',
      accessorKey: 'replies',
      sortingFn: (rowA, rowB) => {
        return rowA.original.replies.raw - rowB.original.replies.raw;
      },
      header: ({ column }) => (
        <div className="text-center">
          <span className="text-sm font-medium">{t('replies')}</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-sm font-medium">{row.original.replies.formatted}</div>
          <div className="text-sm text-muted-foreground">{row.original.replies.raw.toLocaleString()}</div>
        </div>
      ),
    },
  ];
}

interface CommentsResultsTableProps {
  loading?: boolean;
  data?: CommentResult[];
  columns: ColumnDef<CommentResult>[];
  hasMore?: boolean;
  currentPage?: number;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

export function CommentsResultsTable({ 
  loading = false, 
  data = [], 
  columns,
  hasMore = false,
  currentPage = 1,
  onNextPage,
  onPrevPage
}: CommentsResultsTableProps) {
  const t = useTranslations('Xhs.Comments');
  
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'likes', desc: true }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  if (loading) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={`loading-header-${index}`}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {columns.map((column, colIndex) => {
                  if (column.id === 'author') {
                    return (
                      <TableCell key={`${index}-${colIndex}`}>
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                        </div>
                      </TableCell>
                    );
                  }
                  
                  if (column.id === 'content') {
                    return (
                      <TableCell key={`${index}-${colIndex}`}>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <div className="flex gap-1">
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-12 rounded-full" />
                          </div>
                        </div>
                      </TableCell>
                    );
                  }
                  
                  if (column.id === 'publishTime') {
                    return (
                      <TableCell key={`${index}-${colIndex}`}>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    );
                  }
                  
                  if (['likes', 'replies'].includes(column.id as string)) {
                    return (
                      <TableCell key={`${index}-${colIndex}`} className="text-center">
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-12 mx-auto" />
                          <Skeleton className="h-4 w-16 mx-auto" />
                        </div>
                      </TableCell>
                    );
                  }
                  
                  return (
                    <TableCell key={`${index}-${colIndex}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border">
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">{t('noResults')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CustomPagination
        hasMore={hasMore}
        loading={loading}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
        currentPage={currentPage}
        canGoBack={currentPage > 1}
      />
    </div>
  );
}
