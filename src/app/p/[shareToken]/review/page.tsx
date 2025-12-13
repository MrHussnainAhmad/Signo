'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ClientLayout, ClientAuthLayout } from '@/components/layout/ClientLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { StarRating } from '@/components/ui/StarRating';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast, ToastProvider } from '@/components/ui/Toast';

function ReviewContent() {
  const params = useParams();
  const router = useRouter();
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
      } catch (error) {
        showError('Error', 'Failed to load review status');
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviewStatus();
  }, [shareToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (rating === 0) {
      showError('Error', 'Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
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
    } catch (error) {
      showError('Error', 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <PageLoader message="Loading..." />;
  }

  // Already reviewed
  if (existingReview) {
    return (
      <ClientLayout workspace={workspace}>
        <div className="max-w-lg mx-auto">
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
            <p className="text-gray-600 mb-6">Your review has been submitted.</p>
            
            <div className="bg-gray-50 rounded-lg p-6 text-left mb-6">
              <StarRating value={existingReview.rating} readonly size="lg" className="mb-3" />
              {existingReview.text && (
                <p className="text-gray-600">"{existingReview.text}"</p>
              )}
            </div>

            <Button href={`/p/${shareToken}`} variant="secondary">
              Back to Project
            </Button>
          </Card>
        </div>
      </ClientLayout>
    );
  }

  // Cannot review (project not approved)
  if (!canReview) {
    return (
      <ClientLayout workspace={workspace}>
        <div className="max-w-lg mx-auto">
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Not Available</h1>
            <p className="text-gray-600 mb-6">
              You can only leave a review after approving the project.
            </p>
            <Button href={`/p/${shareToken}`} variant="secondary">
              Back to Project
            </Button>
          </Card>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout workspace={workspace}>
      <div className="max-w-lg mx-auto">
        <Card>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Leave a Review</h1>
            <p className="text-gray-600">
              How was your experience with {projectTitle}?
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Your Rating
              </label>
              <div className="flex justify-center">
                <StarRating value={rating} onChange={setRating} size="lg" showLabel />
              </div>
            </div>

            <Textarea
              label="Your Review (Optional)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your experience..."
              className="mb-6"
            />

            <div className="flex gap-3">
              <Button href={`/p/${shareToken}`} variant="secondary" fullWidth>
                Skip
              </Button>
              <Button type="submit" isLoading={isSubmitting} fullWidth disabled={rating === 0}>
                Submit Review
              </Button>
            </div>
          </form>
        </Card>
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