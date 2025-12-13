'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card, StatCard, EmptyStateCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';

interface DashboardData {
  stats: {
    totalProjects: number;
    waitingProjects: number;
    approvedProjects: number;
    changesRequested: number;
  };
  recentProjects: Array<{
    id: string;
    title: string;
    clientName: string;
    status: 'WAITING_FOR_CLIENT' | 'CHANGES_REQUESTED' | 'APPROVED';
    updatedAt: string;
  }>;
  workspace: {
    plan: string;
    memberCount: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [projectsRes, billingRes] = await Promise.all([
          fetch('/api/projects?limit=5'),
          fetch('/api/billing/checkout'),
        ]);

        const projectsData = await projectsRes.json();
        const billingData = await billingRes.json();

        if (projectsData.success) {
          const projects = projectsData.data.projects;
          setData({
            stats: {
              totalProjects: projectsData.data.pagination.total,
              waitingProjects: projects.filter((p: any) => p.status === 'WAITING_FOR_CLIENT').length,
              approvedProjects: projects.filter((p: any) => p.status === 'APPROVED').length,
              changesRequested: projects.filter((p: any) => p.status === 'CHANGES_REQUESTED').length,
            },
            recentProjects: projects.slice(0, 5),
            workspace: {
              plan: billingData.data?.plan || 'UNPAID',
              memberCount: billingData.data?.memberCount || 1,
            },
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton width={200} height={32} className="mb-2" />
          <Skeleton width={300} height={20} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={120} className="rounded-xl" />
          ))}
        </div>
        <Skeleton height={300} className="rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your projects and activity"
        action={
          <Button href="/app/projects/new">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Projects"
          value={data?.stats.totalProjects || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
        />
        <StatCard
          label="Waiting for Client"
          value={data?.stats.waitingProjects || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Changes Requested"
          value={data?.stats.changesRequested || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <StatCard
          label="Approved"
          value={data?.stats.approvedProjects || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Recent Projects */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
          <Link href="/app/projects" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View all →
          </Link>
        </div>

        {data?.recentProjects && data.recentProjects.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {data.recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/app/projects/${project.id}`}
                className="flex items-center justify-between py-4 hover:bg-gray-50 -mx-6 px-6 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{project.title}</h3>
                  <p className="text-sm text-gray-500">{project.clientName}</p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={project.status} />
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyStateCard
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            }
            title="No projects yet"
            description="Create your first project to get started"
            action={
              <Button href="/app/projects/new">Create Project</Button>
            }
          />
        )}
      </Card>

      {/* Quick Actions */}
      {data?.workspace.plan === 'UNPAID' && (
        <Card className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Upgrade to unlock all features</h3>
              <p className="mt-1 text-indigo-100">
                Get unlimited projects and team collaboration
              </p>
            </div>
            <Button href="/app/billing" variant="secondary">
              View Plans
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}