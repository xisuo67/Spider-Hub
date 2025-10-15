'use client';

import { Main } from '@/components/layout/main';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VendorBulkActions } from '@/components/xhs/vendor-bulk-actions';
import { VendorTable } from '@/components/xhs/vendor-table';
import { SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function XhsVendorPage() {
  const t = useTranslations('Xhs.Vendor');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [vendorData, setVendorData] = useState<any[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // TODO: 实现搜索逻辑
      console.log('搜索:', searchQuery);
      // 模拟数据
      setVendorData([]);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (selected: any[]) => {
    setSelectedVendors(selected);
  };

  const handleExportCSV = () => {
    console.log('导出CSV:', selectedVendors);
  };

  const handleDownloadDetails = () => {
    console.log('下载详细数据:', selectedVendors);
  };

  const handleDownloadImages = () => {
    console.log('下载图片:', selectedVendors);
  };

  return (
    <Main>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className="bg-red-500 hover:bg-red-600"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>{t('searching')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SearchIcon className="h-4 w-4" />
                <span>{t('search')}</span>
              </div>
            )}
          </Button>
        </div>

        {selectedVendors.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">
              {t('dataSelected', { count: selectedVendors.length })}
            </span>
            <VendorBulkActions
              selectedCount={selectedVendors.length}
              selectedData={selectedVendors}
              onExportCSV={handleExportCSV}
              onDownloadDetails={handleDownloadDetails}
              onDownloadImages={handleDownloadImages}
            />
          </div>
        )}

        <VendorTable
          loading={loading}
          data={vendorData}
          onSelectionChange={handleSelectionChange}
        />
      </div>
    </Main>
  );
}
