import { Metadata } from 'next';
import { APP_NAME } from '@/lib/config';
import { PublicLayout } from '@/components/layout/PublicLayout';

export const metadata: Metadata = {
  title: `Terms of Service | ${APP_NAME}`,
  description: `Terms of Service for ${APP_NAME} - Read our terms and conditions.`,
};

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing or using {APP_NAME}, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 mb-4">
              {APP_NAME} is a client approval portal that allows freelancers and agencies to share project 
              deliverables with clients and collect approvals. Our service includes project management, 
              file storage via Google Drive, and client communication features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for 
              all activities that occur under your account. You must notify us immediately of any unauthorized use.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Payment Terms</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>All purchases are one-time payments, not subscriptions.</li>
              <li>Prices are listed in USD and include applicable taxes as shown.</li>
              <li>Solo Plan: $19 + $3 tax = $22 total</li>
              <li>Studio Plan: $29 + $3 tax = $32 total</li>
              <li>Solo to Studio Upgrade: $15 (no additional tax)</li>
              <li>We offer a 14-day money-back guarantee.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use</h2>
            <p className="text-gray-600 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Use the service for any illegal purpose</li>
              <li>Upload malicious files or content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with other users' use of the service</li>
              <li>Resell or redistribute the service without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              You retain ownership of all content you upload to {APP_NAME}. By using our service, you grant 
              us a limited license to store and display your content as necessary to provide the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              {APP_NAME} is provided "as is" without warranties of any kind. We are not liable for any 
              indirect, incidental, or consequential damages arising from your use of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to terminate or suspend your account at any time for violation of these 
              terms. You may also delete your account at any time through your account settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We may update these terms from time to time. We will notify you of significant changes via 
              email or through the service. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact</h2>
            <p className="text-gray-600">
              If you have questions about these Terms of Service, please contact us at legal@signo.com.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}