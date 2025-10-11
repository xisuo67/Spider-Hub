import { SearchResult } from '@/components/xhs/search-results-table';

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
      '互动量',
      '预估阅读数',
      '收藏数',
      '评论数',
      '分享数',
      '点赞数',
      '视频时长',
      '封面图片'
    ],
    en: [
      'ID',
      'Title',
      'Description',
      'Author',
      'Type',
      'Publish Time',
      'Interaction Volume',
      'Estimated Reads',
      'Collections',
      'Comments',
      'Shares',
      'Likes',
      'Video Duration',
      'Cover Image'
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

  // 转换数据为CSV格式
  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      `"${item.id}"`,
      `"${item.basicInfo.title.replace(/"/g, '""')}"`,
      `"${item.basicInfo.desc.replace(/"/g, '""')}"`,
      `"${item.basicInfo.author.name}"`,
      `"${item.basicInfo.type}"`,
      `"${item.publishTime}"`,
      `"${item.interactionVolume}"`,
      `"${item.estimatedReads}"`,
      `"${item.collections}"`,
      `"${item.comments}"`,
      `"${item.shares}"`,
      `"${item.likes}"`,
      `"${item.basicInfo.duration || ''}"`,
      `"${item.basicInfo.coverImage}"`
    ].join(','))
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
 * 下载图片和文本内容
 */
export function downloadImagesAndText(data: SearchResult[], filename: string = 'search-results-content.zip') {
  if (data.length === 0) {
    console.warn('No data to download');
    return;
  }

  // 创建包含图片和文本的数据结构
  const contentData = data.map((item, index) => ({
    id: item.id,
    title: item.basicInfo.title,
    author: item.basicInfo.author.name,
    type: item.basicInfo.type,
    publishTime: item.publishTime,
    coverImage: item.basicInfo.coverImage,
    duration: item.basicInfo.duration,
    textContent: {
      title: item.basicInfo.title,
      author: item.basicInfo.author.name,
      publishTime: item.publishTime,
      interactionVolume: item.interactionVolume,
      estimatedReads: item.estimatedReads,
      collections: item.collections,
      comments: item.comments,
      shares: item.shares,
      likes: item.likes
    }
  }));

  const jsonContent = JSON.stringify({
    exportInfo: {
      exportTime: new Date().toISOString(),
      totalRecords: data.length,
      version: '1.0',
      source: 'XHS Search Results - Images & Text'
    },
    data: contentData
  }, null, 2);

  // 创建并下载文件
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
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
 * 格式化文件名，添加时间戳
 */
export function formatFilename(baseName: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${baseName}-${timestamp}.${extension}`;
}
