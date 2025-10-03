import { ReleaseCard } from '@/components/changelog/release-card';
import Container from '@/components/layout/container';
import { constructMetadata } from '@/lib/metadata';
import { changelogSource } from '@/lib/source';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { NextPageProps } from '@/types/next-page-props';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

import '@/styles/mdx.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const pt = await getTranslations({ locale, namespace: 'ChangelogPage' });

  return constructMetadata({
    title: pt('title') + ' | ' + t('title'),
    description: pt('description'),
    canonicalUrl: getUrlWithLocale('/changelog', locale),
  });
}

export default async function ChangelogPage(props: NextPageProps) {
  const params = await props.params;
  if (!params) {
    notFound();
  }

  const locale = params.locale as Locale;
  const localeReleases = changelogSource.getPages(locale);
  const publishedReleases = localeReleases
    .filter((releaseItem) => releaseItem.data.published)
    .sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );

  if (!publishedReleases || publishedReleases.length === 0) {
    notFound();
  }

  const t = await getTranslations('ChangelogPage');

  return (
    <Container className="py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-center text-3xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-center text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Releases */}
        <div className="mt-8">
          {publishedReleases.map((releaseItem) => {
            return (
              <ReleaseCard
                key={releaseItem.data.version}
                releaseItem={releaseItem}
              />
            );
          })}
        </div>
      </div>
    </Container>
  );
}
