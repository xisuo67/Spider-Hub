/**
 * 小红书商品数据转换器
 * 将API返回的原始数据转换为统一的展示格式
 */

export interface VendorDisplayItem {
  id: string;
  cover: string;
  logo: string;
  sellername: string;
  sellerScore: number;
  itemAnalysisDataText: string;
  title: string;
  images: string[];
  price: number;
  // on_shelf_time removed per latest requirement
  desc: string;
  service: Array<{
    name: string;
    icon: string;
    type: string | null;
  }>;
  goodsDistributeLocation: string;
  fee: number;
}

function normalizeUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
}

/**
 * 从店铺API数据转换商品信息
 */
export function transformShopProductToVendorItem(product: any): VendorDisplayItem {
  // 从基本信息中提取数据
  const basicInfo = product.detail?.basic_info || {};
  const sellerInfo = product.detail?.seller_info || {};
  const priceInfo = product.price_info || {};
  
  return {
    id: product.id || '',
    cover: normalizeUrl(product.image) || '',
    logo: sellerInfo.logo || basicInfo.logo || '',
    sellername: sellerInfo.sellername || basicInfo.sellername || '',
    sellerScore: sellerInfo.sellerScore || basicInfo.sellerScore || 0,
    itemAnalysisDataText: basicInfo.itemAnalysisDataText || '',
    title: product.card_title || product.desc || basicInfo.title || '',
    images: (product.images || [product.image]).filter(Boolean).map((u: string) => normalizeUrl(u)),
    price: priceInfo.expected_price?.price || priceInfo.sku_price?.price || 0,
    desc: product.desc || basicInfo.desc || '',
    service: transformServiceData(product.detail?.service || basicInfo.service || []),
    goodsDistributeLocation: basicInfo.goodsDistributeLocation || '',
    fee: basicInfo.fee || 0
  };
}

/**
 * 从商品详情API数据转换商品信息
 */
export function transformProductDetailToVendorItem(productDetail: any): VendorDisplayItem {
  // 从template_data中提取数据
  const templateData = productDetail.template_data?.[0] || {};
  
  // 提取基本信息
  const descriptionH5 = templateData.descriptionH5 || {};
  const sellerH5 = templateData.sellerH5 || {};
  const priceH5 = templateData.priceH5 || {};
  const carouselH5 = templateData.carouselH5 || {};
  const serviceV5 = templateData.serviceV5 || {};
  const goodsDistributeV4 = templateData.goodsDistributeV4 || {};
  
  return {
    id: descriptionH5.skuId || '',
    cover: normalizeUrl(carouselH5.images?.[0]?.url) || '',
    logo: sellerH5.logo || '',
    sellername: sellerH5.name || '',
    sellerScore: parseFloat(sellerH5.sellerScore || sellerH5.grade || '0'),
    itemAnalysisDataText: priceH5.itemAnalysisDataText || '',
    title: descriptionH5.name || '',
    images: (carouselH5.images?.map((img: any) => normalizeUrl(img.url)) || []),
    price: priceH5.highlightPrice || 0,
    desc: descriptionH5.name || '',
    service: transformServiceData(serviceV5.list || []),
    goodsDistributeLocation: goodsDistributeV4.location || '',
    fee: goodsDistributeV4.fee
  };
}

/**
 * 转换服务标签数据
 */
function transformServiceData(serviceData: any[]): Array<{
  name: string;
  icon: string;
  type: string | null;
}> {
  if (!Array.isArray(serviceData)) return [];
  
  return serviceData.map(service => ({
    name: service.name || service.title || '',
    icon: service.icon || '',
    type: service.type || null
  }));
}

/**
 * 格式化时间戳
 */
function formatTimestamp(timestamp: number | string): string {
  if (!timestamp) return new Date().toISOString();
  
  try {
    const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
}

/**
 * 批量转换店铺商品数据
 */
export function transformShopProducts(products: any[]): VendorDisplayItem[] {
  return products.map(transformShopProductToVendorItem);
}

/**
 * 转换单个商品详情数据
 */
export function transformSingleProduct(productDetail: any): VendorDisplayItem {
  return transformProductDetailToVendorItem(productDetail);
}
