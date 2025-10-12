import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generates page numbers for pagination with ellipsis
 * @param currentPage - Current page number (1-based)
 * @param totalPages - Total number of pages
 * @returns Array of page numbers and ellipsis strings
 *
 * Examples:
 * - Small dataset (≤5 pages): [1, 2, 3, 4, 5]
 * - Near beginning: [1, 2, 3, 4, '...', 10]
 * - In middle: [1, '...', 4, 5, 6, '...', 10]
 * - Near end: [1, '...', 7, 8, 9, 10]
 */
export function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePages = 5 // Maximum number of page buttons to show
  const rangeWithDots = []

  if (totalPages <= maxVisiblePages) {
    // If total pages is 5 or less, show all pages
    for (let i = 1; i <= totalPages; i++) {
      rangeWithDots.push(i)
    }
  } else {
    // Always show first page
    rangeWithDots.push(1)

    if (currentPage <= 3) {
      // Near the beginning: [1] [2] [3] [4] ... [10]
      for (let i = 2; i <= 4; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Near the end: [1] ... [7] [8] [9] [10]
      rangeWithDots.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) {
        rangeWithDots.push(i)
      }
    } else {
      // In the middle: [1] ... [4] [5] [6] ... [10]
      rangeWithDots.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    }
  }

  return rangeWithDots
}


/**
 * 是否为网址
 * @param input 输入字符串
 * @returns 是否为网址
 */
export function isUrl(input: string): boolean {
  return input.startsWith('http://') || input.startsWith('https://');
}

/**
 * 获取小红书短链接
 * @param input 输入字符串
 * @returns 小红书短链接
 */
export function getXhsShortUrl(input: string): string {
  let url = '';
  if (!input) {
    return url;
  }
  
  try {
    // 使用正则表达式匹配小红书短链接 - 更灵活的模式
    let pattern = /https?:\/\/xhslink\.com\/[a-zA-Z0-9/_-]+(?:\?[^\s]*)?/;
    let match = input.match(pattern);
    
    // 如果上面的模式没有匹配到，尝试更宽松的模式
    if (!match) {
      pattern = /https?:\/\/xhslink\.com\/[^\s]+/;
      match = input.match(pattern);
    }
    
    // 输出匹配到的URL
    if (match) {
      url = match[0];
    }
  } catch (error) {
    console.warn('Error extracting XHS short URL:', error);
  }
  
  return url;
}

/**
 * 展开短链接获取长链接
 * @param shortUrl 短链接
 * @returns 长链接
 */
export async function expandShortUrl(shortUrl: string): Promise<string> {
  try {
    console.log('Attempting to expand short link:', shortUrl);
    
    // 首先尝试使用我们的API代理
    try {
      const response = await fetch('/api/expand-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: shortUrl })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.expandedUrl) {
          console.log('URL expanded via API:', shortUrl, '->', result.expandedUrl);
          return result.expandedUrl;
        }
      } else {
        console.warn('API proxy returned error:', response.status, response.statusText);
      }
    } catch (apiError) {
      console.warn('API proxy failed, trying direct method:', apiError);
    }
    
    // 如果API代理失败，尝试直接请求（仅作为降级方案）
    try {
      const response = await fetch(shortUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // 如果请求成功，返回最终URL
      if (response.ok) {
        const finalUrl = response.url;
        console.log('URL expanded successfully via direct method:', shortUrl, '->', finalUrl);
        return finalUrl;
      }
    } catch (directError) {
      console.warn('Direct method also failed:', directError);
    }
    
    // 如果所有方法都失败，返回原URL
    console.log('All expansion methods failed, returning original URL');
    return shortUrl;
  } catch (error) {
    console.warn(`Error expanding short URL ${shortUrl}:`, error);
    
    // 如果是CORS错误，提供更友好的提示
    if (error instanceof TypeError && error.message.includes('CORS')) {
      console.warn('CORS error detected, returning original URL');
    }
    
    return shortUrl; // 出错时返回原URL
  }
}

/**
 * 检查是否为小红书特定路径，不需要展开
 * @param url 要检查的URL
 * @returns 是否为小红书特定路径
 */
export function isXhsSpecificPath(url: string): boolean {
  const xhsSpecificPaths = [
    'https://www.xiaohongshu.com/explore',
    'https://www.xiaohongshu.com/user/profile'
  ];
  
  return xhsSpecificPaths.some(path => url.includes(path));
}

/**
 * 短链接转长链接
 * @param input 输入文本或短链接
 * @returns 展开后的长链接
 */
export async function expandUrl(input: string): Promise<string> {
  try {
    // 如果输入的是纯URL，先检查是否为小红书特定路径
    if (isUrl(input)) {
      // 如果是小红书特定路径，直接返回，不进行展开
      if (isXhsSpecificPath(input)) {
        console.log('XHS specific path detected, skipping expansion:', input);
        return input;
      }
      
      const expanded = await expandShortUrl(input);
      // 如果展开失败，返回原始输入
      return expanded || input;
    }
    
    // 从文本中提取短链接
    const shortUrl = getXhsShortUrl(input);
    if (shortUrl) {
      // 检查提取到的短链接是否为小红书特定路径
      if (isXhsSpecificPath(shortUrl)) {
        console.log('XHS specific path detected in extracted URL, skipping expansion:', shortUrl);
        return shortUrl;
      }
      
      const expanded = await expandShortUrl(shortUrl);
      // 如果展开失败，返回原始短链接
      return expanded || shortUrl;
    }
    
    return input; // 如果没有找到短链接，返回原始输入
  } catch (error) {
    console.warn('Error expanding URL:', error);
    return input; // 出错时返回原始输入
  }
}
