'use client';

import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';
import { useTranslations } from 'next-intl';
import { websiteConfig } from './website';

/**
 * Get footer config with translations
 *
 * NOTICE: used in client components only
 *
 * docs:
 * https://mksaas.com/docs/config/footer
 *
 * @returns The footer config with translated titles
 */
export function getFooterLinks(): NestedMenuItem[] {
  const t = useTranslations('Marketing.footer');

  return [
    {
      title: t('product.title'),
      items: [
        {
          title: t('product.items.features'),
          href: Routes.Features,
          external: false,
        },
        {
          title: t('product.items.pricing'),
          href: Routes.Pricing,
          external: false,
        },
        {
          title: t('product.items.faq'),
          href: Routes.FAQ,
          external: false,
        },
      ],
    },
    {
      title: t('resources.title'),
      items: [
        ...(websiteConfig.blog.enable
          ? [
              {
                title: t('resources.items.blog'),
                href: Routes.Blog,
                external: false,
              },
            ]
          : []),
        ...(websiteConfig.docs.enable
          ? [
              {
                title: t('resources.items.docs'),
                href: Routes.Docs,
                external: false,
              },
            ]
          : []),
        {
          title: t('resources.items.changelog'),
          href: Routes.Changelog,
          external: false,
        },
        {
          title: t('resources.items.roadmap'),
          href: Routes.Roadmap,
          external: true,
        },
      ],
    },
    {
      title: t('company.title'),
      items: [
        {
          title: t('company.items.about'),
          href: Routes.About,
          external: false,
        },
        {
          title: t('company.items.contact'),
          href: Routes.Contact,
          external: false,
        },
        {
          title: t('company.items.waitlist'),
          href: Routes.Waitlist,
          external: false,
        },
      ],
    },
    {
      title: t('legal.title'),
      items: [
        {
          title: t('legal.items.cookiePolicy'),
          href: Routes.CookiePolicy,
          external: false,
        },
        {
          title: t('legal.items.privacyPolicy'),
          href: Routes.PrivacyPolicy,
          external: false,
        },
        {
          title: t('legal.items.termsOfService'),
          href: Routes.TermsOfService,
          external: false,
        },
      ],
    },
  ];
}
