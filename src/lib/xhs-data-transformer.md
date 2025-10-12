# 小红书数据转换规则

## 数据转换说明

根据mockdata.json的数据结构，需要将原始API返回的数据转换为SearchResult接口格式。

### 1. images_list 转换规则

**原始数据路径**: `images_list[].url_size_large`
**目标字段**: `images_list[].url`

**转换逻辑**:
```typescript
// 从url_size_large获取URL，并去除?后面的参数
const transformImagesList = (imagesList: any[]) => {
  return imagesList.map(image => ({
    url: image.url_size_large?.split('?')[0] || ''
  }));
};
```

### 2. live_photo_list 转换规则

**原始数据路径**: `images_list[].live_photo.media.stream.h265[].master_url`
**目标字段**: `live_photo_list[].url`

**转换逻辑**:
```typescript
// 从live_photo.media.stream.h265获取master_url
const transformLivePhotoList = (imagesList: any[]) => {
  return imagesList
    .filter(image => image.live_photo?.media?.stream?.h265)
    .map(image => ({
      url: image.live_photo.media.stream.h265[0]?.master_url || ''
    }));
};
```

### 3. video_list 转换规则

**原始数据路径**: `video_info_v2.media.stream.h265[]` 或 `video_info_v2.media.stream.h264[]`
**目标字段**: `video_list[].master_url` 和 `video_list[].backup_urls`

**转换逻辑**:
```typescript
// 优先h265格式，按height选择最高分辨率
const transformVideoList = (videoInfo: any) => {
  if (!videoInfo?.media?.stream) return [];
  
  const { h265, h264 } = videoInfo.media.stream;
  
  // 优先选择h265格式
  let streams = h265 && h265.length > 0 ? h265 : h264;
  
  if (!streams || streams.length === 0) return [];
  
  // 按height排序，选择最高分辨率
  streams.sort((a: any, b: any) => b.height - a.height);
  
  return streams.map((stream: any) => ({
    master_url: stream.master_url || '',
    backup_urls: stream.backup_urls || []
  }));
};
```

### 4. coverImage 转换规则

**原始数据路径**: `image.first_frame`
**目标字段**: `basicInfo.coverImage`

**转换逻辑**:
```typescript
// 从image.first_frame获取，去除?后参数
const transformCoverImage = (image: any) => {
  return image?.first_frame?.split('?')[0] || '';
};
```

### 5. 完整转换函数示例

```typescript
export const transformXhsData = (rawData: any): SearchResult => {
  return {
    id: rawData.id || '',
    basicInfo: {
      coverImage: transformCoverImage(rawData.image),
      type: rawData.type || 'note',
      duration: rawData.video_info_v2?.capa?.duration?.toString(),
      title: rawData.title || '',
      desc: rawData.desc || '',
      author: {
        avatar: rawData.user?.images || '',
        name: rawData.user?.nickname || ''
      }
    },
    images_list: transformImagesList(rawData.images_list || []),
    video_list: rawData.type === 'video' ? transformVideoList(rawData.video_info_v2) : undefined,
    live_photo_list: transformLivePhotoList(rawData.images_list || []),
    publishTime: rawData.time_desc || '',
    interactionVolume: rawData.view_count?.toString() || '0',
    estimatedReads: rawData.view_count?.toString() || '0',
    collections: rawData.collected_count?.toString() || '0',
    comments: rawData.comments_count?.toString() || '0',
    shares: rawData.share_count?.toString() || '0',
    likes: rawData.likes?.toString() || '0'
  };
};
```

## 注意事项

1. **URL参数处理**: 所有URL都需要去除`?`后面的参数
2. **视频格式优先级**: 优先选择h265格式，如果不存在则选择h264
3. **分辨率选择**: 按height字段选择最高分辨率的视频
4. **可选字段处理**: live_photo_list是复杂对象，不一定存在
5. **类型判断**: video_list仅在type为'video'时提供
