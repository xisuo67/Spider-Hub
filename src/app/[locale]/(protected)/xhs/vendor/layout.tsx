import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { useTranslations } from 'next-intl';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('Xhs.Vendor');

  const breadcrumbs = [
    {
      label: 'XHS',
      href: '/xhs',
    },
    {
      label: t('title'),
      isCurrentPage: true,
    },
  ];

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      {children}
    </>
  );
}
