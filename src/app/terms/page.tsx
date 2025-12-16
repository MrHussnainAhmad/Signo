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
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing or using {APP_NAME}, you agree to be bound by these Terms of Service. If
              you do not agree, do not use the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 mb-4">
              {APP_NAME} is a client approval portal that helps freelancers and agencies share
              deliverables, collect feedback, and record approvals/changes requests.
            </p>
            <p className="text-gray-600 mb-4">
              Deliverables are hosted in {APP_NAME} storage for sharing and approvals. You retain
              ownership of your content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activity under your account. Notify us immediately if you suspect
              unauthorized access.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Payments</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>All purchases are one-time payments (not subscriptions).</li>
              <li>Prices are displayed at checkout and may include applicable taxes.</li>
              <li>Solo to Studio upgrades are available where supported by your account.</li>
              <li>Payments are processed securely via Stripe.</li>
              <li><strong>No money-back guarantee is offered.</strong></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Retention</h2>
            <p className="text-gray-600 mb-4">
              Deliverables and related project data are automatically deleted after{' '}
              <strong>3 months</strong>. Some account and billing records may be retained as needed
              for operational, security, or legal purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Acceptable Use</h2>
            <p className="text-gray-600 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Use the service for illegal purposes</li>
              <li>Upload malicious files or content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with other users’ use of the service</li>
              <li>Resell or redistribute the service without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              You retain ownership of the content you upload. You grant us a limited license to host
              and display your content solely to provide the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              {APP_NAME} is provided “as is” without warranties of any kind. To the maximum extent
              permitted by law, we are not liable for indirect, incidental, or consequential damages
              arising from your use of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
            <p className="text-gray-600 mb-4">
              We may suspend or terminate access to the service if you violate these terms. You may
              stop using the service at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We may update these terms from time to time. Continued use after changes means you
              accept the updated terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact</h2>
            <p className="text-gray-600">
              Questions about these Terms? Contact{' '}
              <a href="mailto:legal@sendwork.com">legal@sendwork.com</a>.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}