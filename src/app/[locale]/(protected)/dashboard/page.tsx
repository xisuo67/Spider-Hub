import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { AppsSection } from '@/components/apps/apps-section';
import { useTranslations } from 'next-intl';

/**
 * Dashboard page - displays social media platforms and apps
 */
export default function AppsPage() {
  const t = useTranslations('Dashboard.apps');

  const breadcrumbs = [
    {
      label: t('title'),
      isCurrentPage: true,
    },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />

      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <AppsSection />
          </div>
        </div>
      </div>
    </>
  );
}


