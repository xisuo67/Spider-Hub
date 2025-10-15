import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const page = searchParams.get('page') || '0';

    if (!shopId) {
      return NextResponse.json({ error: 'shopId is required' }, { status: 400 });
    }

    // 调用小红书店铺商品列表API
    const shopApiUrl = `https://www.xiaohongshu.com/api/store/vs/${shopId}/skus?page=${page}&anti_crawler=1`;
    
    const response = await fetch(shopApiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://www.xiaohongshu.com/',
        'Origin': 'https://www.xiaohongshu.com'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const shopData = await response.json();

    // 检查是否有更多数据
    const hasMore = !shopData.data?.no_more_items;

    // 如果有商品数据，获取每个商品的详细信息
    let detailedProducts = [];
    if (shopData.data && Array.isArray(shopData.data)) {
      const productPromises = shopData.data.map(async (product: any) => {
        try {
          const detailResponse = await fetch(
            `https://mall.xiaohongshu.com/api/store/jpd/edith/detail/h5/toc?item_id=${product.id}`,
            {
              method: 'GET',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Referer': 'https://mall.xiaohongshu.com/',
                'Origin': 'https://mall.xiaohongshu.com'
              }
            }
          );

          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            return {
              ...product,
              detail: detailData.data
            };
          }
          return product;
        } catch (error) {
          console.error(`Failed to fetch detail for product ${product.id}:`, error);
          return product;
        }
      });

      detailedProducts = await Promise.all(productPromises);
    }

    return NextResponse.json({
      success: true,
      data: {
        products: detailedProducts,
        hasMore,
        currentPage: parseInt(page),
        shopId
      }
    });

  } catch (error) {
    console.error('Shop API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shop data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
