'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { DataTableColumnHeader } from '@/components/data-table';
import { BasicInfoCell } from './basic-info-cell';
import { SearchResult } from './search-results-table';
import { Checkbox } from '@/components/ui/checkbox';

export function useSearchNoteColumns(): ColumnDef<SearchResult>[] {
  const t = useTranslations('Xhs.SearchNote');

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'basicInfo',
      accessorKey: 'basicInfo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('basicInfo')} />
      ),
      cell: ({ row }) => <BasicInfoCell data={row.original.basicInfo} />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'publishTime',
      accessorKey: 'publishTime',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('publishTime')} />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <span className="text-sm">{row.original.publishTime}</span>
        </div>
      ),
    },
    {
      id: 'estimatedReads',
      accessorKey: 'estimatedReads',
      sortingFn: (rowA, rowB) => {
        return rowA.original.estimatedReads.raw - rowB.original.estimatedReads.raw;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('estimatedReads')} />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-sm font-medium">{row.original.estimatedReads.formatted}</div>
          <div className="text-xs text-muted-foreground">{row.original.estimatedReads.raw.toLocaleString()}</div>
        </div>
      ),
    },
    {
      id: 'interactionVolume',
      accessorKey: 'interactionVolume',
      sortingFn: (rowA, rowB) => {
        return rowA.original.interactionVolume.raw - rowB.original.interactionVolume.raw;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('interactionVolume')} />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-sm font-medium">{row.original.interactionVolume.formatted}</div>
          <div className="text-xs text-muted-foreground">{row.original.interactionVolume.raw.toLocaleString()}</div>
        </div>
      ),
    },
    {
      id: 'collections',
      accessorKey: 'collections',
      sortingFn: (rowA, rowB) => {
        return rowA.original.collections.raw - rowB.original.collections.raw;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('collections')} />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-sm font-medium">{row.original.collections.formatted}</div>
          <div className="text-xs text-muted-foreground">{row.original.collections.raw.toLocaleString()}</div>
        </div>
      ),
    },
    {
      id: 'comments',
      accessorKey: 'comments',
      sortingFn: (rowA, rowB) => {
        return rowA.original.comments.raw - rowB.original.comments.raw;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('comments')} />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-sm font-medium">{row.original.comments.formatted}</div>
          <div className="text-xs text-muted-foreground">{row.original.comments.raw.toLocaleString()}</div>
        </div>
      ),
    },
    {
      id: 'shares',
      accessorKey: 'shares',
      sortingFn: (rowA, rowB) => {
        return rowA.original.shares.raw - rowB.original.shares.raw;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('shares')} />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-sm font-medium">{row.original.shares.formatted}</div>
          <div className="text-xs text-muted-foreground">{row.original.shares.raw.toLocaleString()}</div>
        </div>
      ),
    },
    {
      id: 'likes',
      accessorKey: 'likes',
      sortingFn: (rowA, rowB) => {
        return rowA.original.likes.raw - rowB.original.likes.raw;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('likes')} />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-sm text-red-500 font-medium">{row.original.likes.formatted}</div>
          <div className="text-xs text-muted-foreground">{row.original.likes.raw.toLocaleString()}</div>
        </div>
      ),
    },
  ];
}
