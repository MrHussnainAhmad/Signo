'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME } from '@/lib/config';
import { Avatar } from '@/components/ui/Avatar';
import { PlanBadge } from '@/components/ui/Badge';
import { LayoutDashboard, FolderKanban, CreditCard, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  workspace: {
    name: string;
    plan: 'UNPAID' | 'SOLO' | 'STUDIO';
  };
  onLogout: () => void;
}

const navItems = [
  { href: '/app', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/app/projects', label: 'Projects', Icon: FolderKanban },
  { href: '/app/billing', label: 'Billing', Icon: CreditCard },
  { href: '/app/settings', label: 'Settings', Icon: Settings },
] as const;

export function Sidebar({ user, workspace, onLogout }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/app') return pathname === '/app';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="p-4 border-b border-gray-200">
        <Link href="/app" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-500 leading-none">Workspace</p>
            <p className="text-lg font-bold text-gray-900 truncate leading-tight">{APP_NAME}</p>
          </div>
        </Link>
      </div>

      {/* Workspace card */}
      <div className="p-4 border-b border-gray-200">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500">Current workspace</p>
              <p className="mt-1 text-sm font-semibold text-gray-900 truncate">
                {workspace.name}
              </p>
            </div>
            <PlanBadge plan={workspace.plan} size="sm" />
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Manage projects, approvals, and billing.
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={[
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition',
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'inline-flex h-9 w-9 items-center justify-center rounded-xl transition',
                      active
                        ? 'bg-white/10'
                        : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200',
                    ].join(' ')}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>

                  <span className="truncate">{label}</span>

                  {/* Active indicator */}
                  {active && <span className="ml-auto h-2 w-2 rounded-full bg-white" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200">
        <div className="rounded-2xl border border-gray-200 bg-white p-3">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatarUrl} name={user.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>

            <button
              onClick={onLogout}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
              title="Log out"
              aria-label="Log out"
              type="button"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}