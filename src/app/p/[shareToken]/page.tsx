'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ClientLayout, ClientAuthLayout } from '@/components/layout/ClientLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Textarea } from '@/components/ui/Input';
import { ConfirmModal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { ToastProvider } from '@/components/ui/Toast';

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

  useEffect(() => {
    fetchProject();
  }, [shareToken]);

  async function fetchProject() {
    try {
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
    } catch (error) {
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
      const response = await fetch(`/api/client/projects/${shareToken}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        fetchProject();
      }
    } catch (error) {
      showError('Error', 'Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  }

  async function handleApprove() {
    setIsSubmitting(true);
    try {
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
    } catch (error) {
      showError('Error', 'Failed to approve project');
    } finally {
      setIsSubmitting(false);
      setShowApproveModal(false);
    }
  }

  async function handleRequestChanges() {
    setIsSubmitting(true);
    try {
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
    } catch (error) {
      showError('Error', 'Failed to request changes');
    } finally {
      setIsSubmitting(false);
      setShowChangesModal(false);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  if (isLoading) {
    return <PageLoader message="Loading project..." />;
  }

  if (!project) {
    return (
      <ClientAuthLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600">This project may have been deleted or the link is invalid.</p>
        </div>
      </ClientAuthLayout>
    );
  }

  // Require authentication for full access
  if (!isAuthenticated) {
    return (
      <ClientAuthLayout workspace={project.workspace}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h1>
          <p className="text-gray-600 mb-6">
            Please log in or create an account to view this project.
          </p>
          <div className="space-y-3">
            <Button href={`/p/login?redirect=/p/${shareToken}&email=${clientEmail}`} fullWidth>
              Log In
            </Button>
            <Button href={`/p/signup?redirect=/p/${shareToken}&email=${clientEmail}`} variant="secondary" fullWidth>
              Create Account
            </Button>
          </div>
        </div>
      </ClientAuthLayout>
    );
  }

  return (
    <ClientLayout workspace={project.workspace}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <p className="mt-1 text-gray-600">From {project.workspace.name}</p>
          </div>
          <StatusBadge status={project.status} size="lg" />
        </div>
      </div>

      {/* Approved Message */}
      {project.status === 'APPROVED' && (
        <Card className="mb-8 bg-green-50 border-green-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Project Approved</h3>
              <p className="text-green-700">Thank you for approving this project!</p>
            </div>
            {!project.hasReview && (
              <Button href={`/p/${shareToken}/review`} variant="secondary" className="ml-auto">
                Leave a Review
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Deliverables */}
      <Card className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Deliverables</h2>
        {project.deliverables.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.deliverables.map((deliverable) => (
              <a
                key={deliverable.id}
                href={deliverable.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                  {deliverable.mimeType.startsWith('image/') ? (
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{deliverable.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(deliverable.fileSize)} • v{deliverable.versionNumber}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No deliverables uploaded yet.</p>
        )}
      </Card>

      {/* Comments */}
      <Card className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>
        
        {project.comments.length > 0 && (
          <div className="space-y-4 mb-6">
            {project.comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <Avatar name={comment.authorName} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{comment.authorName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      comment.authorType === 'CLIENT' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {comment.authorType === 'CLIENT' ? 'You' : 'Team'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-600">{comment.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {canInteract && (
          <form onSubmit={handleSubmitComment}>
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-3"
            />
            <Button type="submit" isLoading={isSubmittingComment} disabled={!newComment.trim()}>
              Send Comment
            </Button>
          </form>
        )}
      </Card>

      {/* Actions */}
      {canInteract && project.deliverables.length > 0 && (
        <Card className="bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Decision</h2>
          <p className="text-gray-600 mb-6">
            Review the deliverables above and either approve the project or request changes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => setShowApproveModal(true)} className="flex-1">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approve Project
            </Button>
            <Button variant="secondary" onClick={() => setShowChangesModal(true)} className="flex-1">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Request Changes
            </Button>
          </div>
        </Card>
      )}

      {/* Approve Modal */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve Project"
        message="This means you agree the project is complete and will be closed. This action cannot be undone."
        confirmText="Approve"
        variant="primary"
        isLoading={isSubmitting}
      />

      {/* Request Changes Modal */}
      {showChangesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Changes</h3>
            <Textarea
              label="What changes would you like?"
              value={changesNote}
              onChange={(e) => setChangesNote(e.target.value)}
              placeholder="Describe the changes you need..."
              className="mb-6"
            />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowChangesModal(false)} fullWidth>
                Cancel
              </Button>
              <Button onClick={handleRequestChanges} isLoading={isSubmitting} fullWidth>
                Submit Request
              </Button>
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