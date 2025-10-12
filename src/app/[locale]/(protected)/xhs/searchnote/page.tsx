'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon } from 'lucide-react';
import { SearchResultsTable, SearchResult } from '@/components/xhs/search-results-table';
import { useSearchNoteColumns } from '@/components/xhs/search-note-columns';
import { Skeleton } from '@/components/ui/skeleton';
import { loadMockData } from '@/lib/mock-data-transformer';
import { loadSingleNoteData, transformSingleNoteToSearchResult } from '@/lib/single-note-transformer';
import { expandUrl } from '@/lib/utils';
import { toast } from 'sonner';

export default function XhsSearchNotePage() {
  const t = useTranslations('Xhs.SearchNote');
  const [searchUrl, setSearchUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('note-search');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [cursor, setCursor] = useState<string | null>(null);
  const columns = useSearchNoteColumns();

  const handleSearch = async (page = 1, currentCursor: string | null = null) => {
    if (!searchUrl.trim()) return;
    
    setLoading(true);
    try {
      // 先展开短链接
      const expandedUrl = await expandUrl(searchUrl);
      const finalSearchUrl = expandedUrl || searchUrl;
      
      // 验证URL是否为有效的小红书链接
      if (!expandedUrl.includes('www.xiaohongshu.com/explore') && !expandedUrl.includes('www.xiaohongshu.com/user/profile')) {
        toast.error(t('invalidUrl'), {
          description: t('invalidUrlDescription')
        });
        setLoading(false);
        return;
      }else{
        // 如果URL被展开，更新搜索框显示
        if (expandedUrl && expandedUrl !== searchUrl) {
          setSearchUrl(expandedUrl);
        }
        
        // 判断是否为单条笔记链接
        let mockResults;
        if (expandedUrl.includes('www.xiaohongshu.com/explore')) {
          // 单条笔记，加载单条笔记数据
          const singleNoteData = await loadSingleNoteData();
          if (singleNoteData) {
            // 将单条笔记数据转换为SearchResult格式
            mockResults = [transformSingleNoteToSearchResult(singleNoteData)];
          } else {
            // 如果加载失败，使用默认mock数据
            mockResults = await loadMockData();
          }
        } else {
          // 博主首页，加载多条mock数据
          mockResults = await loadMockData();
        }
      
      if (page === 1) {
        // 第一页，替换所有数据
        setSearchResults(mockResults);
        setCurrentPage(1);
      } else {
        // 后续页面，追加数据
        setSearchResults(prev => [...prev, ...mockResults]);
        setCurrentPage(page);
      }
      
      // 模拟API返回的分页信息
      setHasMore(true); // 根据实际API返回的has_more字段设置
      setCursor('next_cursor_token'); // 根据实际API返回的cursor设置
      
      // 模拟搜索延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (hasMore && !loading) {
      handleSearch(currentPage + 1, cursor);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1 && !loading) {
      // 这里可以实现返回上一页的逻辑
      // 由于是动态API，可能需要重新请求或维护页面历史
      console.log('Go to previous page');
    }
  };

  return (
    <div className="w-full flex flex-col justify-start gap-6">
      <div className="px-4 lg:px-6 mt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList variant="underline">
            <TabsTrigger 
              value="note-search" 
              variant="underline"
            >
              {t('noteSearch')}
            </TabsTrigger>
            <TabsTrigger 
              value="comment-search"
              variant="underline"
            >
              {t('commentSearch')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="note-search" className="space-y-4 mt-3">
            <div className="flex gap-4">
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchUrl}
                onChange={(e) => setSearchUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => handleSearch(1, null)} 
                disabled={loading || !searchUrl.trim()}
                className="bg-red-500 hover:bg-red-600"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{t('searching')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <SearchIcon className="h-4 w-4" />
                    <span>{t('search')}</span>
                  </div>
                )}
              </Button>
            </div>

            <SearchResultsTable 
              loading={loading} 
              data={searchResults} 
              columns={columns}
              hasMore={hasMore}
              currentPage={currentPage}
              onNextPage={handleNextPage}
              onPrevPage={handlePrevPage}
            />
          </TabsContent>

          <TabsContent value="comment-search" className="space-y-4 mt-3">
            <div className="flex gap-4 mb-4">
              <Input
                placeholder={t('commentSearchPlaceholder')}
                value={searchUrl}
                onChange={(e) => setSearchUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => handleSearch(1, null)} 
                disabled={loading || !searchUrl.trim()}
                className="bg-red-500 hover:bg-red-600"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{t('searching')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <SearchIcon className="h-4 w-4" />
                    <span>{t('search')}</span>
                  </div>
                )}
              </Button>
            </div>

            <SearchResultsTable 
              loading={loading} 
              data={searchResults} 
              columns={columns}
              hasMore={hasMore}
              currentPage={currentPage}
              onNextPage={handleNextPage}
              onPrevPage={handlePrevPage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
