// 公共 URL 工具

/**
 * 去除 URL 查询参数与 hash
 */
export function removeUrlParams(url: string): string {
  if (!url) return ''
  const clean = url.split('#')[0]
  return clean.split('?')[0]
}

/**
 * 规范化小红书 CDN 图片链接：
 * - 仅保留 path
 * - 仅保留 query 中的 imageView2（不带子参数）、sign、t 三个参数
 * 用例：
 * https://sns-note-i6.xhscdn.com/comment/xxx?imageView2/2/w/360/h/360/format/heif&q=46&ap=4&sc=xxx&sign=SIG&t=TS
 * => https://sns-note-i6.xhscdn.com/comment/xxx?imageView2&sign=SIG&t=TS
 */
export function normalizeXhsCdnUrl(url: string): string {
  try {
    if (!url) return ''
    const u = new URL(url)
    const base = `${u.protocol}//${u.host}${u.pathname}`
    const sign = u.searchParams.get('sign')
    const t = u.searchParams.get('t')
    // 只保留 imageView2 的标记，不保留其后续子参数
    const hasImageView2 = u.search.includes('imageView2')
    const params: string[] = []
    if (hasImageView2) params.push('imageView2')
    if (sign) params.push(`sign=${encodeURIComponent(sign)}`)
    if (t) params.push(`t=${encodeURIComponent(t)}`)
    return params.length ? `${base}?${params.join('&')}` : base
  } catch {
    return removeUrlParams(url)
  }
}


