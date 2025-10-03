'use client';

import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { ArrowLeftIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AllPostsButton() {
  const t = useTranslations('BlogPage');
  return (
    <Button
      size="lg"
      variant="default"
      className="inline-flex items-center gap-2 group"
      asChild
    >
      <LocaleLink href="/blog">
        <ArrowLeftIcon
          className="w-5 h-5 
          transition-transform duration-200 group-hover:-translate-x-1"
        />
        <span>{t('allPosts')}</span>
      </LocaleLink>
    </Button>
  );
}
