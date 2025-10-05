import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { getSession } from '@/lib/server';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

interface AdminI18nLayoutProps {
  children: React.ReactNode;
}

export default async function AdminI18nLayout({ children }: AdminI18nLayoutProps) {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    notFound();
  }

  const t = await getTranslations('Dashboard');
  const breadcrumbs = [
    { label: t('admin.title'), isCurrentPage: false },
    { label: 'I18n Translations', isCurrentPage: true },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">{children}</div>
        </div>
      </div>
    </>
  );
}


