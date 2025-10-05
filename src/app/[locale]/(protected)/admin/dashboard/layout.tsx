import { getSession } from '@/lib/server';
import { notFound } from 'next/navigation';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default async function AdminDashboardLayout({
  children,
}: AdminDashboardLayoutProps) {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    notFound();
  }

  return children;
}


