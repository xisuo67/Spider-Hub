'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { DataTableColumnHeader } from '@/components/data-table';
import { BasicInfoCell } from './basic-info-cell';
import { SearchResult } from './search-results-table';
import { Checkbox } from '@/components/ui/checkbox';
import { ResourceCell } from '@/components/xhs/resource-cell';

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
      id: 'resources',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('resources')} />
      ),
      cell: ({ row }) => (
        <ResourceCell
          images={row.original.images_list?.map((i) => ({ url: i.url }))}
          videos={row.original.video_list?.map((v) => ({ master_url: v.master_url, cover_image: v.cover_image }))}
          livePhotos={row.original.live_photo_list?.map((l) => ({ url: l.url }))}
          label={t('resources')}
        />
      ),
      enableSorting: false,
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
      id: 'estimatedReads',
      accessorKey: 'estimatedReads',
      sortingFn: (rowA, rowB) => {
        return rowA.original.estimatedReads.raw - rowB.original.estimatedReads.raw;
      },
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title={t('estimatedReads')} 
          className="justify-center"
        />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-sm font-medium">{row.original.estimatedReads.formatted}</div>
          <div className="text-sm text-muted-foreground">{row.original.estimatedReads.raw.toLocaleString()}</div>
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
        <DataTableColumnHeader 
          column={column} 
          title={t('interactionVolume')} 
          className="justify-center"
        />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-sm font-medium">{row.original.interactionVolume.formatted}</div>
          <div className="text-sm text-muted-foreground">{row.original.interactionVolume.raw.toLocaleString()}</div>
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
        <DataTableColumnHeader 
          column={column} 
          title={t('collections')} 
          className="justify-center"
        />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-sm font-medium">{row.original.collections.formatted}</div>
          <div className="text-sm text-muted-foreground">{row.original.collections.raw.toLocaleString()}</div>
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
        <div className="text-center">
          <DataTableColumnHeader column={column} title={t('comments')} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-sm font-medium">{row.original.comments.formatted}</div>
          <div className="text-sm text-muted-foreground">{row.original.comments.raw.toLocaleString()}</div>
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
        <div className="text-center">
          <DataTableColumnHeader column={column} title={t('shares')} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-sm font-medium">{row.original.shares.formatted}</div>
          <div className="text-sm text-muted-foreground">{row.original.shares.raw.toLocaleString()}</div>
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
        <div className="text-center">
          <DataTableColumnHeader column={column} title={t('likes')} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <div className="text-sm text-red-500 font-medium">{row.original.likes.formatted}</div>
          <div className="text-sm text-muted-foreground">{row.original.likes.raw.toLocaleString()}</div>
        </div>
      ),
    },
  ];
}
