import { AppLayout } from '@/components/layout/AppLayout';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AppRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (session && session.type === 'client') {
    redirect('/p');
  }

  return <AppLayout>{children}</AppLayout>;
}