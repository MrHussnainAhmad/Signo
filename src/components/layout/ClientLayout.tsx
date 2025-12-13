'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { APP_NAME } from '@/lib/config';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown, DropdownItem, DropdownDivider } from '@/components/ui/Dropdown';
import { ToastProvider } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Spinner';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface ClientLayoutProps {
  children: React.ReactNode;
  workspace?: {
    name: string;
    logoUrl?: string | null;
  };
}

export function ClientLayout({ children, workspace }: ClientLayoutProps) {
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (response.ok && data.success && data.data.type === 'client') {
          setClient(data.data.user);
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading..." />;
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Workspace Logo/Name */}
              <div className="flex items-center gap-3">
                {workspace?.logoUrl ? (
                  <img
                    src={workspace.logoUrl}
                    alt={workspace.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {workspace?.name?.charAt(0) || 'S'}
                    </span>
                  </div>
                )}
                <span className="font-medium text-gray-900">
                  {workspace?.name || APP_NAME}
                </span>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">
                  Powered by {APP_NAME}
                </span>
                
                {client ? (
                  <Dropdown
                    trigger={
                      <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <Avatar src={null} name={client.name} size="sm" />
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    }
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.email}</p>
                    </div>
                    <DropdownItem onClick={handleLogout} danger>
                      Log out
                    </DropdownItem>
                  </Dropdown>
                ) : (
                  <Link
                    href="/p/login"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Log in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-500">
              Client portal powered by{' '}
              <a href="/" className="text-indigo-600 hover:text-indigo-700">
                {APP_NAME}
              </a>
            </p>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}

// Unauthenticated Client Layout
interface ClientAuthLayoutProps {
  children: React.ReactNode;
  workspace?: {
    name: string;
    logoUrl?: string | null;
  };
}

export function ClientAuthLayout({ children, workspace }: ClientAuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            {workspace?.logoUrl ? (
              <img
                src={workspace.logoUrl}
                alt={workspace.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>
          {workspace?.name && (
            <h2 className="text-lg font-medium text-gray-900">{workspace.name}</h2>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Powered by{' '}
          <a href="/" className="text-indigo-600 hover:text-indigo-700">
            {APP_NAME}
          </a>
        </p>
      </div>
    </div>
  );
}