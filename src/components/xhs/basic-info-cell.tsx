'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BasicInfoData {
  coverImage: string;
  type: 'video' | 'note';
  duration?: string;
  title: string;
  tags: string[];
  author: {
    avatar: string;
    name: string;
    badge?: string;
  };
}

interface BasicInfoCellProps {
  data: BasicInfoData;
}

export function BasicInfoCell({ data }: BasicInfoCellProps) {
  return (
    <div className="flex items-start gap-3 w-full">
      {/* 封面图片 */}
      <div className="relative flex-shrink-0">
        <img
          src={data.coverImage}
          alt={data.title}
          className="w-16 h-16 object-cover rounded-md"
        />
        {/* 类型标签 - 左上角 */}
        <div className="absolute top-1 left-1">
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs px-1.5 py-0.5",
              data.type === 'video' ? 'bg-blue-500' : 'bg-green-500'
            )}
          >
            {data.type === 'video' ? '视频' : '笔记'}
          </Badge>
        </div>
        {/* 视频时长 - 右下角 */}
        {data.type === 'video' && data.duration && (
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
            {data.duration}
          </div>
        )}
      </div>

      {/* 右侧内容 */}
      <div className="flex-1 min-w-0">
        {/* 标题 */}
        <h3 className="font-medium text-sm line-clamp-2 mb-2 leading-tight">
          {data.title}
        </h3>

        {/* 标签 */}
        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {data.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs px-1.5 py-0.5"
              >
                {tag}
              </Badge>
            ))}
            {data.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                +{data.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* 作者信息 */}
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={data.author.avatar} alt={data.author.name} />
            <AvatarFallback className="text-xs">
              {data.author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium truncate">
              {data.author.name}
            </span>
            {data.author.badge && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                {data.author.badge}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
