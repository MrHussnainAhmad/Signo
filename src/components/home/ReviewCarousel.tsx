'use client';

import React, { useEffect, useState } from 'react';
import { StarDisplay } from '@/components/ui/StarRating';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Spinner';

interface Review {
  id: string;
  rating: number;
  text: string | null;
  authorName: string;
  projectTitle: string;
  workspaceName: string;
  createdAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export function ReviewCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch('/api/reviews?limit=20');
        const data = await response.json();

        if (data.success) {
          setReviews(data.data.reviews);
          setStats(data.data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviews();
  }, []);

  if (isLoading) {
    return (
      <section id="reviews" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton width={200} height={32} className="mx-auto mb-4" />
            <Skeleton width={300} height={20} className="mx-auto" />
          </div>
          <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-80 flex-shrink-0">
                <Skeleton height={180} className="rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  // Duplicate reviews for seamless infinite scroll
  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <section id="reviews" className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Loved by Freelancers & Agencies
          </h2>
          {stats && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <StarDisplay rating={Math.round(stats.averageRating)} size="md" />
              <span className="text-gray-600">
                {stats.averageRating.toFixed(1)} average from {stats.totalReviews} reviews
              </span>
            </div>
          )}
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

          {/* Scrolling track */}
          <div className="carousel-track">
            {duplicatedReviews.map((review, index) => (
              <ReviewCard key={`${review.id}-${index}`} review={review} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface ReviewCardProps {
  review: Review;
}

function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="w-80 flex-shrink-0 mx-3">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
        {/* Rating */}
        <StarDisplay rating={review.rating} size="sm" />

        {/* Text */}
        {review.text && (
          <p className="mt-4 text-gray-600 line-clamp-3">
            "{review.text}"
          </p>
        )}

        {/* Author */}
        <div className="mt-4 flex items-center gap-3">
          <Avatar name={review.authorName} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {review.authorName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {review.projectTitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Static reviews for when API is empty (optional fallback)
export function StaticReviewCarousel() {
  const staticReviews = [
    {
      id: '1',
      rating: 5,
      text: 'Signo has completely transformed how we handle client approvals. No more endless email chains!',
      authorName: 'Sarah Johnson',
      projectTitle: 'Brand Identity',
      workspaceName: 'Design Co',
    },
    {
      id: '2',
      rating: 5,
      text: 'The client portal is so intuitive. Our clients love how easy it is to review and approve deliverables.',
      authorName: 'Michael Chen',
      projectTitle: 'Website Redesign',
      workspaceName: 'WebFlow Agency',
    },
    {
      id: '3',
      rating: 5,
      text: 'Finally, a tool that makes the approval process painless. Worth every penny!',
      authorName: 'Emily Rodriguez',
      projectTitle: 'Marketing Campaign',
      workspaceName: 'Creative Studio',
    },
    {
      id: '4',
      rating: 4,
      text: 'Great for keeping everything organized. Our team productivity has increased significantly.',
      authorName: 'David Kim',
      projectTitle: 'App Design',
      workspaceName: 'Mobile First',
    },
    {
      id: '5',
      rating: 5,
      text: 'The Google Drive integration is seamless. No more file management headaches.',
      authorName: 'Lisa Thompson',
      projectTitle: 'Video Production',
      workspaceName: 'Motion Graphics',
    },
  ];

  const duplicatedReviews = [...staticReviews, ...staticReviews];

  return (
    <section id="reviews" className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Loved by Freelancers & Agencies
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <StarDisplay rating={5} size="md" />
            <span className="text-gray-600">4.9 average rating</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

          <div className="carousel-track">
            {duplicatedReviews.map((review, index) => (
              <div key={`${review.id}-${index}`} className="w-80 flex-shrink-0 mx-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
                  <StarDisplay rating={review.rating} size="sm" />
                  <p className="mt-4 text-gray-600 line-clamp-3">
                    "{review.text}"
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <Avatar name={review.authorName} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {review.authorName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {review.projectTitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}