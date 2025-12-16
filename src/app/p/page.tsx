'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClientAuthLayout } from '@/components/layout/ClientLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast, ToastProvider } from '@/components/ui/Toast';
import { Folder, ArrowRight, LogOut } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  status: 'WAITING_FOR_CLIENT' | 'CHANGES_REQUESTED' | 'APPROVED';
  shareToken: string;
  shareUrl: string;
  workspaceName: string;
  createdAt: string;
}

function ClientDashboardContent() {
  const router = useRouter();
  const { error: showError } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/client/projects');
        const data = await response.json();

        if (response.ok && data.success) {
          setProjects(data.data.projects);
        } else {
          // If unauthorized, redirect to login
          if (response.status === 401) {
            router.push('/p/login');
          } else {
            showError('Error', 'Failed to load projects');
          }
        }
      } catch {
        showError('Error', 'Failed to connect to server');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, [router, showError]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Hard redirect to clear client state
      window.location.href = '/p/login';
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/p/login');
    }
  };

  if (isLoading) {
    return <PageLoader message="Loading your projects..." />;
  }

  return (
    <ClientAuthLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Projects</h1>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <span className="inline-flex items-center gap-2 text-gray-600">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </span>
        </Button>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    From {project.workspaceName} • {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={project.status} size="sm" />
                  </div>
                </div>

                <Link href={`/p/${project.shareToken}`}>
                  <Button variant="secondary" size="sm">
                    <span className="inline-flex items-center gap-2">
                      View
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <Folder className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No projects found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You haven't been invited to any projects yet.
          </p>
        </div>
      )}
    </ClientAuthLayout>
  );
}

export default function ClientDashboardPage() {
  return (
    <ToastProvider>
      <ClientDashboardContent />
    </ToastProvider>
  );
}