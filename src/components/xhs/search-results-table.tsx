'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BasicInfoCell } from './basic-info-cell';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

export interface SearchResult {
  id: string;
  basicInfo: {
    coverImage: string;
    type: 'video' | 'note';
    duration?: string;
    title: string;
    author: {
      avatar: string;
      name: string;
    };
  };
  publishTime: string;
  interactionVolume: string;
  estimatedReads: string;
  collections: string;
  comments: string;
  shares: string;
  likes: string;
}

interface SearchResultsTableProps {
  loading?: boolean;
  data?: SearchResult[];
}

// 可配置的列定义
const columnConfig = [
  {
    key: 'basicInfo',
    label: 'basicInfo',
    sortable: false,
    visible: true,
    width: 'w-80'
  },
  {
    key: 'publishTime',
    label: 'publishTime',
    sortable: true,
    visible: true,
    width: 'w-32'
  },
  {
    key: 'interactionVolume',
    label: 'interactionVolume',
    sortable: true,
    visible: true,
    width: 'w-32'
  },
  {
    key: 'estimatedReads',
    label: 'estimatedReads',
    sortable: true,
    visible: true,
    width: 'w-32'
  },
  {
    key: 'collections',
    label: 'collections',
    sortable: true,
    visible: true,
    width: 'w-24'
  },
  {
    key: 'comments',
    label: 'comments',
    sortable: true,
    visible: true,
    width: 'w-24'
  },
  {
    key: 'shares',
    label: 'shares',
    sortable: true,
    visible: true,
    width: 'w-24'
  },
  {
    key: 'likes',
    label: 'likes',
    sortable: true,
    visible: true,
    width: 'w-24'
  }
];

export function SearchResultsTable({ loading = false, data = [] }: SearchResultsTableProps) {
  const t = useTranslations('Xhs.SearchNote');
  const [sortField, setSortField] = useState<string>('likes');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // 使用所有列，不再需要列显示控制
  const visibleColumnConfig = columnConfig;

  if (loading) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumnConfig.map((col) => (
                <TableHead key={col.key} className={col.width}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={index}>
                {visibleColumnConfig.map((col) => (
                  <TableCell key={col.key} className={col.width}>
                    <Skeleton className="h-16 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border">
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">{t('noResults')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 表格 */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumnConfig.map((col) => (
                <TableHead 
                  key={col.key} 
                  className={`${col.width} ${col.sortable ? 'cursor-pointer hover:bg-muted' : ''}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    <span>{t(col.label)}</span>
                    {col.sortable && (
                      <div className="flex flex-col">
                        <ChevronUpIcon 
                          className={`h-3 w-3 ${sortField === col.key && sortDirection === 'asc' ? 'text-primary' : 'text-muted-foreground'}`} 
                        />
                        <ChevronDownIcon 
                          className={`h-3 w-3 -mt-1 ${sortField === col.key && sortDirection === 'desc' ? 'text-primary' : 'text-muted-foreground'}`} 
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                {visibleColumnConfig.map((col) => (
                  <TableCell key={col.key} className={col.width}>
                    {col.key === 'basicInfo' ? (
                      <BasicInfoCell data={item.basicInfo} />
                    ) : (
                      <span className={col.key === 'likes' ? 'text-red-500 font-medium' : ''}>
                        {item[col.key as keyof SearchResult] as string}
                      </span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
