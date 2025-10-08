'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon } from 'lucide-react';
import { SearchResultsTable } from '@/components/xhs/search-results-table';
import { Skeleton } from '@/components/ui/skeleton';

export default function XhsSearchNotePage() {
  const t = useTranslations('Xhs.SearchNote');
  const [searchUrl, setSearchUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('note-search');

  const handleSearch = async () => {
    if (!searchUrl.trim()) return;
    
    setLoading(true);
    try {
      // TODO: 实现搜索逻辑
      console.log('Searching for:', searchUrl);
      // 模拟搜索延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
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
                onClick={handleSearch} 
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

            <SearchResultsTable loading={loading} />
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
                onClick={handleSearch} 
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

            <SearchResultsTable loading={loading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
