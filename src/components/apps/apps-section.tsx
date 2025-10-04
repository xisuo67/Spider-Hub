import { HeaderSection } from '@/components/layout/header-section';
import {
  Xiaohongshu,
  Douyin,
  TikTok,
  X,
  Instagram,
  Weibo,
  YouTube,
} from '@/components/tailark/logos';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LocaleLink } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type * as React from 'react';

export function AppsSection() {
  const t = useTranslations('Dashboard.apps');

  return (
    <section className="px-4">
      <div className="mx-auto max-w-5xl">
        <HeaderSection
          title={t('title')}
          subtitle={t('subtitle')}
          description={t('description')}
          subtitleAs="h2"
          descriptionAs="p"
        />

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AppsCard
            title={t('items.xiaohongshu.title')}
            description={t('items.xiaohongshu.description')}
            link="https://www.xiaohongshu.com"
          >
            <Xiaohongshu />
          </AppsCard>

          <AppsCard
            title={t('items.douyin.title')}
            description={t('items.douyin.description')}
            link="https://www.douyin.com"
          >
            <Douyin />
          </AppsCard>

          <AppsCard
            title={t('items.tiktok.title')}
            description={t('items.tiktok.description')}
            link="https://www.tiktok.com"
          >
            <TikTok />
          </AppsCard>

          <AppsCard
            title={t('items.x.title')}
            description={t('items.x.description')}
            link="https://x.com"
          >
            <X />
          </AppsCard>

          <AppsCard
            title={t('items.instagram.title')}
            description={t('items.instagram.description')}
            link="https://www.instagram.com"
          >
            <Instagram />
          </AppsCard>

          <AppsCard
            title={t('items.weibo.title')}
            description={t('items.weibo.description')}
            link="https://weibo.com"
          >
            <Weibo />
          </AppsCard>

          <AppsCard
            title={t('items.youtube.title')}
            description={t('items.youtube.description')}
            link="https://www.youtube.com"
          >
            <YouTube />
          </AppsCard>
        </div>
      </div>
    </section>
  );
}

const AppsCard = ({
  title,
  description,
  children,
  link = '#',
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  link?: string;
}) => {
  const t = useTranslations('Dashboard.apps');

  return (
    <Card className="p-6 bg-transparent hover:bg-accent dark:hover:bg-card">
      <div className="relative">
        <div className="*:size-10">{children}</div>

        <div className="space-y-2 py-6">
          <h3 className="text-base font-medium">{title}</h3>
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {description}
          </p>
        </div>

        <div className="flex gap-3 border-t border-dashed pt-6">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-1 pr-2 shadow-none"
          >
            <LocaleLink href={link}>
              {t('learnMore')}
              <ChevronRight className="ml-0 !size-3.5 opacity-50" />
            </LocaleLink>
          </Button>
        </div>
      </div>
    </Card>
  );
};
