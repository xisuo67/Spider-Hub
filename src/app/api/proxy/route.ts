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

    // 透传 Range 头以支持视频分段（206）
    const range = req.headers.get('range') || undefined
    const upstream = await fetch(urlObj.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Safari/537.36',
        Accept: '*/*',
        ...(range ? { Range: range } : {}),
      },
      cache: 'no-store',
    })

    if (!upstream.ok || !upstream.body) {
      return new NextResponse(`Upstream error: ${upstream.statusText}`, {
        status: upstream.status || 502,
      })
    }

    const headers = new Headers()
    const passHeaders = [
      'content-type',
      'content-length',
      'accept-ranges',
      'content-range',
      'content-disposition',
      'cache-control',
      'last-modified',
      'etag',
    ]
    for (const h of passHeaders) {
      const v = upstream.headers.get(h)
      if (v) headers.set(h, v)
    }
    if (!headers.has('cache-control')) headers.set('cache-control', 'no-store')

    return new NextResponse(upstream.body as ReadableStream, {
      status: upstream.status,
      headers,
    })
  } catch (e) {
    return new NextResponse('Proxy error', { status: 500 })
  }
}


