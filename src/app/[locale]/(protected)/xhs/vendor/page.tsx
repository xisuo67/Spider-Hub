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
  const [loading, setLoading] = useState(false);
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
      // 先展开短链接
      const expandedUrl = await expandUrl(searchQuery);
      const finalUrl = expandedUrl || searchQuery.trim();
      
      // 如果URL被展开，回填到搜索框
      if (expandedUrl && expandedUrl !== searchQuery) {
        setSearchQuery(expandedUrl);
      }
      
      // 验证URL格式并提取ID
      const isValidUrl = validateVendorUrl(finalUrl);
      
      if (!isValidUrl.isValid) {
        toast.error(isValidUrl.message);
        return;
      }
      
      // 根据URL类型进行不同的处理，并提取对应的ID
      if (isValidUrl.type === 'shop') {
        const shopId = isValidUrl.shopId;
        
        // 保存当前URL信息
        setCurrentUrlInfo({
          type: 'shop',
          id: shopId || null,
          url: finalUrl
        });
        // 调用店铺API获取数据
        await fetchShopData(shopId || '', 0);
      } else if (isValidUrl.type === 'goods-detail') {
        const goodsId = isValidUrl.goodsId;
        
        // 保存当前URL信息
        setCurrentUrlInfo({
          type: 'goods-detail',
          id: goodsId || null,
          url: finalUrl
        });
        
        // 调用商品详情API获取数据
        await fetchProductData(goodsId || '');
      }
    } catch (error) {
      toast.error(t('searchFailed'));
    } finally {
      setLoading(false);
    }
  };

  // 验证vendor URL格式
  const validateVendorUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      
      // 检查是否为小红书域名
      if (!urlObj.hostname.includes('xiaohongshu.com')) {
        return {
          isValid: false,
          message: t('invalidUrl')
        };
      }
      
      // 检查店铺主页链接格式: https://www.xiaohongshu.com/shop/{shopId} (支持查询参数)
      const shopMatch = url.match(/^https:\/\/www\.xiaohongshu\.com\/shop\/([a-f0-9]+)(?:\?.*)?$/);
      if (shopMatch) {
        return {
          isValid: true,
          type: 'shop',
          shopId: shopMatch[1]
        };
      }
      
      // 检查商品详情链接格式: https://www.xiaohongshu.com/goods-detail/{goodsId} (支持查询参数)
      const goodsDetailMatch = url.match(/^https:\/\/www\.xiaohongshu\.com\/goods-detail\/([a-f0-9]+)(?:\?.*)?$/);
      if (goodsDetailMatch) {
        return {
          isValid: true,
          type: 'goods-detail',
          goodsId: goodsDetailMatch[1]
        };
      }
      
      // 检查另一种商品详情链接格式: https://www.xiaohongshu.com/goods/{goodsId} (支持查询参数)
      const goodsMatch = url.match(/^https:\/\/www\.xiaohongshu\.com\/goods\/([a-f0-9]+)(?:\?.*)?$/);
      if (goodsMatch) {
        return {
          isValid: true,
          type: 'goods-detail',
          goodsId: goodsMatch[1]
        };
      }
      
      return {
        isValid: false,
        message: t('invalidUrlFormat')
      };
    } catch (error) {
      return {
        isValid: false,
        message: t('invalidUrlMessage')
      };
    }
  };

  // 获取店铺数据
  const fetchShopData = async (shopId: string, page: number) => {
    try {
      const response = await fetch(`/api/vendor/shop?shopId=${shopId}&page=${page}`);
      const result = await response.json();
      
      if (result.success) {
        // 店铺API返回的数据已经包含了详情数据，需要使用详情转换函数
        const transformedProducts = result.data.products.map((product: any) => {
          // 使用详情数据转换函数，传入detail字段
          return transformSingleProduct(product.detail || product);
        });
        
        setVendorData(transformedProducts);
        setHasMore(result.data.hasMore);
        setCurrentPage(page);
      } else {
        throw new Error(result.error || 'Failed to fetch shop data');
      }
    } catch (error) {
      toast.error(t('fetchShopDataFailed'));
    }
  };

  // 获取商品详情数据
  const fetchProductData = async (productId: string) => {
    try {
      const response = await fetch(`/api/vendor/product?productId=${productId}`);
      const result = await response.json();
      
      if (result.success) {
        // 转换单个商品数据为统一格式
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

  // 加载更多数据（分页）
  const loadMore = async () => {
    if (!currentUrlInfo.id || currentUrlInfo.type !== 'shop' || !hasMore) return;
    
    setLoading(true);
    try {
      await fetchShopData(currentUrlInfo.id, currentPage + 1);
    } finally {
      setLoading(false);
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

        {currentUrlInfo.type && currentUrlInfo.id && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {currentUrlInfo.type === 'shop' ? t('shopHomepage') : t('productDetail')}
                  </span>
                  <span className="text-xs text-muted-foreground">ID: {currentUrlInfo.id}</span>
                </div>
                <div className="text-xs text-muted-foreground break-all">{currentUrlInfo.url}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentUrlInfo({ type: null, id: null, url: null });
                  setVendorData([]);
                }}
              >
                {t('clear')}
              </Button>
            </div>
          </div>
        )}

        {/* 悬浮批量操作条（与SearchNote一致） */}
        {tableInstance && (
          <DataTableBulkActions table={tableInstance} entityName={t('title')}>
            <VendorBulkActions
              selectedCount={selectedVendors.length}
              selectedData={selectedVendors}
              onExportCSV={handleExportCSV}
              onDownloadDetails={handleDownloadDetails}
              onDownloadImages={handleDownloadImages}
            />
          </DataTableBulkActions>
        )}

        <VendorTable
          loading={loading}
          data={vendorData}
          onSelectionChange={setSelectedVendors}
          onTableReady={setTableInstance}
        />

        {currentUrlInfo.type === 'shop' && hasMore && (
          <div className="flex justify-center">
            <Button onClick={loadMore} disabled={loading} variant="outline" className="flex items-center gap-2">
              {loading ? (
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
