'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { DataTableColumnHeader } from '@/components/data-table';
import { BasicInfoCell } from './basic-info-cell';
import { SearchResult } from './search-results-table';

export function useSearchNoteColumns(): ColumnDef<SearchResult>[] {
  const t = useTranslations('Xhs.SearchNote');

  return [
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
        <span className="text-sm">{row.original.publishTime}</span>
      ),
    },
    {
      id: 'interactionVolume',
      accessorKey: 'interactionVolume',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('interactionVolume')} />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.interactionVolume}</span>
      ),
    },
    {
      id: 'estimatedReads',
      accessorKey: 'estimatedReads',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('estimatedReads')} />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.estimatedReads}</span>
      ),
    },
    {
      id: 'collections',
      accessorKey: 'collections',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('collections')} />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.collections}</span>
      ),
    },
    {
      id: 'comments',
      accessorKey: 'comments',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('comments')} />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.comments}</span>
      ),
    },
    {
      id: 'shares',
      accessorKey: 'shares',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('shares')} />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.shares}</span>
      ),
    },
    {
      id: 'likes',
      accessorKey: 'likes',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('likes')} />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-red-500 font-medium">{row.original.likes}</span>
      ),
    },
  ];
}
