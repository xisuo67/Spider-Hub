'use client';

import { Main } from '@/components/layout/main';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VendorBulkActions } from '@/components/xhs/vendor-bulk-actions';
import { VendorTable } from '@/components/xhs/vendor-table';
import { SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { expandUrl } from '@/lib/utils';
import { transformShopProducts, transformSingleProduct, type VendorDisplayItem } from '@/lib/vendor-data-transformer';
import { DataTableBulkActions } from '@/components/data-table/bulk-actions';

export default function XhsVendorPage() {
  const t = useTranslations('Xhs.Vendor');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false); // 初始加载/搜索时使用
  const [loadingMore, setLoadingMore] = useState(false); // 分页追加时使用
  const [vendorData, setVendorData] = useState<VendorDisplayItem[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<VendorDisplayItem[]>([]);
  const [currentUrlInfo, setCurrentUrlInfo] = useState<{
    type: 'shop' | 'goods-detail' | null;
    id: string | null;
    url: string | null;
  }>({ type: null, id: null, url: null });
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [tableInstance, setTableInstance] = useState<any>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const expandedUrl = await expandUrl(searchQuery);
      const finalUrl = expandedUrl || searchQuery.trim();
      if (expandedUrl && expandedUrl !== searchQuery) {
        setSearchQuery(expandedUrl);
      }
      const isValidUrl = validateVendorUrl(finalUrl);
      if (!isValidUrl.isValid) {
        toast.error(isValidUrl.message);
        return;
      }
      if (isValidUrl.type === 'shop') {
        const shopId = isValidUrl.shopId;
        setCurrentUrlInfo({ type: 'shop', id: shopId || null, url: finalUrl });
        await fetchShopData(shopId || '', 0);
      } else if (isValidUrl.type === 'goods-detail') {
        const goodsId = isValidUrl.goodsId;
        setCurrentUrlInfo({ type: 'goods-detail', id: goodsId || null, url: finalUrl });
        await fetchProductData(goodsId || '');
      }
    } catch (error) {
      toast.error(t('searchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const validateVendorUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      if (!urlObj.hostname.includes('xiaohongshu.com')) {
        return { isValid: false, message: t('invalidUrl') };
      }
      const shopMatch = url.match(/^https:\/\/www\.xiaohongshu\.com\/shop\/([a-f0-9]+)(?:\?.*)?$/);
      if (shopMatch) {
        return { isValid: true, type: 'shop', shopId: shopMatch[1] } as const;
      }
      const goodsDetailMatch = url.match(/^https:\/\/www\.xiaohongshu\.com\/goods-detail\/([a-f0-9]+)(?:\?.*)?$/);
      if (goodsDetailMatch) {
        return { isValid: true, type: 'goods-detail', goodsId: goodsDetailMatch[1] } as const;
      }
      const goodsMatch = url.match(/^https:\/\/www\.xiaohongshu\.com\/goods\/([a-f0-9]+)(?:\?.*)?$/);
      if (goodsMatch) {
        return { isValid: true, type: 'goods-detail', goodsId: goodsMatch[1] } as const;
      }
      return { isValid: false, message: t('invalidUrlFormat') };
    } catch {
      return { isValid: false, message: t('invalidUrlMessage') };
    }
  };

  const fetchShopData = async (shopId: string, page: number) => {
    try {
      const response = await fetch(`/api/vendor/shop?shopId=${shopId}&page=${page}`);
      const result = await response.json();
      if (result.success) {
        const transformedProducts: VendorDisplayItem[] = result.data.products.map((product: any) =>
          transformSingleProduct(product.detail || product)
        );
        setVendorData((prev) => (page === 0 ? transformedProducts : [...prev, ...transformedProducts]));
        setHasMore(result.data.hasMore);
        setCurrentPage(page);
      } else {
        throw new Error(result.error || 'Failed to fetch shop data');
      }
    } catch (error) {
      toast.error(t('fetchShopDataFailed'));
    }
  };

  const fetchProductData = async (productId: string) => {
    try {
      const response = await fetch(`/api/vendor/product?productId=${productId}`);
      const result = await response.json();
      if (result.success) {
        const transformedProduct = transformSingleProduct(result.data.product);
        setVendorData([transformedProduct]);
        setHasMore(false);
        setCurrentPage(0);
      } else {
        throw new Error(result.error || 'Failed to fetch product data');
      }
    } catch (error) {
      toast.error(t('fetchProductDataFailed'));
    }
  };

  const loadMore = async () => {
    if (!currentUrlInfo.id || currentUrlInfo.type !== 'shop' || !hasMore) return;
    setLoadingMore(true); // 不触发全局loading，避免空白骨架
    try {
      await fetchShopData(currentUrlInfo.id, currentPage + 1);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSelectionChange = (selected: any[]) => {
    setSelectedVendors(selected);
  };

  const handleExportCSV = () => {};
  const handleDownloadDetails = () => {};
  const handleDownloadImages = () => {};

  return (
    <Main>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <div className="flex gap-4">
          <Input placeholder={t('searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" />
          <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()} className="bg-red-500 hover:bg-red-600">
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
        {tableInstance && (
          <DataTableBulkActions table={tableInstance} entityName={t('title')}>
            <VendorBulkActions selectedCount={selectedVendors.length} selectedData={selectedVendors} onExportCSV={handleExportCSV} onDownloadDetails={handleDownloadDetails} onDownloadImages={handleDownloadImages} />
          </DataTableBulkActions>
        )}
        <VendorTable loading={loading && currentPage === 0} data={vendorData} onSelectionChange={setSelectedVendors} onTableReady={setTableInstance} />
        {currentUrlInfo.type === 'shop' && hasMore && (
          <div className="flex justify-center">
            <Button onClick={loadMore} disabled={loadingMore} variant="outline" className="flex items-center gap-2">
              {loadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  <span>{t('loading')}</span>
                </>
              ) : (
                <span>{t('loadMore')}</span>
              )}
            </Button>
          </div>
        )}
      </div>
    </Main>
  );
}
