'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input, Textarea } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { PageLoader, Skeleton } from '@/components/ui/Spinner';
import { StarDisplay } from '@/components/ui/StarRating';

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
  }, [projectId]);

  async function fetchProject() {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();

      if (data.success) {
        setProject(data.data.project);
      } else {
        showError('Error', 'Project not found');
        router.push('/app/projects');
      }
    } catch (error) {
      showError('Error', 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpload(file: File) {
    const formData = new FormData();
    formData.append('file', file);

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
      const response = await fetch(
        `/api/projects/${projectId}/deliverables?deliverableId=${deliverableId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        success('File Deleted', 'The file has been removed');
        fetchProject();
      }
    } catch (error) {
      showError('Error', 'Failed to delete file');
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, {
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

  async function handleDeleteProject() {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        success('Project Deleted', 'The project has been deleted');
        router.push('/app/projects');
      }
    } catch (error) {
      showError('Error', 'Failed to delete project');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }

  function copyShareLink() {
    if (project) {
      navigator.clipboard.writeText(project.shareUrl);
      success('Link Copied', 'Share link copied to clipboard');
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
    return null;
  }

  return (
    <div>
      <PageHeader
        title={project.title}
        description={`${project.clientName} • ${project.clientEmail}`}
        action={
          <div className="flex items-center gap-3">
            <StatusBadge status={project.status} size="lg" />
            <Button variant="secondary" onClick={copyShareLink}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Deliverables */}
          <Card>
            <CardHeader
              action={
                project.status !== 'APPROVED' && (
                  <span className="text-sm text-gray-500">
                    {project.deliverables.length} files
                  </span>
                )
              }
            >
              <CardTitle>Deliverables</CardTitle>
            </CardHeader>

            {project.status !== 'APPROVED' && (
              <div className="mb-6">
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
                {project.deliverables.map((deliverable) => (
                  <div
                    key={deliverable.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{deliverable.fileName}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(deliverable.fileSize)} • v{deliverable.versionNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={deliverable.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg"
                        title="View"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>
                      {project.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleDeleteDeliverable(deliverable.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No deliverables uploaded yet.
              </p>
            )}
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>

            {project.comments.length > 0 ? (
              <div className="space-y-4 mb-6">
                {project.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <Avatar name={comment.authorName} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {comment.authorName}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          comment.authorType === 'CLIENT'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {comment.authorType === 'CLIENT' ? 'Client' : 'Team'}
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
            ) : (
              <p className="text-gray-500 text-center py-4 mb-6">
                No comments yet.
              </p>
            )}

            {project.status !== 'APPROVED' && (
              <form onSubmit={handleSubmitComment}>
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-3"
                />
                <Button type="submit" isLoading={isSubmittingComment} disabled={!newComment.trim()}>
                  Add Comment
                </Button>
              </form>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Project Details</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={project.status} />
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Client</dt>
                <dd className="text-gray-900 mt-1">{project.clientName}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900 mt-1">{project.clientEmail}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-900 mt-1">
                  {new Date(project.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Share Link</dt>
                <dd className="mt-1">
                  <button
                    onClick={copyShareLink}
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                  >
                    Copy Link
                  </button>
                </dd>
              </div>
            </dl>
          </Card>

          {/* Review */}
          {project.review && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Client Review</h3>
              <StarDisplay rating={project.review.rating} size="md" />
              {project.review.text && (
                <p className="mt-3 text-gray-600 text-sm">"{project.review.text}"</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                by {project.review.authorName}
              </p>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="border-red-200">
            <h3 className="font-semibold text-red-600 mb-4">Danger Zone</h3>
            <p className="text-sm text-gray-600 mb-4">
              Deleting this project will permanently remove all deliverables and comments.
            </p>
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
              fullWidth
            >
              Delete Project
            </Button>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}