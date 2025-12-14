'use client';

import React, { useEffect, useState } from 'react';
import { StarDisplay } from '@/components/ui/StarRating';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Spinner';
import { Quote } from 'lucide-react';

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
      <section id="reviews" className="bg-[#0B1020] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton width={220} height={34} className="mx-auto mb-4" />
            <Skeleton width={320} height={20} className="mx-auto" />
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-80 flex-shrink-0">
                <Skeleton height={210} className="rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // No fake reviews. If API returns none, render nothing.
  if (reviews.length === 0) return null;

  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <section id="reviews" className="bg-[#0B1020] py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Real feedback from customers
          </h2>

          {stats && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
              <StarDisplay rating={Math.round(stats.averageRating)} size="md" />
              <span className="text-white/70">
                {stats.averageRating.toFixed(1)} average from {stats.totalReviews} reviews
              </span>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0B1020] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0B1020] to-transparent z-10" />

          <div className="carousel-track">
            {duplicatedReviews.map((review, index) => (
              <div key={`${review.id}-${index}`} className="w-80 flex-shrink-0 mx-3">
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <StarDisplay rating={review.rating} size="sm" />
                    <Quote className="h-5 w-5 text-white/25" aria-hidden="true" />
                  </div>

                  {review.text && (
                    <p className="mt-4 text-white/80 leading-relaxed line-clamp-4">
                      “{review.text}”
                    </p>
                  )}

                  <div className="mt-5 flex items-center gap-3">
                    <Avatar name={review.authorName} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {review.authorName}
                      </p>
                      <p className="text-xs text-white/60 truncate">
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