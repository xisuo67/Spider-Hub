'use client';

import { getAppItemsAction } from '@/actions/get-app-items';
import { listI18nTranslationsAction } from '@/actions/i18n-translations';
import type { NestedMenuItem } from '@/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

type AppItem = {
  id: string;
  key?: string | null;
  parentId?: string | null;
  title: string;
  description: string | null;
  enable: boolean;
  icon: string | null;
  link?: string | null;
  sortOrder: number;
};

type I18nTranslation = {
  id: number;
  key: string;
  languageCode: string;
  value: string;
};

/**
 * Hook to get dynamic menu items from app-items and i18n translations
 */
export function useDynamicMenu() {
  const [menuItems, setMenuItems] = useState<NestedMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('Dashboard');

  const fetchDynamicMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 获取当前语言代码
      const locale = document.documentElement.lang || 'en';
      
      // 获取所有app-items数据（可能需要分页）
      let allAppItems: AppItem[] = [];
      let pageIndex = 0;
      const pageSize = 100;
      let hasMore = true;

      while (hasMore) {
        const appItemsRes = await getAppItemsAction({ 
          pageIndex, 
          pageSize, 
          search: '' 
        });
        
        if (appItemsRes?.validationErrors) {
          console.error('App items validation errors:', appItemsRes.validationErrors);
          setError('Invalid parameters for app items request');
          return;
        }

        if (appItemsRes?.data?.success) {
          const items = appItemsRes.data.data.items as AppItem[];
          allAppItems = [...allAppItems, ...items];
          hasMore = items.length === pageSize;
          pageIndex++;
        } else {
          hasMore = false;
        }
      }

      // 获取i18n翻译数据
      const i18nRes = await listI18nTranslationsAction({
        pageIndex: 0,
        pageSize: 10000,
        search: '',
        languageCode: locale,
      });

      const appItems: AppItem[] = allAppItems;
      const translations: I18nTranslation[] = i18nRes?.data?.success
        ? (i18nRes.data.data.items as I18nTranslation[])
        : [];

      console.log('Dynamic menu data:', {
        appItems: appItems.length,
        translations: translations.length,
        i18nRes: i18nRes,
        locale: locale
      });

      // 检查i18n翻译是否有验证错误
      if (i18nRes?.validationErrors) {
        console.error('I18n translations validation errors:', i18nRes.validationErrors);
        setError('Invalid parameters for i18n translations request');
        return;
      }

      // 创建翻译映射
      const translationMap = new Map<string, string>();
      translations.forEach(t => {
        translationMap.set(t.key, t.value);
      });

      // 获取启用的父级项目（作为分组）
      const parentItems = appItems.filter(item => 
        item.enable && !item.parentId
      ).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      // 获取启用的子级项目
      const childItems = appItems.filter(item => 
        item.enable && item.parentId
      ).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

      console.log('Filtered items:', {
        parentItems: parentItems.length,
        childItems: childItems.length,
        parentItemsData: parentItems,
        childItemsData: childItems
      });

      // 构建动态菜单
      const dynamicMenuItems: NestedMenuItem[] = [];
      
      parentItems.forEach(parent => {
        // 获取该父级下的子项目
        const children = childItems.filter(child => child.parentId === parent.id);
        
        // 构建子菜单项
        const childMenuItems = children.map(child => ({
          title: translationMap.get(child.key || '') || child.title,
          href: child.link || '#',
          external: child.link?.startsWith('http'),
          icon: child.icon ? {
            type: 'html' as const,
            content: child.icon,
            className: 'size-4 shrink-0'
          } : undefined,
        }));

        // 只有当有子菜单时才添加父级分组
        if (childMenuItems.length > 0) {
          dynamicMenuItems.push({
            title: translationMap.get(parent.key || '') || parent.title,
            items: childMenuItems,
          });
        }
      });

      setMenuItems(dynamicMenuItems);
    } catch (error) {
      console.error('Failed to fetch dynamic menu:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDynamicMenu();
  }, [fetchDynamicMenu]);

  return { 
    menuItems, 
    loading, 
    error, 
    refetch: fetchDynamicMenu 
  };
}
