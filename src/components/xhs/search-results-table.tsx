'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { SimpleToolbar } from './simple-toolbar';
import { LoadMoreButton } from './load-more-button';
import { DataTableBulkActions } from '@/components/data-table';
import { BulkActions } from './bulk-actions';
import { BasicInfoSkeleton } from './basic-info-skeleton';
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

export interface SearchResult {
  id: string;
  basicInfo: {
    coverImage: string;
    type: 'video' | 'note';
    duration?: string;
    title: string;
    desc: string;
    author: {
      avatar: string;
      name: string;
    };
  };
  images_list?: Array<{
    url: string; // 从url_size_large获取，去除?后参数
  }>;
  video_list?: Array<{
    cover_image: string; // 从video.media.stream.h265.master_url获取，去除?后参数
    master_url: string; // 优先h265格式，按height选择最高分辨率
    backup_urls: string[];
  }>; // 仅当type为video时提供
  live_photo_list?: Array<{
    url: string; // 从live_photo.media.stream.h265.master_url获取
  }>; // 复杂对象，不一定存在
  publishTime: string;
  interactionVolume: {
    formatted: string;
    raw: number;
  };
  estimatedReads: {
    formatted: string;
    raw: number;
  };
  collections: {
    formatted: string;
    raw: number;
  };
  comments: {
    formatted: string;
    raw: number;
  };
  shares: {
    formatted: string;
    raw: number;
  };
  likes: {
    formatted: string;
    raw: number;
  };
}

interface SearchResultsTableProps {
  loading?: boolean;
  data?: SearchResult[];
  columns: ColumnDef<SearchResult>[];
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export function SearchResultsTable({ 
  loading = false, 
  data = [], 
  columns,
  hasMore = false,
  loadingMore = false,
  onLoadMore
}: SearchResultsTableProps) {
  const t = useTranslations('Xhs.SearchNote');
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
    manualPagination: true, // 禁用内置分页，使用自定义分页
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
                  // 为不同列提供不同的骨架屏
                  if (column.id === 'select') {
                    return (
                      <TableCell key={`${index}-${colIndex}`}>
                        <Skeleton className="h-4 w-4 rounded" />
                      </TableCell>
                    );
                  }
                  
                  if (column.id === 'basicInfo') {
                    return (
                      <TableCell key={`${index}-${colIndex}`}>
                        <BasicInfoSkeleton />
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
                  
                  // 数值列的骨架屏
                  if (['estimatedReads', 'interactionVolume', 'collections', 'comments', 'shares', 'likes'].includes(column.id as string)) {
                    return (
                      <TableCell key={`${index}-${colIndex}`} className="text-center">
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-12 mx-auto" />
                          <Skeleton className="h-4 w-16 mx-auto" />
                        </div>
                      </TableCell>
                    );
                  }
                  
                  // 默认骨架屏
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

  const handleExportCSV = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
  };

  const handleDownloadDetails = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
  };

  const handleDownloadImages = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
  };

  return (
    <div className="space-y-4">
      <SimpleToolbar table={table} />
      
      <DataTableBulkActions 
        table={table} 
        entityName="data"
      >
        <BulkActions
          selectedCount={table.getFilteredSelectedRowModel().rows.length}
          selectedData={table.getFilteredSelectedRowModel().rows.map(row => row.original)}
          onExportCSV={handleExportCSV}
          onDownloadDetails={handleDownloadDetails}
          onDownloadImages={handleDownloadImages}
        />
      </DataTableBulkActions>
      
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow 
                  key={row.id} 
                  data-state={row.getIsSelected() && 'selected'}
                  className={index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}
                >
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
      
      {onLoadMore && (
        <LoadMoreButton
          hasMore={hasMore}
          loading={loadingMore}
          onLoadMore={onLoadMore}
        />
      )}
    </div>
  );
}
