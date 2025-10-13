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
export function transformSingleNoteToSearchResult(singleNoteData: any): SearchResult[] {
  const noteLists: any[] = singleNoteData.data?.data?.[0]?.note_list || [];
  if (!Array.isArray(noteLists) || noteLists.length === 0) {
    throw new Error('Invalid single note data');
  }

  // 工具函数
  const removeUrlParams = (url: string) => url?.split('?')[0] || '';

  const pickHighestStream = (streamObj: any) => {
    if (!streamObj) return undefined;
    const buckets: any[] = [];
    if (Array.isArray(streamObj.h265)) buckets.push(...streamObj.h265);
    if (Array.isArray(streamObj.h264)) buckets.push(...streamObj.h264);
    if (Array.isArray(streamObj.h266)) buckets.push(...streamObj.h266);
    if (Array.isArray(streamObj.av1)) buckets.push(...streamObj.av1);
    if (buckets.length === 0) return undefined;
    buckets.sort((a, b) => (b.height || 0) - (a.height || 0));
    return buckets[0];
  };

  const transformImagesList = (imagesList: any[]): Array<{ url: string }> => {
    if (!Array.isArray(imagesList)) return [];
    return imagesList
      .map((img) => removeUrlParams(img?.url_size_large || img?.url || ''))
      .filter(Boolean)
      .map((url) => ({ url }));
  };

  const transformLivePhotoList = (imagesList: any[]): Array<{ url: string }> => {
    if (!Array.isArray(imagesList)) return [];
    // 按您的要求：从 live_photo.media.stream 下的 h264/h265/h266/av1 中选最高分辨率
    const candidates: any[] = [];
    for (const img of imagesList) {
      const streamObj = img?.live_photo?.media?.stream;
      if (!streamObj) continue;
      if (Array.isArray(streamObj.h265)) candidates.push(...streamObj.h265);
      if (Array.isArray(streamObj.h264)) candidates.push(...streamObj.h264);
      if (Array.isArray(streamObj.h266)) candidates.push(...streamObj.h266);
      if (Array.isArray(streamObj.av1)) candidates.push(...streamObj.av1);
    }
    if (candidates.length === 0) return [];
    const best = candidates.sort((a, b) => (b.height || 0) - (a.height || 0))[0];
    return [{ url: removeUrlParams(best.master_url || best.url || '') }];
  };

  const transformVideoList = (note: any): Array<{ cover_image: string; master_url: string; backup_urls: string[] }> => {
    // 优先使用 url_info_list（更稳定、直取可用地址）
    const urlList: any[] | undefined = note?.video?.url_info_list;
    let pick: any | undefined;
    if (Array.isArray(urlList) && urlList.length > 0) {
      // url_info_list 项通常包含 height/width/master_url/backup_urls
      pick = [...urlList].sort((a, b) => (b.height || 0) - (a.height || 0))[0];
    } else {
      // 兼容另外两种结构
      const streamObj = note?.video?.media?.stream || note?.video_info_v2?.media?.stream;
      pick = pickHighestStream(streamObj);
    }

    if (!pick) return [];
    const cover = removeUrlParams(
      note?.video_info_v2?.image?.first_frame || note?.images_list?.[0]?.url_size_large || note?.images_list?.[0]?.url || ''
    );
    return [
      {
        cover_image: cover || '/placeholder-video.png',
        master_url: removeUrlParams(pick.master_url || pick.url || ''),
        backup_urls: pick.backup_urls || [],
      },
    ];
  };

  const results: SearchResult[] = noteLists.map((noteList) => {
    const coverImage = removeUrlParams(
      noteList.images_list?.[0]?.url_size_large || noteList.images_list?.[0]?.url || ''
    ) || '/placeholder-image.png';
    const hasVideoStream = Boolean(
      (Array.isArray(noteList?.video?.url_info_list) && noteList.video.url_info_list.length > 0) ||
      noteList?.video?.media?.stream ||
      noteList?.video_info_v2?.media?.stream ||
      noteList?.video?.url
    );
    const contentType = hasVideoStream ? 'video' : 'note';
    const durationSeconds = noteList.video?.duration || noteList.video_info_v2?.capa?.duration;
    const duration = durationSeconds ? formatVideoDuration(durationSeconds) : undefined;
    const publishTime = noteList.time ? new Date(noteList.time * 1000).toLocaleString() : '';

    const interactionVolumeRaw = (noteList.liked_count || 0) + (noteList.collected_count || 0) + (noteList.share_count || 0) + (noteList.comment_count || 0);
    const estimatedReadsRaw = Math.max((noteList.liked_count || 0) * 10, (noteList.collected_count || 0) * 5);

    const item: SearchResult = {
      id: noteList.id,
      basicInfo: {
        coverImage,
        type: contentType,
        duration,
        title: noteList.title || noteList.desc?.substring(0, 50) + '...',
        desc: noteList.desc || '',
        author: {
          avatar: noteList.user?.image || '/placeholder-avatar.png',
          name: noteList.user?.nickname || '未知用户'
        }
      },
      images_list: transformImagesList(noteList.images_list || []),
      video_list: contentType === 'video' ? transformVideoList(noteList) : undefined,
      live_photo_list: transformLivePhotoList(noteList.images_list || []),
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
    return item;
  });

  return results;
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
