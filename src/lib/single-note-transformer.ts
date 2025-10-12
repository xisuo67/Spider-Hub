import { SearchResult } from '@/components/xhs/search-results-table';

// 加载单条笔记数据
export async function loadSingleNoteData() {
  const singleNoteFiles = ['note.json', 'video.json', 'live.json'];
  const randomFile = singleNoteFiles[Math.floor(Math.random() * singleNoteFiles.length)];
  
  try {
    console.log(`Loading single note data from: ${randomFile}`);
    
    // 使用动态导入加载JSON文件
    let data;
    switch (randomFile) {
      case 'note.json':
        data = await import('../app/[locale]/(protected)/xhs/searchnote/single_note/note.json');
        break;
      case 'video.json':
        data = await import('../app/[locale]/(protected)/xhs/searchnote/single_note/video.json');
        break;
      case 'live.json':
        data = await import('../app/[locale]/(protected)/xhs/searchnote/single_note/live.json');
        break;
      default:
        throw new Error(`Unknown file: ${randomFile}`);
    }
    
    console.log('Successfully loaded single note data:', data.default || data);
    return data.default || data;
  } catch (error) {
    console.error('Error loading single note data:', error);
    return null;
  }
}

// 将单条笔记数据转换为SearchResult格式
export function transformSingleNoteToSearchResult(singleNoteData: any): SearchResult {
  const noteList = singleNoteData.data?.data?.[0]?.note_list?.[0];
  if (!noteList) {
    throw new Error('Invalid single note data');
  }

  // 基本信息 - 从note_list中获取数据
  const coverImage = noteList.images_list?.[0]?.url || '/placeholder-image.png';
  const contentType = noteList.video ? 'video' : 'note';
  const duration = noteList.video?.duration ? formatVideoDuration(noteList.video.duration) : undefined;
  const publishTime = noteList.time ? new Date(noteList.time * 1000).toLocaleString() : '';

  // 计算互动量
  const interactionVolumeRaw = (noteList.liked_count || 0) + (noteList.collected_count || 0) + (noteList.share_count || 0) + (noteList.comment_count || 0);
  const estimatedReadsRaw = Math.max((noteList.liked_count || 0) * 10, (noteList.collected_count || 0) * 5);

  return {
    id: noteList.note_id || 'single-note',
    basicInfo: {
      coverImage,
      type: contentType,
      duration,
      title: noteList.title || noteList.desc?.substring(0, 50) + '...' || '单条笔记',
      desc: noteList.desc || '',
      author: {
        avatar: noteList.user?.image || '/placeholder-avatar.png',
        name: noteList.user?.nickname || '未知用户'
      }
    },
    images_list: noteList.images_list?.filter((img: any) => img.url).map((img: any) => ({
      url: img.url
    })) || [],
    video_list: contentType === 'video' ? [{
      cover_image: noteList.images_list?.[0]?.url || '/placeholder-video.png',
      master_url: noteList.video?.url || '',
      backup_urls: []
    }] : undefined,
    live_photo_list: [],
    publishTime,
    interactionVolume: {
      formatted: formatNumber(interactionVolumeRaw),
      raw: interactionVolumeRaw
    },
    estimatedReads: {
      formatted: formatNumber(estimatedReadsRaw),
      raw: estimatedReadsRaw
    },
    collections: {
      formatted: formatNumber(noteList.collected_count || 0),
      raw: noteList.collected_count || 0
    },
    comments: {
      formatted: formatNumber(noteList.comments_count || 0),
      raw: noteList.comments_count || 0
    },
    shares: {
      formatted: formatNumber(noteList.shared_count || 0),
      raw: noteList.shared_count || 0
    },
    likes: {
      formatted: formatNumber(noteList.liked_count || 0),
      raw: noteList.liked_count || 0
    }
  };
}

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

// 格式化视频时长
function formatVideoDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
