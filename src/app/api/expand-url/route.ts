import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    console.log('Expanding URL:', url);
    
    // 方法1: 使用GET请求并跟随重定向
    try {
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow', // 自动跟随重定向
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const finalUrl = response.url;
        console.log('URL expanded successfully:', url, '->', finalUrl);
        return NextResponse.json({ 
          success: true, 
          originalUrl: url, 
          expandedUrl: finalUrl 
        });
      }
    } catch (fetchError) {
      console.warn('GET request failed, trying HEAD method:', fetchError);
    }
    
    // 方法2: 使用HEAD请求手动处理重定向
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // 检查是否有重定向
      if (response.status === 301 || response.status === 302 || response.status === 307 || response.status === 308) {
        const location = response.headers.get('Location');
        if (location) {
          console.log('URL expanded via redirect header:', url, '->', location);
          return NextResponse.json({ 
            success: true, 
            originalUrl: url, 
            expandedUrl: location 
          });
        }
      }
    } catch (headError) {
      console.warn('HEAD request failed:', headError);
    }
    
    // 方法3: 对于小红书短链接，尝试特殊处理
    if (url.includes('xhslink.com')) {
      try {
        // 使用更完整的请求头
        const response = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1'
          }
        });
        
        if (response.ok) {
          const finalUrl = response.url;
          console.log('XHS URL expanded successfully:', url, '->', finalUrl);
          return NextResponse.json({ 
            success: true, 
            originalUrl: url, 
            expandedUrl: finalUrl 
          });
        }
      } catch (xhsError) {
        console.warn('XHS special handling failed:', xhsError);
      }
    }
    
    // 如果所有方法都失败，返回原URL
    console.log('All expansion methods failed, returning original URL');
    return NextResponse.json({ 
      success: true, 
      originalUrl: url, 
      expandedUrl: url 
    });
    
  } catch (error) {
    console.error('Error expanding URL:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to expand URL'
    }, { status: 500 });
  }
}
