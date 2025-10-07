import { HeaderSection } from '@/components/layout/header-section';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LocaleLink } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { getDashboardAppsAction } from '@/actions/get-dashboard-apps';
import type * as React from 'react';

export async function AppsSection() {
  const t = await getTranslations('Dashboard.apps');
  const locale = await getLocale();
  const res = await getDashboardAppsAction({ languageCode: locale });
  const apps = res?.data?.data ?? [] as { id: string; key?: string; title: string; description: string; icon: string; link: string }[];
  const learnMore = t('learnMore');

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
          {apps.map((app) => (
            <AppsCard
              key={app.id}
              title={app.title}
              description={app.description}
              link={app.link || '#'}
              icon={app.icon}
              learnMoreLabel={learnMore}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const AppsCard = ({
  title,
  description,
  icon,
  link = '#',
  learnMoreLabel,
}: {
  title: string;
  description: string;
  icon?: string;
  link?: string;
  learnMoreLabel: string;
}) => {

  return (
    <Card className="p-6 bg-transparent hover:bg-accent dark:hover:bg-card">
      <div className="relative">
        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-muted overflow-hidden">
          {renderIcon(icon, title)}
        </div>

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
              {learnMoreLabel}
              <ChevronRight className="ml-0 !size-3.5 opacity-50" />
            </LocaleLink>
          </Button>
        </div>
      </div>
    </Card>
  );
};

function renderIcon(icon: string | undefined, title: string) {
  if (icon && icon.trim().startsWith('<')) {
    return (
      <div
        className="h-10 w-10 [&_svg]:h-10 [&_svg]:w-10"
        dangerouslySetInnerHTML={{ __html: icon }}
      />
    );
  }
  if (icon && /^(https?:|data:)/.test(icon)) {
    return <img src={icon} alt={title} className="h-10 w-10 object-contain" />;
  }
  const initial = (title?.[0] || '?').toUpperCase();
  return (
    <div className="h-10 w-10 flex items-center justify-center text-sm font-medium text-muted-foreground">
      {initial}
    </div>
  );
}
