'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { ClientLayout, ClientAuthLayout } from '@/components/layout/ClientLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Textarea } from '@/components/ui/Input';
import { ConfirmModal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast, ToastProvider } from '@/components/ui/Toast';

import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  MessageSquareText,
  PencilLine,
  SendHorizonal,
} from 'lucide-react';

interface Deliverable {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  webViewLink: string;
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
  status: 'WAITING_FOR_CLIENT' | 'CHANGES_REQUESTED' | 'APPROVED';
  workspace: {
    name: string;
    logoUrl: string | null;
  };
  deliverables: Deliverable[];
  comments: Comment[];
  hasReview: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function statusCopy(status: Project['status']) {
  switch (status) {
    case 'APPROVED':
      return {
        title: 'Approved',
        body: 'This project has been approved.',
      };
    case 'CHANGES_REQUESTED':
      return {
        title: 'Changes requested',
        body: 'The team has been notified and will follow up with updates.',
      };
    case 'WAITING_FOR_CLIENT':
    default:
      return {
        title: 'Waiting for you',
        body: 'Review deliverables and leave feedback or approve.',
      };
  }
}

function DeliverableIcon({ mimeType }: { mimeType: string }) {
  if (mimeType?.startsWith('image/')) {
    return <ImageIcon className="h-5 w-5 text-sky-700" aria-hidden="true" />;
  }
  return <FileText className="h-5 w-5 text-gray-700" aria-hidden="true" />;
}

function ClientPortalContent() {
  const params = useParams();
  const router = useRouter();
  const { success, error: showError } = useToast();

  const shareToken = params.shareToken as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [canInteract, setCanInteract] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [showApproveModal, setShowApproveModal] = useState(false);

  const [showChangesModal, setShowChangesModal] = useState(false);
  const [changesNote, setChangesNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliverablesCount = project?.deliverables?.length ?? 0;
  const commentsCount = project?.comments?.length ?? 0;

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareToken]);

  async function fetchProject() {
    try {
      // backend unchanged
      const response = await fetch(`/api/client/projects/${shareToken}`);
      const data = await response.json();

      if (data.success) {
        setProject(data.data.project);
        setIsAuthenticated(data.data.isAuthenticated);
        setCanInteract(data.data.canInteract);
        setClientEmail(data.data.clientEmail);
      } else {
        showError('Error', 'Project not found');
      }
    } catch {
      showError('Error', 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      // backend unchanged
      const response = await fetch(`/api/client/projects/${shareToken}/comments`, {
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

  async function handleApprove() {
    setIsSubmitting(true);
    try {
      // backend unchanged
      const response = await fetch(`/api/client/projects/${shareToken}/approve`, {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        success('Project Approved', 'The project has been approved successfully');
        router.push(`/p/${shareToken}/review`);
      } else {
        showError('Error', data.error || 'Failed to approve project');
      }
    } catch {
      showError('Error', 'Failed to approve project');
    } finally {
      setIsSubmitting(false);
      setShowApproveModal(false);
    }
  }

  async function handleRequestChanges() {
    setIsSubmitting(true);
    try {
      // backend unchanged
      const response = await fetch(`/api/client/projects/${shareToken}/request-changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: changesNote }),
      });

      if (response.ok) {
        success('Changes Requested', 'Your feedback has been sent to the team');
        setChangesNote('');
        fetchProject();
      }
    } catch {
      showError('Error', 'Failed to request changes');
    } finally {
      setIsSubmitting(false);
      setShowChangesModal(false);
    }
  }

  const authLoginHref = useMemo(
    () => `/p/login?redirect=/p/${shareToken}&email=${encodeURIComponent(clientEmail)}`,
    [shareToken, clientEmail]
  );

  const authSignupHref = useMemo(
    () => `/p/signup?redirect=/p/${shareToken}&email=${encodeURIComponent(clientEmail)}`,
    [shareToken, clientEmail]
  );

  if (isLoading) {
    return <PageLoader message="Loading project..." />;
  }

  if (!project) {
    return (
      <ClientAuthLayout>
        <div className="text-center py-12">
          <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-200">
            <AlertTriangle className="h-7 w-7 text-red-700" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
          <p className="text-gray-600">
            This project may have been deleted or the link is invalid.
          </p>
        </div>
      </ClientAuthLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <ClientAuthLayout workspace={project.workspace}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h1>
          <p className="text-gray-600 mb-6">
            Log in or create an account to view this project.
          </p>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left mb-6">
            <p className="text-sm font-semibold text-gray-900">Invited email</p>
            <p className="mt-1 text-sm text-gray-600 break-words">{clientEmail}</p>
          </div>

          <div className="space-y-3">
            <Button href={authLoginHref} fullWidth>
              Log in
            </Button>
            <Button href={authSignupHref} variant="secondary" fullWidth>
              Create account
            </Button>
          </div>
        </div>
      </ClientAuthLayout>
    );
  }

  const s = statusCopy(project.status);

  return (
    <ClientLayout workspace={project.workspace}>
      {/* Top header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              {project.title}
            </h1>
            <p className="mt-1 text-gray-600">
              From <span className="font-medium text-gray-900">{project.workspace.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={project.status} size="lg" />
          </div>
        </div>

        {/* Status summary */}
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-200">
              {project.status === 'APPROVED' ? (
                <CheckCircle2 className="h-5 w-5 text-green-700" aria-hidden="true" />
              ) : project.status === 'CHANGES_REQUESTED' ? (
                <PencilLine className="h-5 w-5 text-amber-700" aria-hidden="true" />
              ) : (
                <MessageSquareText className="h-5 w-5 text-indigo-700" aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{s.title}</p>
              <p className="mt-1 text-sm text-gray-600">{s.body}</p>
            </div>

            {project.status === 'APPROVED' && !project.hasReview && (
              <Button href={`/p/${shareToken}/review`} variant="secondary" className="ml-auto">
                Leave a review
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        {/* LEFT: Deliverables + Comments */}
        <div className="lg:col-span-8 space-y-6">
          {/* Deliverables */}
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Deliverables</h2>
                  <p className="text-sm text-gray-600">{deliverablesCount} file(s)</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              {project.deliverables.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.deliverables.map((d) => (
                    <a
                      key={d.id}
                      href={d.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={[
                        'group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition',
                        'hover:-translate-y-0.5 hover:shadow-md',
                        'focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400',
                      ].join(' ')}
                    >
                      <div className="flex items-start gap-3">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-200">
                          <DeliverableIcon mimeType={d.mimeType} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {d.fileName}
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            {formatFileSize(d.fileSize)}
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="font-medium text-gray-900">v{d.versionNumber}</span>
                          </p>
                        </div>

                        <div className="shrink-0 text-gray-400 group-hover:text-gray-700 transition">
                          <ExternalLink className="h-5 w-5" aria-hidden="true" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                  <p className="font-semibold text-gray-900">No deliverables yet</p>
                  <p className="mt-1 text-sm text-gray-600">
                    The team hasn’t uploaded files to this project.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Comments */}
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-gray-200 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
                  <p className="text-sm text-gray-600">{commentsCount} message(s)</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              {project.comments.length > 0 ? (
                <div className="space-y-4">
                  {project.comments.map((c) => {
                    const isClient = c.authorType === 'CLIENT';
                    return (
                      <div key={c.id} className="flex gap-3">
                        <Avatar name={c.authorName} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {c.authorName}
                            </span>
                            <span
                              className={[
                                'text-xs px-2 py-0.5 rounded-full font-medium',
                                isClient
                                  ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                                  : 'bg-gray-50 text-gray-700 ring-1 ring-gray-200',
                              ].join(' ')}
                            >
                              {isClient ? 'You' : 'Team'}
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
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                  <p className="font-semibold text-gray-900">No comments yet</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Start the conversation by leaving feedback below.
                  </p>
                </div>
              )}

              {canInteract && (
                <form onSubmit={handleSubmitComment} className="mt-6">
                  <Textarea
                    label="Add a comment"
                    placeholder="Write feedback, questions, or notes…"
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
                      Send comment
                    </span>
                  </Button>
                </form>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT: Sticky decision panel */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-6">
            <Card className="bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Your decision</h2>
              <p className="text-sm text-gray-600 mb-5">
                Approve when everything looks good, or request changes with a note.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => setShowApproveModal(true)}
                  disabled={!canInteract || project.deliverables.length === 0}
                  fullWidth
                >
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    Approve project
                  </span>
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => setShowChangesModal(true)}
                  disabled={!canInteract || project.deliverables.length === 0}
                  fullWidth
                >
                  <span className="inline-flex items-center gap-2">
                    <PencilLine className="h-5 w-5" aria-hidden="true" />
                    Request changes
                  </span>
                </Button>
              </div>

              {project.deliverables.length === 0 && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-700 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">No files to review</p>
                      <p className="text-sm text-amber-800">
                        Actions will be available after deliverables are uploaded.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {project.status === 'APPROVED' && (
              <Card className="border-green-200 bg-green-50">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-green-200">
                    <CheckCircle2 className="h-5 w-5 text-green-700" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-green-900">Approved</p>
                    <p className="mt-1 text-sm text-green-800">
                      Thanks — the team has been notified.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Approve Modal (existing component) */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve project"
        message="This means you agree the project is complete and will be closed. This action cannot be undone."
        confirmText="Approve"
        variant="primary"
        isLoading={isSubmitting}
      />

      {/* Request Changes Modal (same backend; improved UI) */}
      {showChangesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 ring-1 ring-indigo-100">
                  <PencilLine className="h-5 w-5 text-indigo-700" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Request changes</h3>
                  <p className="text-sm text-gray-600">
                    Add a note so the team knows what to update.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <Textarea
                label="Changes note"
                value={changesNote}
                onChange={(e) => setChangesNote(e.target.value)}
                placeholder="Describe the changes you need…"
                className="mb-4"
              />

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowChangesModal(false)}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestChanges}
                  isLoading={isSubmitting}
                  fullWidth
                  disabled={!changesNote.trim()}
                >
                  <span className="inline-flex items-center gap-2">
                    <MessageSquareText className="h-5 w-5" aria-hidden="true" />
                    Submit request
                  </span>
                </Button>
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Your note will be sent to the team with this project.
              </p>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}

export default function ClientPortalPage() {
  return (
    <ToastProvider>
      <ClientPortalContent />
    </ToastProvider>
  );
}