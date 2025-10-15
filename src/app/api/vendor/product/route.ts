import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    // 调用小红书商品详情API
    const productApiUrl = `https://mall.xiaohongshu.com/api/store/jpd/edith/detail/h5/toc?item_id=${productId}`;
    
    const response = await fetch(productApiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://mall.xiaohongshu.com/',
        'Origin': 'https://mall.xiaohongshu.com'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const productData = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        product: productData.data,
        productId
      }
    });

  } catch (error) {
    console.error('Product API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
