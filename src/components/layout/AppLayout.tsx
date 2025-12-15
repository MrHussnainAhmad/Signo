'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { PageLoader } from '@/components/ui/Spinner';
import { ToastProvider } from '@/components/ui/Toast';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  emailVerified: boolean;
}

interface Workspace {
  id: string;
  name: string;
  plan: 'UNPAID' | 'SOLO' | 'STUDIO';
  isOwner: boolean;
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (!response.ok || !data.success) {
          router.push('/login');
          return;
        }

        if (data.data.type !== 'team') {
          router.push('/login');
          return;
        }

        setUser(data.data.user);
        setWorkspace(data.data.workspace);
      } catch (error) {
        console.error('Failed to fetch session:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh(); 
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/login');
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading your workspace..." />;
  }

  if (!user || !workspace) {
    return null;
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar user={user} workspace={workspace} onLogout={handleLogout} />
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}

// Page Header Component
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-gray-600">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}