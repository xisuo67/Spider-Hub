import { NextRequest, NextResponse } from 'next/server'

// 允许的资源域（安全白名单）
// 为兼顾图片/头像/视频的不同机房与子域，这里按后缀放宽到 xhscdn.com 与 xiaohongshu.com 的静态域
function isAllowedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase()
  if (lower.endsWith('.xhscdn.com')) return true
  if (lower.endsWith('.xiaohongshu.com')) return true
  return false
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const target = searchParams.get('url')
    if (!target) {
      return new NextResponse('Missing url', { status: 400 })
    }

    // 只允许 http/https
    if (!/^https?:\/\//i.test(target)) {
      return new NextResponse('Invalid url', { status: 400 })
    }

    const urlObj = new URL(target)
    if (!isAllowedHost(urlObj.hostname)) {
      return new NextResponse('Host not allowed', { status: 403 })
    }

    // 升级为 https，尽量避免混合内容
    if (urlObj.protocol === 'http:') {
      urlObj.protocol = 'https:'
    }

    // 由服务端拉取资源，绕过浏览器 CORS/Referer 限制
    const upstream = await fetch(urlObj.toString(), {
      // 某些 CDN 需要 UA 才会返回 200
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Safari/537.36',
        // 部分源需要 Accept Range，交由 CDN 自行处理
        Accept: '*/*',
      },
      // 允许较大的视频
      cache: 'no-store',
    })

    if (!upstream.ok || !upstream.body) {
      return new NextResponse(`Upstream error: ${upstream.statusText}`, {
        status: upstream.status || 502,
      })
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
    const contentLength = upstream.headers.get('content-length') || undefined

    // 直接把上游流回传给客户端
    return new NextResponse(upstream.body as ReadableStream, {
      status: 200,
      headers: {
        'content-type': contentType,
        ...(contentLength ? { 'content-length': contentLength } : {}),
        // 允许前端下载
        'cache-control': 'no-store',
      },
    })
  } catch (e) {
    return new NextResponse('Proxy error', { status: 500 })
  }
}


