'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { PageHeader } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Textarea } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Spinner';
import { StarDisplay } from '@/components/ui/StarRating';

import {
  Copy,
  ExternalLink,
  Eye,
  Download,
  Trash2,
  Files,
  MessageSquareText,
  CalendarDays,
  Mail,
  UserRound,
  SendHorizonal,
  ShieldAlert,
} from 'lucide-react';

interface Deliverable {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  webViewLink: string;
  downloadLink: string;
  versionNumber: number;
  createdAt: string;
}

interface Comment {
  id: string;
  authorType: 'CLIENT' | 'TEAM';
  authorName: string;
  body: string;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  status: 'WAITING_FOR_CLIENT' | 'CHANGES_REQUESTED' | 'APPROVED';
  shareToken: string;
  shareUrl: string;
  createdAt: string;
  updatedAt: string;
  deliverables: Deliverable[];
  comments: Comment[];
  review: {
    rating: number;
    text: string;
    authorName: string;
    createdAt: string;
  } | null;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function fileKindIcon(mimeType: string) {
  // keep it simple and reliable
  return <Files className="h-5 w-5 text-gray-700" aria-hidden="true" />;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function fetchProject() {
    try {
      // backend unchanged
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();

      if (data.success) {
        setProject(data.data.project);
      } else {
        showError('Error', 'Project not found');
        router.push('/app/projects');
      }
    } catch {
      showError('Error', 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpload(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    // backend unchanged
    const response = await fetch(`/api/projects/${projectId}/deliverables`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    success('File Uploaded', `${file.name} has been uploaded successfully`);
    fetchProject();
  }

  async function handleDeleteDeliverable(deliverableId: string) {
    try {
      // backend unchanged
      const response = await fetch(
        `/api/projects/${projectId}/deliverables?deliverableId=${deliverableId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        success('File Deleted', 'The file has been removed');
        fetchProject();
      }
    } catch {
      showError('Error', 'Failed to delete file');
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      // backend unchanged
      const response = await fetch(`/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        fetchProject();
      }
    } catch {
      showError('Error', 'Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  }

  async function handleDeleteProject() {
    setIsDeleting(true);
    try {
      // backend unchanged
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success('Project Deleted', 'The project has been deleted');
        router.push('/app/projects');
      }
    } catch {
      showError('Error', 'Failed to delete project');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }

  async function copyShareLink() {
    if (!project) return;
    try {
      await navigator.clipboard.writeText(project.shareUrl);
      success('Link Copied', 'Share link copied to clipboard');
    } catch {
      showError('Error', 'Failed to copy link');
    }
  }

  const openClientHref = useMemo(() => {
    if (!project) return '#';
    // Prefer the canonical shareUrl your backend provides
    return project.shareUrl;
  }, [project]);

  if (isLoading) return <PageLoader message="Loading project..." />;
  if (!project) return null;

  const canEdit = project.status !== 'APPROVED';

  return (
    <div>
      <PageHeader
        title={project.title}
        description={`${project.clientName} • ${project.clientEmail}`}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={project.status} size="lg" />

            <Button variant="secondary" onClick={copyShareLink}>
              <span className="inline-flex items-center gap-2">
                <Copy className="h-4 w-4" aria-hidden="true" />
                Copy share link
              </span>
            </Button>

            <a
              href={openClientHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button variant="secondary">
                <span className="inline-flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Open client view
                </span>
              </Button>
            </a>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Deliverables */}
          <Card className="p-0 overflow-hidden">
            <CardHeader
              action={
                <span className="text-sm text-gray-500">
                  {project.deliverables.length} file(s)
                </span>
              }
            >
              <CardTitle>Deliverables</CardTitle>
            </CardHeader>

            <div className="px-6 pb-6">
              {canEdit && (
                <div className="mb-5">
                  <FileUpload
                    onUpload={handleUpload}
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,video/*,audio/*"
                    maxSize={100 * 1024 * 1024}
                    hint="Max 100MB. Images, PDFs, documents, videos, and archives."
                  />
                </div>
              )}

              {project.deliverables.length > 0 ? (
                <div className="space-y-3">
                  {project.deliverables.map((d) => (
                    <div
                      key={d.id}
                      className="rounded-2xl border border-gray-200 bg-white p-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-200">
                            {fileKindIcon(d.mimeType)}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {d.fileName}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                              {formatFileSize(d.fileSize)}
                              <span className="mx-2 text-gray-300">•</span>
                              <span className="font-medium text-gray-900">v{d.versionNumber}</span>
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Uploaded {new Date(d.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={d.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex"
                            title="View"
                          >
                            <Button variant="secondary" size="sm">
                              <span className="inline-flex items-center gap-2">
                                <Eye className="h-4 w-4" aria-hidden="true" />
                                View
                              </span>
                            </Button>
                          </a>

                          <a
                            href={d.downloadLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex"
                            title="Download"
                          >
                            <Button variant="secondary" size="sm">
                              <span className="inline-flex items-center gap-2">
                                <Download className="h-4 w-4" aria-hidden="true" />
                                Download
                              </span>
                            </Button>
                          </a>

                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDeliverable(d.id)}
                              title="Delete"
                            >
                              <span className="inline-flex items-center gap-2 text-red-700">
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                Delete
                              </span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                  <p className="font-semibold text-gray-900">No deliverables yet</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Upload files to start the review process.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Comments */}
          <Card className="p-0 overflow-hidden">
            <CardHeader
              action={
                <span className="text-sm text-gray-500">
                  {project.comments.length} comment(s)
                </span>
              }
            >
              <CardTitle>Comments</CardTitle>
            </CardHeader>

            <div className="px-6 pb-6">
              {project.comments.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {project.comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <Avatar name={c.authorName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{c.authorName}</span>
                          <span
                            className={[
                              'text-xs px-2 py-0.5 rounded-full font-medium ring-1',
                              c.authorType === 'CLIENT'
                                ? 'bg-indigo-50 text-indigo-700 ring-indigo-200'
                                : 'bg-gray-50 text-gray-700 ring-gray-200',
                            ].join(' ')}
                          >
                            {c.authorType === 'CLIENT' ? 'Client' : 'Team'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(c.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="mt-2 rounded-2xl border border-gray-200 bg-white p-3">
                          <p className="text-gray-700 whitespace-pre-wrap">{c.body}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center mb-6">
                  <p className="font-semibold text-gray-900">No comments yet</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Add a note for your client or your team.
                  </p>
                </div>
              )}

              {canEdit && (
                <form onSubmit={handleSubmitComment}>
                  <Textarea
                    label="Add a comment"
                    placeholder="Write an update, question, or note…"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-3"
                  />
                  <Button
                    type="submit"
                    isLoading={isSubmittingComment}
                    disabled={!newComment.trim()}
                  >
                    <span className="inline-flex items-center gap-2">
                      <SendHorizonal className="h-4 w-4" aria-hidden="true" />
                      Post comment
                    </span>
                  </Button>
                </form>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Project details */}
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-5">
              <h3 className="text-lg font-semibold text-gray-900">Project details</h3>
              <p className="mt-1 text-sm text-gray-600">Quick info and actions</p>
            </div>

            <div className="px-6 py-6">
              <dl className="space-y-4 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-gray-500 inline-flex items-center gap-2">
                    <StatusBadge status={project.status} />
                    Status
                  </dt>
                  <dd className="font-semibold text-gray-900">{project.status}</dd>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <dt className="text-gray-500 inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                    Client
                  </dt>
                  <dd className="text-gray-900 text-right">{project.clientName}</dd>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <dt className="text-gray-500 inline-flex items-center gap-2">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Email
                  </dt>
                  <dd className="text-gray-900 text-right break-words">{project.clientEmail}</dd>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <dt className="text-gray-500 inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    Created
                  </dt>
                  <dd className="text-gray-900 text-right">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </dd>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <dt className="text-gray-500">Share link</dt>
                  <dd className="text-right">
                    <button
                      onClick={copyShareLink}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-800"
                      type="button"
                    >
                      <Copy className="h-4 w-4" aria-hidden="true" />
                      Copy
                    </button>
                  </dd>
                </div>
              </dl>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <a href={project.shareUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" fullWidth>
                    <span className="inline-flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      Open client view
                    </span>
                  </Button>
                </a>

                <Link href="/app/projects">
                  <Button variant="secondary" fullWidth>
                    Back to projects
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Review */}
          {project.review && (
            <Card className="p-0 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-900">Client review</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Submitted {new Date(project.review.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="px-6 py-6">
                <StarDisplay rating={project.review.rating} size="md" />
                {project.review.text && (
                  <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                    “{project.review.text}”
                  </p>
                )}
                <p className="mt-3 text-xs text-gray-500">
                  — {project.review.authorName}
                </p>
              </div>
            </Card>
          )}

          {/* Danger zone */}
          <Card className="p-0 overflow-hidden border-red-200">
            <div className="border-b border-red-200 px-6 py-5 bg-red-50">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-red-700">Danger zone</h3>
                  <p className="mt-1 text-sm text-red-700/80">
                    Permanent actions
                  </p>
                </div>
                <ShieldAlert className="h-5 w-5 text-red-700" aria-hidden="true" />
              </div>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm text-gray-700 mb-4">
                Deleting this project permanently removes deliverables and comments.
              </p>

              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                fullWidth
              >
                <span className="inline-flex items-center gap-2">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete project
                </span>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteProject}
        title="Delete project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}