'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { APP_NAME } from '@/lib/config';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { ToastProvider } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Spinner';
import { ChevronDown, LogIn, LogOut, Sparkles } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/85 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-3">
              {/* Left: Workspace */}
              <div className="flex min-w-0 items-center gap-3">
                {workspace?.logoUrl ? (
                  <Image
                    src={workspace.logoUrl}
                    alt={workspace.name}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-xl object-cover ring-1 ring-gray-200"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-xl bg-gray-100 ring-1 ring-gray-200 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700">
                      {workspace?.name?.charAt(0) || 'S'}
                    </span>
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {workspace?.name || APP_NAME}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    Client portal
                  </p>
                </div>
              </div>

              {/* Right: Auth + Powered by */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
                  Powered by <span className="text-gray-900">{APP_NAME}</span>
                </div>

                {client ? (
                  <Dropdown
                    trigger={
                      <button
                        className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-50 transition-colors ring-1 ring-transparent hover:ring-gray-200"
                        aria-label="Open account menu"
                      >
                        <Avatar src={null} name={client.name} size="sm" />
                        <span className="hidden sm:block max-w-[160px] truncate text-sm font-medium text-gray-900">
                          {client.name}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      </button>
                    }
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.email}</p>
                    </div>

                    <DropdownItem onClick={handleLogout} danger>
                      <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        <span>Log out</span>
                      </div>
                    </DropdownItem>
                  </Dropdown>
                ) : (
                  <Link
                    href="/p/login"
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors"
                  >
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    Log in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="p-4 sm:p-6 lg:p-8">{children}</div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-500">
              Client portal powered by{' '}
              <a href="/" className="font-medium text-indigo-700 hover:text-indigo-800">
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3">
            {workspace?.logoUrl ? (
              <Image
                src={workspace.logoUrl}
                alt={workspace.name}
                width={56}
                height={56}
                className="h-14 w-14 rounded-2xl object-cover ring-1 ring-gray-200"
              />
            ) : (
              <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-sm">
                <Sparkles className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
            )}
          </div>

          <h1 className="mt-4 text-xl font-bold text-gray-900">
            {workspace?.name || APP_NAME}
          </h1>
          <p className="mt-1 text-sm text-gray-600">Client portal</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Powered by{' '}
          <a href="/" className="font-medium text-indigo-700 hover:text-indigo-800">
            {APP_NAME}
          </a>
        </p>
      </div>
    </div>
  );
}