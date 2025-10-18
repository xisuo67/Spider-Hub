'use client';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface LoadMoreButtonProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

export function LoadMoreButton({
  hasMore,
  loading,
  onLoadMore
}: LoadMoreButtonProps) {
  const t = useTranslations('Xhs.SearchNote');

  if (!hasMore) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <Button 
        onClick={onLoadMore} 
        disabled={loading} 
        variant="outline" 
        className="flex items-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            <span>{t('loading')}</span>
          </>
        ) : (
          <span>{t('loadMore')}</span>
        )}
      </Button>
    </div>
  );
}
