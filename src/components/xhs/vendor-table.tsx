'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { type VendorDisplayItem } from '@/lib/vendor-data-transformer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, getCoreRowModel, RowSelectionState, useReactTable, flexRender } from '@tanstack/react-table';

interface VendorTableProps {
  loading: boolean;
  data: VendorDisplayItem[];
  onSelectionChange: (selected: VendorDisplayItem[]) => void;
  onTableReady?: (table: ReturnType<typeof useReactTable<VendorDisplayItem>>) => void;
}

export function VendorTable({ loading, data, onSelectionChange, onTableReady }: VendorTableProps) {
  const t = useTranslations('Xhs.Vendor');
  const locale = useLocale();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
      style: 'currency',
      currency: 'CNY',
    }).format(price);
  };

  const columns = useMemo<ColumnDef<VendorDisplayItem>[]>(() => [
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
          aria-label={`Select ${row.original.title}`}
        />
      ),
    },
    {
      id: 'basicInfo',
      header: () => t('basicInfo'),
      cell: ({ row }) => {
        const vendor = row.original;
        return (
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <img
                src={vendor.cover}
                alt={vendor.title}
                className="w-28 h-34 object-cover rounded-md border"
              />
              {vendor.images && vendor.images.length > 1 && (
                <Badge variant="secondary" className="absolute -top-2 -right-2 text-[10px]">
                  +{vendor.images.length - 1}
                </Badge>
              )}
            </div>
            <div className="space-y-2 min-w-0">
              <div className="font-medium line-clamp-2 text-sm md:text-[15px]">{vendor.title}</div>
              {vendor.desc && (
                <div className="text-xs text-muted-foreground line-clamp-2">{vendor.desc}</div>
              )}
              {(vendor.sellerScore || vendor.itemAnalysisDataText) && (
                <div className="text-xs text-muted-foreground">{vendor.sellerScore} {vendor.itemAnalysisDataText}</div>
              )}
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={vendor.logo} alt={vendor.sellername} />
                  <AvatarFallback>{vendor.sellername?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{vendor.sellername}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: () => t('priceLabel'),
      cell: ({ row }) => <span className="font-semibold">{formatPrice(row.original.price)}</span>,
    },
    {
      accessorKey: 'goodsDistributeLocation',
      header: () => t('location'),
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.goodsDistributeLocation}</span>,
    },
    {
      accessorKey: 'fee',
      header: () => t('fee'),
      cell: ({ row }) => <span className="text-sm">{row.original.fee}</span>,
    },
    {
      id: 'service',
      header: () => t('service'),
      cell: ({ row }) => (
        row.original.service && row.original.service.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {row.original.service.map((service, index) => (
              <div key={index} className="flex items-center space-x-1 text-xs">
                <img src={service.icon} alt={service.name} className="w-3 h-3" />
                <span className="text-muted-foreground">{service.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )
      ),
    },
  ], [t, locale]);

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    if (onTableReady) onTableReady(table as any);
    const selected = table.getSelectedRowModel().rows.map(r => r.original);
    onSelectionChange(selected);
  }, [rowSelection, table, onSelectionChange, onTableReady]);

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
                {columns.map((column, colIndex) => (
                  <TableCell key={`${index}-${colIndex}`}>
                    <Skeleton className="h-4 w-full" />
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

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id} className={header.column.id === 'basicInfo' ? 'min-w-[360px]' : ''}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
