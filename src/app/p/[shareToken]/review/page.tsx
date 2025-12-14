'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { StarRating } from '@/components/ui/StarRating';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast, ToastProvider } from '@/components/ui/Toast';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Star,
  Quote,
} from 'lucide-react';

function ReviewContent() {
  const params = useParams();
  const { success, error: showError } = useToast();
  const shareToken = params.shareToken as string;

  const [isLoading, setIsLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  const [projectTitle, setProjectTitle] = useState('');

  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchReviewStatus() {
      try {
        // backend unchanged
        const [projectRes, reviewRes] = await Promise.all([
          fetch(`/api/client/projects/${shareToken}`),
          fetch(`/api/client/projects/${shareToken}/review`),
        ]);

        const projectData = await projectRes.json();
        const reviewData = await reviewRes.json();

        if (projectData.success) {
          setWorkspace(projectData.data.project.workspace);
          setProjectTitle(projectData.data.project.title);
        }

        if (reviewData.success) {
          setCanReview(reviewData.data.canReview);
          setExistingReview(reviewData.data.review);
        }
      } catch {
        showError('Error', 'Failed to load review status');
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviewStatus();
  }, [shareToken]); // keep logic as-is

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (rating === 0) {
      showError('Error', 'Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      // backend unchanged
      const response = await fetch(`/api/client/projects/${shareToken}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, text: text || undefined }),
      });

      const data = await response.json();

      if (response.ok) {
        success('Thank You!', 'Your review has been submitted');
        setExistingReview(data.data.review);
        setCanReview(false);
      } else {
        showError('Error', data.error || 'Failed to submit review');
      }
    } catch {
      showError('Error', 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <PageLoader message="Loading..." />;
  }

  return (
    <ClientLayout workspace={workspace}>
      <div className="mx-auto w-full max-w-3xl">
        {/* Top header */}
        <div className="mb-6 sm:mb-8">
          <Button href={`/p/${shareToken}`} variant="secondary" className="mb-4">
            <span className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to project
            </span>
          </Button>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
                <Star className="h-6 w-6 text-indigo-700" aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                  Review
                </h1>
                <p className="mt-1 text-gray-600">
                  {projectTitle ? (
                    <>
                      Share your experience with <span className="font-medium text-gray-900">{projectTitle}</span>.
                    </>
                  ) : (
                    'Share your experience.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Already reviewed */}
        {existingReview && (
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 ring-1 ring-green-200">
                  <CheckCircle2 className="h-6 w-6 text-green-700" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Review submitted</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Thanks — your feedback has been saved.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <StarRating
                    value={existingReview.rating}
                    readonly
                    size="lg"
                    className="mb-0"
                  />
                  <Quote className="h-5 w-5 text-gray-300" aria-hidden="true" />
                </div>

                {existingReview.text && (
                  <p className="mt-4 text-gray-700 whitespace-pre-wrap">
                    “{existingReview.text}”
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button href={`/p/${shareToken}`} variant="secondary">
                  Back to project
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Cannot review */}
        {!existingReview && !canReview && (
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-200">
                  <AlertTriangle className="h-6 w-6 text-amber-800" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Review not available</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    You can only leave a review after approving the project.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-sm text-gray-700">
                  Go back to the project, review the deliverables, and approve when you’re ready.
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <Button href={`/p/${shareToken}`} variant="secondary">
                  Back to project
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Review form */}
        {!existingReview && canReview && (
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">Leave a review</h2>
              <p className="mt-1 text-sm text-gray-600">
                Choose a rating and optionally add a short note.
              </p>
            </div>

            <div className="px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Rating
                  </label>
                  <div className="flex justify-center sm:justify-start">
                    <StarRating value={rating} onChange={setRating} size="lg" showLabel />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <Textarea
                    label="Review note (optional)"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Share what went well, what could be improved, or any quick feedback…"
                    className="mb-0"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <Button href={`/p/${shareToken}`} variant="secondary" fullWidth>
                    Skip
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    fullWidth
                    disabled={rating === 0}
                  >
                    Submit review
                  </Button>
                </div>

                {rating === 0 && (
                  <p className="text-xs text-gray-500 text-center sm:text-left">
                    Select a rating to enable submit.
                  </p>
                )}
              </form>
            </div>
          </Card>
        )}
      </div>
    </ClientLayout>
  );
}

export default function ReviewPage() {
  return (
    <ToastProvider>
      <ReviewContent />
    </ToastProvider>
  );
}