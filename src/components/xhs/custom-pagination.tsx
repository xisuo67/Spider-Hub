'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CustomPaginationProps {
  hasMore: boolean;
  loading: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  currentPage: number;
  canGoBack: boolean;
}

export function CustomPagination({
  hasMore,
  loading,
  onNextPage,
  onPrevPage,
  currentPage,
  canGoBack
}: CustomPaginationProps) {
  const t = useTranslations('Common');

  return (
    <div className="flex items-center justify-end px-2 pb-1" style={{ marginBottom: '5px' }}>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={!canGoBack || loading}
          className="h-8 w-8 p-0"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center justify-center text-sm font-medium">
          第 {currentPage} 页
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!hasMore || loading}
          className="h-8 w-8 p-0"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
      
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground ml-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          {t('loading')}
        </div>
      )}
    </div>
  );
}
