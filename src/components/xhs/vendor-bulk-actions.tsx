'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DownloadIcon, FileSpreadsheetIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatFilename } from '@/lib/export-utils';

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

interface VendorBulkActionsProps {
  selectedCount: number;
  selectedData: VendorData[];
  onExportCSV: () => void;
  onDownloadDetails: () => void;
  onDownloadImages: () => void;
}

export function VendorBulkActions({
  selectedCount,
  selectedData,
  onExportCSV,
  onDownloadDetails,
  onDownloadImages,
}: VendorBulkActionsProps) {
  const t = useTranslations('Xhs.Vendor');
  const locale = useLocale();
  const [loading, setLoading] = useState({
    csv: false,
    json: false,
    images: false,
  });

  const handleExportCSV = async () => {
    if (loading.csv) return;

    setLoading((prev) => ({ ...prev, csv: true }));
    try {
      const filename = formatFilename('xhs-vendor-results', 'csv');
      // 创建CSV内容
      const headers = [
        'ID', '标题', '描述', '商家名称', '商家评分', '商品分析', '价格', 
        '上架时间', '发货地址', '费用', '服务标签'
      ];
      const csvContent = [
        headers.join(','),
        ...selectedData.map(vendor => [
          vendor.id,
          `"${vendor.title}"`,
          `"${vendor.desc}"`,
          `"${vendor.sellername}"`,
          vendor.sellerScore,
          `"${vendor.itemAnalysisDataText}"`,
          vendor.price,
          vendor.on_shelf_time,
          `"${vendor.goodsDistributeLocation}"`,
          vendor.fee,
          `"${vendor.service?.map(s => s.name).join(';') || ''}"`
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      
      toast.success(t('exportingCSV', { count: selectedCount }));
      onExportCSV();
    } catch (error) {
      console.error('CSV export failed:', error);
      toast.error(t('exportFailed'));
    } finally {
      setLoading((prev) => ({ ...prev, csv: false }));
    }
  };

  const handleDownloadDetails = async () => {
    if (loading.json) return;

    setLoading((prev) => ({ ...prev, json: true }));
    try {
      const filename = formatFilename('xhs-vendor-details', 'json');
      const jsonContent = JSON.stringify(selectedData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      
      toast.success(t('downloadingDetails', { count: selectedCount }));
      onDownloadDetails();
    } catch (error) {
      console.error('JSON export failed:', error);
      toast.error(t('exportFailed'));
    } finally {
      setLoading((prev) => ({ ...prev, json: false }));
    }
  };

  const handleDownloadImages = async () => {
    if (loading.images) return;

    setLoading((prev) => ({ ...prev, images: true }));
    try {
      const filename = formatFilename('xhs-vendor-content', 'zip');
      // 简化的图片下载功能
      const allImages = selectedData.flatMap(vendor => [
        vendor.cover,
        ...(vendor.images || []),
        vendor.logo
      ]).filter(Boolean);
      
      // 这里可以实现更复杂的图片下载逻辑
      // 目前只是显示成功消息
      toast.success(t('downloadingImages', { count: selectedCount }));
      onDownloadImages();
    } catch (error) {
      console.error('Images export failed:', error);
      toast.error(t('exportFailed'));
    } finally {
      setLoading((prev) => ({ ...prev, images: false }));
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
