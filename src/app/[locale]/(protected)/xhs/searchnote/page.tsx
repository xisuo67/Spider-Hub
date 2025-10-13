'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon, Upload } from 'lucide-react';
import { SearchResultsTable, SearchResult } from '@/components/xhs/search-results-table';
import { useSearchNoteColumns } from '@/components/xhs/search-note-columns';
import { CommentsResultsTable, CommentResult, useCommentsColumns } from '@/components/xhs/comments-results-table';
import { Skeleton } from '@/components/ui/skeleton';
import { loadMockData } from '@/lib/mock-data-transformer';
import { loadSingleNoteData, transformSingleNoteToSearchResult } from '@/lib/single-note-transformer';

// 模拟加载评论数据
const loadMockCommentData = async (): Promise<CommentResult[]> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      id: '1',
      author: {
        avatar: 'https://via.placeholder.com/40',
        name: '用户001',
        level: 5
      },
      content: '这个笔记真的很棒！学到了很多实用的技巧，感谢分享！',
      publishTime: '2025/1/15 14:30:25',
      likes: {
        formatted: '128',
        raw: 128
      },
      replies: {
        formatted: '12',
        raw: 12
      },
      isAuthor: false,
      isPinned: true
    },
    {
      id: '2',
      author: {
        avatar: 'https://via.placeholder.com/40',
        name: '作者回复',
        level: 8
      },
      content: '谢谢你的支持！如果有什么问题可以随时问我哦～',
      publishTime: '2025/1/15 15:45:10',
      likes: {
        formatted: '89',
        raw: 89
      },
      replies: {
        formatted: '3',
        raw: 3
      },
      isAuthor: true,
      isPinned: false
    },
    {
      id: '3',
      author: {
        avatar: 'https://via.placeholder.com/40',
        name: '用户002',
        level: 3
      },
      content: '请问这个产品在哪里可以买到？价格大概是多少？',
      publishTime: '2025/1/15 16:20:15',
      likes: {
        formatted: '45',
        raw: 45
      },
      replies: {
        formatted: '8',
        raw: 8
      },
      isAuthor: false,
      isPinned: false
    },
    {
      id: '4',
      author: {
        avatar: 'https://via.placeholder.com/40',
        name: '用户003',
        level: 7
      },
      content: '收藏了！这个教程写得很详细，步骤清晰易懂 👍',
      publishTime: '2025/1/15 17:10:30',
      likes: {
        formatted: '67',
        raw: 67
      },
      replies: {
        formatted: '2',
        raw: 2
      },
      isAuthor: false,
      isPinned: false
    },
    {
      id: '5',
      author: {
        avatar: 'https://via.placeholder.com/40',
        name: '用户004',
        level: 4
      },
      content: '试了一下这个方法，效果确实不错！推荐给大家',
      publishTime: '2025/1/15 18:05:45',
      likes: {
        formatted: '23',
        raw: 23
      },
      replies: {
        formatted: '1',
        raw: 1
      },
      isAuthor: false,
      isPinned: false
    }
  ];
};
import { expandUrl } from '@/lib/utils';
import { toast } from 'sonner';
import { Main } from '@/components/layout/main'
export default function XhsSearchNotePage() {
  const t = useTranslations('Xhs.SearchNote');
  const [searchUrl, setSearchUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('note-search');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [commentResults, setCommentResults] = useState<CommentResult[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [cursor, setCursor] = useState<string | null>(null);
  const columns = useSearchNoteColumns();
  const commentColumns = useCommentsColumns();

  const handleSearch = async (page = 1, currentCursor: string | null = null) => {
    if (!searchUrl.trim()) return;
    
    setLoading(true);
    try {
      // 先展开短链接
      const expandedUrl = await expandUrl(searchUrl);
      const finalSearchUrl = expandedUrl || searchUrl;
      
      // 根据当前 tab 进行不同的处理
      if (activeTab === 'note-search') {
        // 笔记搜索模式
        // 验证URL是否为有效的小红书链接
        if (!expandedUrl.includes('www.xiaohongshu.com/explore') && !expandedUrl.includes('www.xiaohongshu.com/user/profile')) {
          toast.error(t('invalidUrl'), {
            description: 'Only supports blogger homepage or note links'
          });
          setLoading(false);
          return;
        }
        
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
        
      } else if (activeTab === 'comment-search') {
        // 评论搜索模式
        // 验证URL是否为单条笔记链接
        if (!expandedUrl.includes('www.xiaohongshu.com/explore')) {
          toast.error(t('invalidUrl'), {
            description: 'Only supports single note links for comment search'
          });
          setLoading(false);
          return;
        }
        
        // 如果URL被展开，更新搜索框显示
        if (expandedUrl && expandedUrl !== searchUrl) {
          setSearchUrl(expandedUrl);
        }
        
        // 模拟加载评论数据
        const mockCommentResults = await loadMockCommentData();
        
        if (page === 1) {
          // 第一页，替换所有数据
          setCommentResults(mockCommentResults);
          setCurrentPage(1);
        } else {
          // 后续页面，追加数据
          setCommentResults(prev => [...prev, ...mockCommentResults]);
          setCurrentPage(page);
        }
      }
      
      // 模拟API返回的分页信息
      setHasMore(true); // 根据实际API返回的has_more字段设置
      setCursor('next_cursor_token'); // 根据实际API返回的cursor设置
      
      // 模拟搜索延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
    <Main>
      <div className='mb-2 flex items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {activeTab === 'note-search' ? t('noteSearchTitle') : t('commentSearchTitle')}
            </h2>
            <p className='text-muted-foreground'>
              {activeTab === 'note-search' ? t('noteSearchDescription') : t('commentSearchDescription')}
            </p>
          </div>
        {activeTab === 'note-search' && (
          <div className='flex items-center space-x-2'>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              {t('batchImport')}
            </Button>
          </div>
        )}
      </div>
        <Tabs value={activeTab}  onValueChange={setActiveTab} className="w-full">
          <TabsList variant="pill">
            <TabsTrigger 
              value="note-search" 
              variant="pill"
            >
              {t('noteSearch')}
            </TabsTrigger>
            <TabsTrigger 
              value="comment-search"
              variant="pill"
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

            <CommentsResultsTable 
              loading={loading} 
              data={commentResults} 
              columns={commentColumns}
              hasMore={hasMore}
              currentPage={currentPage}
              onNextPage={handleNextPage}
              onPrevPage={handlePrevPage}
            />
          </TabsContent>
        </Tabs>
    </Main>

  );
}
