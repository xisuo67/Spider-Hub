import { SearchResult } from '@/components/xhs/search-results-table';
import JSZip from 'jszip';
import type { CommentListItem } from '@/components/xhs/comments-table'
import { removeUrlParams } from './url'

// 多语言标题映射
const getLocalizedHeaders = (locale: string = 'zh') => {
  const headers = {
    zh: [
      'ID',
      '标题',
      '描述',
      '作者',
      '类型',
      '发布时间',
      '预估阅读数',
      '互动量',
      '收藏数',
      '评论数',
      '分享数',
      '点赞数',
      '封面图片',
      'Resources'
    ],
    en: [
      'ID',
      'Title',
      'Description',
      'Author',
      'Type',
      'Publish Time',
      'Estimated Reads',
      'Interaction Volume',
      'Collections',
      'Comments',
      'Shares',
      'Likes',
      'Cover Image',
      'Resources'
    ]
  };
  return headers[locale as keyof typeof headers] || headers.zh;
};

/**
 * 导出数据为CSV格式
 */
export function exportToCSV(data: SearchResult[], filename: string = 'search-results.csv', locale: string = 'zh') {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // 根据语言获取CSV列标题
  const headers = getLocalizedHeaders(locale);

  // 去除URL参数的辅助函数
  const removeUrlParams = (url: string): string => {
    return url?.split('?')[0] || '';
  };

  // 转换数据为CSV格式
  const csvContent = [
    headers.join(','),
    ...data.map(item => {
      // 收集所有资源链接
      const allResources: string[] = [];
      
      // 添加图片资源
      if (item.images_list && item.images_list.length > 0) {
        item.images_list.forEach(img => {
          if (img.url) {
            allResources.push(removeUrlParams(img.url));
          }
        });
      }
      
      // 添加视频资源
      if (item.video_list && item.video_list.length > 0) {
        item.video_list.forEach(video => {
          if (video.master_url) {
            allResources.push(removeUrlParams(video.master_url));
          }
        });
      }
      
      // 添加Live图资源
      if (item.live_photo_list && item.live_photo_list.length > 0) {
        item.live_photo_list.forEach(live => {
          if (live.url) {
            allResources.push(removeUrlParams(live.url));
          }
        });
      }
      
      // 将所有资源用换行符连接
      const resourcesText = allResources.join('\n');
      
      return [
        `"${item.id}"`,
        `"${item.basicInfo.title.replace(/"/g, '""')}"`,
        `"${item.basicInfo.desc.replace(/"/g, '""')}"`,
        `"${item.basicInfo.author.name}"`,
        `"${item.basicInfo.type}"`,
        `"${item.publishTime}"`,
        `"${item.estimatedReads.raw}"`,
        `"${item.interactionVolume.raw}"`,
        `"${item.collections.raw}"`,
        `"${item.comments.raw}"`,
        `"${item.shares.raw}"`,
        `"${item.likes.raw}"`,
        `"${removeUrlParams(item.basicInfo.coverImage)}"`,
        `"${resourcesText.replace(/"/g, '""')}"`
      ].join(',');
    })
  ].join('\n');

  // 创建并下载文件
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * 导出数据为JSON格式
 */
export function exportToJSON(data: SearchResult[], filename: string = 'search-results.json') {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // 创建包含元数据的完整JSON对象
  const exportData = {
    exportInfo: {
      exportTime: new Date().toISOString(),
      totalRecords: data.length,
      version: '1.0',
      source: 'XHS Search Results'
    },
    data: data
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  
  // 创建并下载文件
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
}

/**
 * 清理文件名，移除Windows不允许的特殊字符
 */
function sanitizeFileName(name: string): string {
  // 移除或替换Windows不允许的字符
  return name
    .replace(/[<>:"/\\|?*]/g, '_')  // 替换特殊字符为下划线
    .replace(/\s+/g, '_')           // 替换空格为下划线
    .replace(/_{2,}/g, '_')        // 合并多个下划线
    .replace(/^_|_$/g, '')         // 移除开头和结尾的下划线
    .substring(0, 100);            // 限制文件名长度
}

/**
 * 从URL中提取正确的文件扩展名
 */
function getFileExtension(url: string, defaultExt: string = 'jpg'): string {
  try {
    // 移除查询参数和锚点
    const cleanUrl = url.split('?')[0].split('#')[0];
    
    // 提取扩展名
    const extension = cleanUrl.split('.').pop()?.toLowerCase();
    
    // 验证扩展名是否有效
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mkv', 'webm'];
    
    if (extension && validExtensions.includes(extension)) {
      return extension;
    }
    
    // 根据URL路径判断文件类型
    if (cleanUrl.includes('/image/') || cleanUrl.includes('imageView')) {
      return 'jpg';
    }
    if (cleanUrl.includes('/video/') || cleanUrl.includes('stream/')) {
      return 'mp4';
    }
    
    return defaultExt;
  } catch (error) {
    console.warn(`Error extracting extension from ${url}:`, error);
    return defaultExt;
  }
}

/**
 * 下载文件并返回Blob（带超时和重试）
 */
async function downloadFileAsBlob(url: string, retries: number = 2): Promise<Blob | null> {
  // 通过本地代理规避 CORS/Referer/混合内容限制
  const encoded = encodeURIComponent(url)
  const safeUrl = `/api/proxy?url=${encoded}`
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
      
      const response = await fetch(safeUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`Failed to download ${url}: ${response.statusText}`);
        if (attempt < retries) continue;
        return null;
      }
      
      return await response.blob();
    } catch (error) {
      console.warn(`Error downloading ${url} (attempt ${attempt + 1}):`, error);
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // 递增延迟
        continue;
      }
      return null;
    }
  }
  return null;
}

/**
 * 限制并发下载数量
 */
async function downloadWithConcurrencyLimit<T>(
  items: T[],
  downloadFn: (item: T) => Promise<void>,
  concurrency: number = 5
): Promise<void> {
  const results: Promise<void>[] = [];
  
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchPromises = batch.map(downloadFn);
    results.push(...batchPromises);
    
    // 等待当前批次完成
    await Promise.allSettled(batchPromises);
  }
  
  await Promise.allSettled(results);
}

/**
 * 下载图片和文本内容，生成zip包
 */
export async function downloadImagesAndText(data: SearchResult[], filename: string = 'search-results-content.zip') {
  if (data.length === 0) {
    console.warn('No data to download');
    return;
  }

  const zip = new JSZip();
  let totalFiles = 0;
  let completedFiles = 0;
  
  // 按作者分组
  const groupedByAuthor = data.reduce((acc, item) => {
    const authorName = sanitizeFileName(item.basicInfo.author.name);
    if (!acc[authorName]) {
      acc[authorName] = [];
    }
    acc[authorName].push(item);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // 计算总文件数
  for (const items of Object.values(groupedByAuthor)) {
    for (const item of items) {
      totalFiles += (item.images_list?.length || 0) + 
                   (item.video_list?.length || 0) + 
                   (item.live_photo_list?.length || 0);
    }
  }

  // 处理每个作者的数据
  for (const [authorName, authorItems] of Object.entries(groupedByAuthor)) {
    const authorFolder = zip.folder(authorName);
    if (!authorFolder) continue;

    for (const item of authorItems) {
      const title = sanitizeFileName(item.basicInfo.title);
      const itemFolder = authorFolder.folder(title);
      if (!itemFolder) continue;

      // 1. 创建文本文件 (title.txt，内容为desc)
      const textContent = item.basicInfo.desc || '';
      itemFolder.file(`${title}.txt`, textContent);

      // 2. 收集所有需要下载的文件
      const filesToDownload: Array<{
        url: string;
        filename: string;
        type: 'image' | 'video' | 'live_photo';
      }> = [];

      // 收集images_list（通过代理）
      if (item.images_list && item.images_list.length > 0) {
        item.images_list.forEach((image, i) => {
          if (image.url) {
            const extension = getFileExtension(image.url, 'jpg');
            filesToDownload.push({
              url: image.url,
              filename: `image_${i + 1}.${extension}`,
              type: 'image'
            });
          }
        });
      }

      // 收集video_list
      if (item.video_list && item.video_list.length > 0) {
        // 下载全部可用视频流
        item.video_list.forEach((video, i) => {
          if (video.master_url) {
            const extension = 'mp4';
            filesToDownload.push({
              url: video.master_url,
              filename: `video_${i + 1}.${extension}`,
              type: 'video'
            });
          }
        }); 
      }

      // 收集live_photo_list
      if (item.live_photo_list && item.live_photo_list.length > 0) {
        // 下载全部可用 live 流
        item.live_photo_list.forEach((livePhoto, i) => {
          if (livePhoto.url) {
            const extension = 'mp4';
            filesToDownload.push({
              url: livePhoto.url,
              filename: `${title}_live_${i + 1}.${extension}`,
              type: 'live_photo'
            });
          }
        });
      }

      // 限制每个笔记的文件数量（避免过大）
      const maxFilesPerNote = 20;
      const limitedFiles = filesToDownload.slice(0, maxFilesPerNote);
      
      // 使用并发限制下载
      await downloadWithConcurrencyLimit(
        limitedFiles,
        async (fileInfo) => {
          const blob = await downloadFileAsBlob(fileInfo.url);
          if (blob && blob.size < 50 * 1024 * 1024) { // 限制50MB
            itemFolder.file(fileInfo.filename, blob);
            completedFiles++;
            console.log(`Downloaded: ${fileInfo.filename} (${completedFiles}/${totalFiles})`);
          }
        },
        3 // 限制并发数为3
      );
    }
  }

  // 生成zip文件并下载
  try {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFileFromBlob(zipBlob, filename, 'application/zip');
  } catch (error) {
    console.error('Error generating zip file:', error);
  }
}

/**
 * 下载评论图片资源到一个文件夹（不分 image_1/image_2 子目录）
 */
export async function downloadCommentImages(
  items: CommentListItem[],
  filename: string = 'comments-resources.zip'
) {
  if (!items || items.length === 0) return;
  const zip = new JSZip();
  const folder = zip.folder('comments');
  if (!folder) return;

  // 收集所有图片
  const filesToDownload: Array<{ url: string; filename: string }> = [];
  items.forEach((item) => {
    (item.pictures || []).forEach((url, idx) => {
      if (!url) return;
      const ext = getFileExtension(url, 'jpg');
      const safeId = sanitizeFileName(item.id);
      filesToDownload.push({ url, filename: `comment_${safeId}_${idx + 1}.${ext}` });
    });
  });

  await downloadWithConcurrencyLimit(
    filesToDownload,
    async (f) => {
      const blob = await downloadFileAsBlob(f.url);
      if (blob && blob.size < 50 * 1024 * 1024) {
        folder.file(f.filename, blob);
      }
    },
    4
  );

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadFileFromBlob(zipBlob, filename, 'application/zip');
}

// 统一生成评论 CSV 的方法（导出 CSV 与资源打包共用）
function generateCommentsCSV(items: CommentListItem[], locale: string = 'zh'): string {
  const headers =
    locale === 'en'
      ? ['ID', 'User', 'Account', 'Content', 'Pictures', 'Time', 'Note Link', 'Likes', 'Replies']
      : ['ID', '用户', '账号', '评论内容', '回复图片', '评论时间', '笔记链接', '点赞', '回复'];

  const escapeCell = (v: string) => `"${(v || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
  const rows = items.map((i) =>
    [
      i.id,
      i.author.name,
      i.author.account,
      i.content,
      String((i.pictures || []).length),
      i.publishTime,
      i.noteLink,
      String(i.likes.raw),
      String(i.replies.raw),
    ].map(escapeCell).join(',')
  );
  return ['\uFEFF' + headers.join(','), ...rows].join('\n');
}

/**
 * 打包评论：CSV + 所有图片（统一放在 comments/ 目录）
 */
export async function downloadCommentBundle(
  items: CommentListItem[],
  filename: string = 'comments-content.zip',
  locale: string = 'zh'
) {
  if (!items || items.length === 0) return;
  const zip = new JSZip();
  const folder = zip.folder('comments');
  if (!folder) return;

  // 1) 生成 CSV 内容
  const csv = generateCommentsCSV(items, locale);
  zip.file('comments.csv', csv);

  // 2) 收集图片
  const filesToDownload: Array<{ url: string; filename: string }> = [];
  items.forEach((item) => {
    (item.pictures || []).forEach((url, idx) => {
      if (!url) return;
      const ext = getFileExtension(url, 'jpg');
      const safeId = sanitizeFileName(item.id);
      filesToDownload.push({ url, filename: `comment_${safeId}_${idx + 1}.${ext}` });
    });
  });

  await downloadWithConcurrencyLimit(
    filesToDownload,
    async (f) => {
      const blob = await downloadFileAsBlob(f.url);
      if (blob && blob.size < 50 * 1024 * 1024) {
        folder.file(f.filename, blob);
      }
    },
    4
  );

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadFileFromBlob(zipBlob, filename, 'application/zip');
}
/**
 * 导出评论为 CSV
 */
export function exportCommentsToCSV(
  items: CommentListItem[],
  filename: string = 'comments.csv',
  locale: string = 'zh'
) {
  if (!items || items.length === 0) return;
  const csv = generateCommentsCSV(items, locale);
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * 导出评论为 JSON（含元数据）
 */
export function exportCommentsToJSON(items: CommentListItem[], filename: string = 'comments.json') {
  if (!items || items.length === 0) return;
  const json = JSON.stringify(
    {
      exportTime: new Date().toISOString(),
      total: items.length,
      data: items,
    },
    null,
    2
  );
  downloadFile(json, filename, 'application/json;charset=utf-8;');
}

/**
 * 通用文件下载函数
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  // 创建Blob对象
  const blob = new Blob([content], { type: mimeType });
  
  // 创建下载链接
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // 触发下载
  document.body.appendChild(link);
  link.click();
  
  // 清理
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * 从Blob下载文件
 */
function downloadFileFromBlob(blob: Blob, filename: string, mimeType: string) {
  // 创建下载链接
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // 触发下载
  document.body.appendChild(link);
  link.click();
  
  // 清理
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * 格式化文件名，添加时间戳
 */
export function formatFilename(baseName: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${baseName}-${timestamp}.${extension}`;
}
