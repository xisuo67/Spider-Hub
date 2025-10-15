'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { type VendorDisplayItem } from '@/lib/vendor-data-transformer';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface VendorTableProps {
  loading: boolean;
  data: VendorDisplayItem[];
  onSelectionChange: (selected: VendorDisplayItem[]) => void;
}

export function VendorTable({ loading, data, onSelectionChange }: VendorTableProps) {
  const t = useTranslations('Xhs.Vendor');
  const locale = useLocale();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = data.map(item => item.id);
      setSelectedRows(allIds);
      onSelectionChange(data);
    } else {
      setSelectedRows([]);
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    let newSelectedRows: string[];
    if (checked) {
      newSelectedRows = [...selectedRows, id];
    } else {
      newSelectedRows = selectedRows.filter(rowId => rowId !== id);
    }
    setSelectedRows(newSelectedRows);
    
    const selectedData = data.filter(item => newSelectedRows.includes(item.id));
    onSelectionChange(selectedData);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
      style: 'currency',
      currency: 'CNY',
    }).format(price);
  };


  if (loading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-start space-x-4">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">{t('noResults')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedRows.length > 0 && selectedRows.length === data.length}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="min-w-[360px]">{t('basicInfo')}</TableHead>
              <TableHead className="hidden md:table-cell w-28">{t('price')}</TableHead>
              <TableHead className="hidden md:table-cell w-32">{t('location')}</TableHead>
              <TableHead className="hidden md:table-cell w-24">{t('fee')}</TableHead>
              <TableHead className="hidden lg:table-cell min-w-[160px]">{t('service')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((vendor) => (
              <TableRow key={vendor.id} data-state={selectedRows.includes(vendor.id) ? 'selected' : undefined}>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(vendor.id)}
                    onCheckedChange={(checked) => handleSelectRow(vendor.id, checked as boolean)}
                    aria-label={`Select ${vendor.title}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={vendor.cover}
                        alt={vendor.title}
                        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-md border"
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
                </TableCell>
                <TableCell className="hidden md:table-cell font-semibold">{vendor.price}</TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {vendor.goodsDistributeLocation}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">
                  {vendor.fee}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {vendor.service && vendor.service.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {vendor.service.map((service, index) => (
                        <div key={index} className="flex items-center space-x-1 text-xs">
                          <img src={service.icon} alt={service.name} className="w-3 h-3" />
                          <span className="text-muted-foreground">{service.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableCaption className="px-2 py-3 text-left">
            {t('dataSelected', { count: selectedRows.length })}
          </TableCaption>
        </Table>
      </CardContent>
    </Card>
  );
}
