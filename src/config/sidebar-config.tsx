'use client';

import { isDemoWebsite } from '@/lib/demo';
import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';
import {
  BellIcon,
  CircleUserRoundIcon,
  CoinsIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  LockKeyholeIcon,
  Settings2Icon,
  SettingsIcon,
  UsersRoundIcon,
  SmartphoneIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { websiteConfig } from './website';
import { useDynamicMenu } from '@/hooks/use-dynamic-menu';

/**
 * Get sidebar config with translations
 *
 * NOTICE: used in client components only
 *
 * docs:
 * https://mksaas.com/docs/config/sidebar
 *
 * @returns The sidebar config with translated titles and descriptions
 */
export function getSidebarLinks(): NestedMenuItem[] {
  const t = useTranslations('Dashboard');
  const { menuItems: dynamicMenuItems, loading, error } = useDynamicMenu();

  // if is demo website, allow user to access admin and user pages, but data is fake
  const isDemo = isDemoWebsite();

  // 基础菜单项
  const baseMenuItems: NestedMenuItem[] = [
    {
      title: t('dashboard.title'),
      icon: <LayoutDashboardIcon className="size-4 shrink-0" />,
      href: Routes.Dashboard,
      external: false,
    },
    {
      title: t('admin.title'),
      icon: <SettingsIcon className="size-4 shrink-0" />,
      authorizeOnly: isDemo ? ['admin', 'user'] : ['admin'],
      items: [
        {
          title: t('dashboard.title'),
          icon: <LayoutDashboardIcon className="size-4 shrink-0" />,
          href: Routes.AdminDashboard,
          external: false,
        },
        {
          title: t('admin.appItems.title'),
          icon: <SmartphoneIcon className="size-4 shrink-0" />,
          href: Routes.AdminAppItems,
          external: false,
        },
        {
          title: t('admin.i18nTranslations.title'),
          icon: <Settings2Icon className="size-4 shrink-0" />,
          href: Routes.AdminI18nTranslations,
          external: false,
        },
        {
          title: t('admin.users.title'),
          icon: <UsersRoundIcon className="size-4 shrink-0" />,
          href: Routes.AdminUsers,
          external: false,
        },
        {
          title: t('admin.settings.title'),
          icon: <Settings2Icon className="size-4 shrink-0" />,
          href: '/admin/settings',
          external: false,
        },
      ],
    },
    {
      title: t('settings.title'),
      icon: <Settings2Icon className="size-4 shrink-0" />,
      items: [
        {
          title: t('settings.profile.title'),
          icon: <CircleUserRoundIcon className="size-4 shrink-0" />,
          href: Routes.SettingsProfile,
          external: false,
        },
        {
          title: t('settings.billing.title'),
          icon: <CreditCardIcon className="size-4 shrink-0" />,
          href: Routes.SettingsBilling,
          external: false,
        },
        ...(websiteConfig.credits.enableCredits
          ? [
              {
                title: t('settings.credits.title'),
                icon: <CoinsIcon className="size-4 shrink-0" />,
                href: Routes.SettingsCredits,
                external: false,
              },
            ]
          : []),
        {
          title: t('settings.security.title'),
          icon: <LockKeyholeIcon className="size-4 shrink-0" />,
          href: Routes.SettingsSecurity,
          external: false,
        },
        // notifications menu hidden per request
      ],
    },
  ];

  // 如果动态菜单正在加载或出错，只返回基础菜单
  if (loading || error) {
    return baseMenuItems;
  }

  // 将动态菜单项插入到基础菜单中
  // 在dashboard之后插入动态菜单
  const result: NestedMenuItem[] = [
    baseMenuItems[0], // Dashboard
    ...dynamicMenuItems, // 动态菜单项
    ...baseMenuItems.slice(1), // 其余基础菜单项
  ];

  return result;
}
