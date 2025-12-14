'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card, StatCard, EmptyStateCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import {
  Plus,
  Folder,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Users,
} from 'lucide-react';

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
        // backend unchanged
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

  const isUnpaid = useMemo(() => data?.workspace.plan === 'UNPAID', [data]);

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton width={200} height={32} className="mb-2" />
          <Skeleton width={320} height={20} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={120} className="rounded-2xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton height={320} className="rounded-2xl lg:col-span-8" />
          <Skeleton height={320} className="rounded-2xl lg:col-span-4" />
        </div>
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
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New project
            </span>
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Projects"
          value={data?.stats.totalProjects || 0}
          icon={<Folder className="w-6 h-6" aria-hidden="true" />}
        />
        <StatCard
          label="Waiting for Client"
          value={data?.stats.waitingProjects || 0}
          icon={<Clock className="w-6 h-6" aria-hidden="true" />}
        />
        <StatCard
          label="Changes Requested"
          value={data?.stats.changesRequested || 0}
          icon={<AlertTriangle className="w-6 h-6" aria-hidden="true" />}
        />
        <StatCard
          label="Approved"
          value={data?.stats.approvedProjects || 0}
          icon={<CheckCircle2 className="w-6 h-6" aria-hidden="true" />}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent projects */}
        <Card className="lg:col-span-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent projects</h2>
              <p className="text-sm text-gray-600">Latest activity from your workspace</p>
            </div>

            <Link
              href="/app/projects"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-800"
            >
              View all
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {data?.recentProjects && data.recentProjects.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {data.recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/app/projects/${project.id}`}
                  className="group block -mx-6 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{project.title}</p>
                      <p className="mt-1 text-sm text-gray-600 truncate">{project.clientName}</p>

                      <p className="mt-2 text-xs text-gray-500">
                        Updated {new Date(project.updatedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={project.status} />
                      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-500 transition" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyStateCard
              icon={<Folder className="w-12 h-12" aria-hidden="true" />}
              title="No projects yet"
              description="Create your first project to get started."
              action={<Button href="/app/projects/new">Create project</Button>}
            />
          )}
        </Card>

        {/* Right column: workspace + upgrade */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Workspace</h3>
                <p className="mt-1 text-sm text-gray-600">Plan and members</p>
              </div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-200">
                <Users className="h-5 w-5 text-gray-700" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Plan</span>
                <span className="font-semibold text-gray-900">{data?.workspace.plan || 'UNPAID'}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Members</span>
                <span className="font-semibold text-gray-900">{data?.workspace.memberCount || 1}</span>
              </div>
            </div>

            <div className="mt-5">
              <Button href="/app/billing" variant="secondary" fullWidth>
                <span className="inline-flex items-center gap-2">
                  <CreditCard className="h-4 w-4" aria-hidden="true" />
                  Billing
                </span>
              </Button>
            </div>
          </Card>

          {isUnpaid && (
            <Card className="border border-indigo-200 bg-indigo-50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Unlock the workspace</h3>
                  <p className="mt-1 text-sm text-gray-700">
                    Purchase a plan to enable the full workflow and team features.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <Button href="/app/billing" fullWidth>
                  View plans
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}