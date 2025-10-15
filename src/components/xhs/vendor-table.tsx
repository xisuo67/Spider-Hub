'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

interface VendorData {
  id: string;
  cover: string;
  logo: string;
  sellername: string;
  sellerScore: number;
  itemAnalysisDataText: string;
  title: string;
  images: string[];
  price: number;
  on_shelf_time: string;
  desc: string;
  service: Array<{
    name: string;
    icon: string;
    type: string | null;
  }>;
  goodsDistributeLocation: string;
  fee: number;
}

interface VendorTableProps {
  loading: boolean;
  data: VendorData[];
  onSelectionChange: (selected: VendorData[]) => void;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd HH:mm', {
      locale: locale === 'zh' ? zhCN : enUS,
    });
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
        <div className="space-y-4 p-6">
          {data.map((vendor) => (
            <div key={vendor.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50">
              <Checkbox
                checked={selectedRows.includes(vendor.id)}
                onCheckedChange={(checked) => handleSelectRow(vendor.id, checked as boolean)}
                className="mt-1"
              />
              
              <div className="flex-1 flex items-start space-x-4">
                {/* 商品图片 */}
                <div className="relative">
                  <img
                    src={vendor.cover}
                    alt={vendor.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  {vendor.images && vendor.images.length > 1 && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                      +{vendor.images.length - 1}
                    </Badge>
                  )}
                </div>

                {/* 商品信息 */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-sm line-clamp-2">{vendor.title}</h3>
                    <div className="text-right">
                      <div className="font-semibold text-lg">{formatPrice(vendor.price)}</div>
                      <div className="text-xs text-muted-foreground">
                        {t('onShelfTime')}: {formatDate(vendor.on_shelf_time)}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">{vendor.desc}</p>

                  {/* 用户信息 */}
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={vendor.logo} alt={vendor.sellername} />
                      <AvatarFallback>{vendor.sellername.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{vendor.sellername}</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground">
                          {vendor.sellerScore} {vendor.itemAnalysisDataText}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 服务标签 */}
                  {vendor.service && vendor.service.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {vendor.service.map((service, index) => (
                        <div key={index} className="flex items-center space-x-1 text-xs">
                          <img src={service.icon} alt={service.name} className="w-3 h-3" />
                          <span className="text-muted-foreground">{service.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 其他信息 */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t('location')}: {vendor.goodsDistributeLocation}</span>
                    <span>{t('fee')}: {formatPrice(vendor.fee)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
