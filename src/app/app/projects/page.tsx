'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card, EmptyStateCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import {
  Plus,
  Search,
  Files,
  MessageSquareText,
  CalendarDays,
  Copy,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  status: 'WAITING_FOR_CLIENT' | 'CHANGES_REQUESTED' | 'APPROVED';
  shareUrl: string;
  deliverableCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'WAITING_FOR_CLIENT', label: 'Waiting' },
  { value: 'CHANGES_REQUESTED', label: 'Changes' },
  { value: 'APPROVED', label: 'Approved' },
] as const;

export default function ProjectsPage() {
  const { success, error: showError } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof filterOptions)[number]['value']>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function fetchProjects() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);

      // backend unchanged
      const response = await fetch(`/api/projects?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProjects(data.data.projects);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      showError('Error', 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }

  const filteredProjects = useMemo(() => {
    if (!search) return projects;
    const q = search.toLowerCase();
    return projects.filter((p) => {
      return (
        p.title.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.clientEmail.toLowerCase().includes(q)
      );
    });
  }, [projects, search]);

  async function copyShareLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      success('Copied', 'Share link copied to clipboard');
    } catch {
      showError('Error', 'Could not copy link');
    }
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage your client projects"
        action={
          <Button href="/app/projects/new">
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New project
            </span>
          </Button>
        }
      />

      {/* Toolbar */}
      <Card className="mb-6">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search by project, client name, or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-5 h-5" aria-hidden="true" />}
              />
            </div>

            {/* Optional small hint */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" aria-hidden="true" />
              Filter by status
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {filterOptions.map((option) => {
              const active = filter === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={[
                    'shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition',
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 ring-1 ring-gray-200',
                  ].join(' ')}
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}

            <div className="ml-auto hidden sm:block text-sm text-gray-500">
              {filteredProjects.length} result{filteredProjects.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>
      </Card>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={140} className="rounded-2xl" />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} hover className="p-0 overflow-hidden">
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/app/projects/${project.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-indigo-700 truncate"
                      >
                        {project.title}
                      </Link>
                      <StatusBadge status={project.status} />
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium text-gray-900">{project.clientName}</span>{' '}
                      <span className="text-gray-400">•</span> {project.clientEmail}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-2">
                        <Files className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        {project.deliverableCount} file{project.deliverableCount === 1 ? '' : 's'}
                      </span>

                      <span className="inline-flex items-center gap-2">
                        <MessageSquareText className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        {project.commentCount} comment{project.commentCount === 1 ? '' : 's'}
                      </span>

                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex sm:flex-col gap-2 sm:items-end">
                    <Button href={`/app/projects/${project.id}`} variant="secondary">
                      Open
                    </Button>
                    <Button href={`/app/projects/${project.id}`} >
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyStateCard
          icon={<Files className="w-12 h-12" aria-hidden="true" />}
          title={search ? 'No projects found' : 'No projects yet'}
          description={search ? 'Try a different search term.' : 'Create your first project to get started.'}
          action={!search ? <Button href="/app/projects/new">Create project</Button> : undefined}
        />
      )}
    </div>
  );
}