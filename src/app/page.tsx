import { Metadata } from 'next';
import { APP_NAME } from '@/lib/config';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { PricingSection } from '@/components/home/PricingSection';
import { ReviewCarousel } from '@/components/home/ReviewCarousel';

export const metadata: Metadata = {
  title: `${APP_NAME} - Client Approval Portal for Freelancers & Agencies`,
  description: `${APP_NAME} is the client approval portal that helps freelancers and agencies streamline their project approvals. Upload deliverables, collect feedback, and get sign-off faster.`,
};

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
      <FeaturesSection />
      <ReviewCarousel />
      <PricingSection />
      
      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to streamline your client approvals?
          </h2>
          <p className="mt-4 text-xl text-indigo-100">
            Join hundreds of freelancers and agencies already using {APP_NAME}.
          </p>
          <div className="mt-8">
            <a
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-indigo-600 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started Today
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}