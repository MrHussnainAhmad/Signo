import { Metadata } from 'next';
import { APP_NAME } from '@/lib/config';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { PricingSection } from '@/components/home/PricingSection';
import { ReviewCarousel } from '@/components/home/ReviewCarousel';

export const metadata: Metadata = {
  title: `${APP_NAME} - Client Approval Links for Freelancers & Agencies`,
  description: `${APP_NAME} helps freelancers and agencies share deliverables, collect feedback, and get clear approval faster.`,
};

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
      <FeaturesSection />
      <ReviewCarousel />
      <PricingSection />

      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Stop chasing approvals
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-indigo-100">
            Send one link. Keep feedback organized. Get a clear decision.
          </p>
          <div className="mt-8">
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-indigo-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Get started
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}