'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function BasicInfoSkeleton() {
  return (
    <div className="flex items-start gap-3 w-full max-w-xs">
      {/* 封面图片骨架 */}
      <div className="relative flex-shrink-0">
        <Skeleton className="w-28 h-34 rounded-md" />
        {/* 类型标签骨架 */}
        <div className="absolute top-1 right-1">
          <Skeleton className="h-4 w-8 rounded" />
        </div>
        {/* 视频时长骨架 */}
        <div className="absolute bottom-1 right-1">
          <Skeleton className="h-4 w-12 rounded" />
        </div>
      </div>

      {/* 右侧内容骨架 */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-34">
        {/* 标题骨架 */}
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* 描述文案骨架 */}
        <div className="space-y-1 mt-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>

        {/* 作者信息骨架 - 固定在底部 */}
        <div className="flex items-center gap-2 mt-auto">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}
