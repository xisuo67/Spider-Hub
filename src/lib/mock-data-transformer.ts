import { SearchResult } from '@/components/xhs/search-results-table';

// Mock数据接口定义
interface MockNote {
  cursor: string;
  title: string;
  desc: string;
  type: string; // 允许任何字符串类型
  user: {
    nickname: string;
    images: string;
    userid: string;
  };
  images_list?: Array<{
    url: string;
    url_size_large: string;
    height: number;
    width: number;
    live_photo?: {
      media?: {
        stream?: {
          h264?: Array<{
            master_url: string;
            backup_urls: string[];
            height: number;
            width: number;
          }>;
          h265?: Array<{
            master_url: string;
            backup_urls: string[];
            height: number;
            width: number;
          }>;
          h266?: Array<{
            master_url: string;
            backup_urls: string[];
            height: number;
            width: number;
          }>;
          av1?: Array<{
            master_url: string;
            backup_urls: string[];
            height: number;
            width: number;
          }>;
        };
      };
    };
  }>;
  collected_count: number;
  share_count: number;
  comments_count: number;
  likes: number;
  create_time: number;
  last_update_time: number;
  time_desc?: string;
  has_music?: boolean;
  video_info_v2?: {
    capa?: {
      duration: number;
    };
    image?: {
      first_frame: string;
    };
    media?: {
      stream?: {
        h264?: Array<{
          master_url: string;
          backup_urls: string[];
          height: number;
          width: number;
        }>;
        h265?: Array<{
          master_url: string;
          backup_urls: string[];
          height: number;
          width: number;
        }>;
        h266?: Array<{
          master_url: string;
          backup_urls: string[];
          height: number;
          width: number;
        }>;
        av1?: Array<{
          master_url: string;
          backup_urls: string[];
          height: number;
          width: number;
        }>;
      };
    };
  };
}

interface MockData {
  data: {
    data: {
      notes: MockNote[];
      has_more?: boolean;
      cursor?: string;
    };
  };
}

// 格式化时间戳为可读日期
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 格式化数字为K/M格式
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// 格式化视频时长（秒转换为分:秒格式）
function formatVideoDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 去除URL参数
function removeUrlParams(url: string): string {
  return url?.split('?')[0] || '';
}

// 转换images_list
function transformImagesList(imagesList: any[]): Array<{ url: string }> {
  if (!imagesList || imagesList.length === 0) return [];
  
  return imagesList.map(image => ({
    url: removeUrlParams(image.url_size_large || image.url || '')
  }));
}

// 转换live_photo_list
function transformLivePhotoList(imagesList: any[]): Array<{ url: string }> {
  if (!imagesList || imagesList.length === 0) return [];
  
  return imagesList
    .filter(image => image.live_photo?.media?.stream)
    .map(image => {
      const stream = image.live_photo.media.stream;
      
      // 收集所有格式的视频流
      const allStreams: any[] = [];
      
      // 检查所有可能的格式
      if (stream.h265 && stream.h265.length > 0) {
        allStreams.push(...stream.h265);
      }
      if (stream.h264 && stream.h264.length > 0) {
        allStreams.push(...stream.h264);
      }
      if (stream.h266 && stream.h266.length > 0) {
        allStreams.push(...stream.h266);
      }
      if (stream.av1 && stream.av1.length > 0) {
        allStreams.push(...stream.av1);
      }
      
      if (allStreams.length === 0) {
        return { url: '' };
      }
      
      // 按height排序，选择最高分辨率
      allStreams.sort((a: any, b: any) => b.height - a.height);
      
      return {
        url: removeUrlParams(allStreams[0]?.master_url || '')
      };
    });
}

// 转换video_list
function transformVideoList(videoInfo: any): Array<{ cover_image: string; master_url: string; backup_urls: string[] }> {
  if (!videoInfo?.media?.stream) return [];
  
  const stream = videoInfo.media.stream;
  
  // 收集所有格式的视频流
  const allStreams: any[] = [];
  
  // 检查所有可能的格式
  if (stream.h265 && stream.h265.length > 0) {
    allStreams.push(...stream.h265);
  }
  if (stream.h264 && stream.h264.length > 0) {
    allStreams.push(...stream.h264);
  }
  if (stream.h266 && stream.h266.length > 0) {
    allStreams.push(...stream.h266);
  }
  if (stream.av1 && stream.av1.length > 0) {
    allStreams.push(...stream.av1);
  }
  
  if (allStreams.length === 0) return [];
  
  // 按height排序，选择最高分辨率
  allStreams.sort((a: any, b: any) => b.height - a.height);
  
  // 只返回最高分辨率的视频
  const highestQualityStream = allStreams[0];
  
  return [{
    cover_image: removeUrlParams(videoInfo.image?.first_frame || ''),
    master_url: removeUrlParams(highestQualityStream.master_url || ''),
    backup_urls: highestQualityStream.backup_urls || []
  }];
}

// 转换mock数据为SearchResult格式
export function transformMockDataToSearchResults(mockData: MockData): SearchResult[] {
  if (!mockData?.data?.data?.notes) {
    return [];
  }

  return mockData.data.data.notes.map((note, index) => {
    // 获取封面图片
    const coverImage = note.images_list?.[0]?.url || note.images_list?.[0]?.url_size_large || '';
    
    // 判断内容类型
    const contentType = note.type === 'video' ? 'video' : 'note';
    
    // 获取视频时长
    const videoDuration = note.video_info_v2?.capa?.duration;
    const formattedDuration = videoDuration ? formatVideoDuration(videoDuration) : undefined;
    
    // 格式化发布时间 - 优先使用格式化的时间戳
    const publishTime = formatTimestamp(note.create_time);
    
    // 计算互动量（点赞+收藏+分享+评论）
    const interactionVolume = formatNumber(
      note.likes + note.collected_count + note.share_count + note.comments_count
    );
    
    // 估算阅读量（基于互动量估算）
    const estimatedReads = formatNumber(Math.max(note.likes * 10, note.collected_count * 5));
    
    return {
      id: note.cursor || `note-${index}`,
      basicInfo: {
        coverImage,
        type: contentType,
        duration: contentType === 'video' ? formattedDuration : undefined,
        title: note.title || note.desc.substring(0, 50) + '...',
        desc: note.desc || '',
        author: {
          avatar: note.user.images,
          name: note.user.nickname
        }
      },
      images_list: transformImagesList(note.images_list || []),
      video_list: contentType === 'video' ? transformVideoList(note.video_info_v2) : undefined,
      live_photo_list: transformLivePhotoList(note.images_list || []),
      publishTime,
      interactionVolume,
      estimatedReads,
      collections: formatNumber(note.collected_count),
      comments: formatNumber(note.comments_count),
      shares: formatNumber(note.share_count),
      likes: formatNumber(note.likes)
    };
  });
}

// 加载mock数据的函数
export async function loadMockData(): Promise<SearchResult[]> {
  try {
    // 直接导入mock数据
    const mockData = await import('@/app/[locale]/(protected)/xhs/searchnote/mockdata.json');
    return transformMockDataToSearchResults(mockData.default || mockData);
  } catch (error) {
    console.error('Failed to load mock data:', error);
    return [];
  }
}
