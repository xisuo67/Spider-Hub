'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { SimpleToolbar } from './simple-toolbar';
import { CustomPagination } from './custom-pagination';
import { DataTableBulkActions } from '@/components/data-table';
import { BulkActions } from './bulk-actions';
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
  interactionVolume: string;
  estimatedReads: string;
  collections: string;
  comments: string;
  shares: string;
  likes: string;
}

interface SearchResultsTableProps {
  loading?: boolean;
  data?: SearchResult[];
  columns: ColumnDef<SearchResult>[];
  hasMore?: boolean;
  currentPage?: number;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

export function SearchResultsTable({ 
  loading = false, 
  data = [], 
  columns,
  hasMore = false,
  currentPage = 1,
  onNextPage,
  onPrevPage
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
            {Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={index}>
                {columns.map((column, colIndex) => (
                  <TableCell key={`${index}-${colIndex}`}>
                    <Skeleton className="h-16 w-full" />
                  </TableCell>
                ))}
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
    console.log('Exporting CSV for:', selectedRows.map(row => row.original.id));
  };

  const handleDownloadDetails = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    console.log('Downloading details for:', selectedRows.map(row => row.original.id));
  };

  const handleDownloadImages = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    console.log('Downloading images for:', selectedRows.map(row => row.original.id));
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
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
      
      {onNextPage && onPrevPage && (
        <CustomPagination
          hasMore={hasMore}
          loading={loading}
          onNextPage={onNextPage}
          onPrevPage={onPrevPage}
          currentPage={currentPage}
          canGoBack={currentPage > 1}
        />
      )}
    </div>
  );
}
