import { Metadata } from 'next';
import { APP_NAME } from '@/lib/config';
import { PublicLayout } from '@/components/layout/PublicLayout';

export const metadata: Metadata = {
  title: `Privacy Policy | ${APP_NAME}`,
  description: `Privacy Policy for ${APP_NAME} - Learn how we collect, use, and protect your data.`,
};

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              Welcome to {APP_NAME}. We respect your privacy and are committed to protecting your
              personal data. This Privacy Policy explains what we collect, how we use it, and the
              choices you have when you use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-600 mb-4">We collect the following categories of information:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>
                <strong>Account information:</strong> Name, email address, and password when you
                create an account.
              </li>
              <li>
                <strong>Workspace and project data:</strong> Project titles, client names, client
                emails, approvals/decisions, and comments.
              </li>
              <li>
                <strong>Deliverables:</strong> Files you upload to share with clients for review and
                approval.
              </li>
              <li>
                <strong>Payment information:</strong> Payments are processed by Stripe. We do not
                store full credit card details.
              </li>
              <li>
                <strong>Usage and technical data:</strong> Basic log/diagnostic data (for example,
                browser/device information and event logs) to help operate and secure the service.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide and maintain the service</li>
              <li>Enable client review, comments, and approvals</li>
              <li>Send emails you request or that are necessary for the workflow (for example, invitations and notifications)</li>
              <li>Process payments and provide receipts</li>
              <li>Detect, prevent, and address abuse, fraud, and security issues</li>
              <li>Improve performance and reliability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Storage and Retention</h2>
            <p className="text-gray-600 mb-4">
              <strong>Where data is stored:</strong> Account and project data are stored in our
              systems. Deliverables are stored in {APP_NAME} storage for sharing and approvals.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Retention:</strong> Deliverables and related project data are automatically
              deleted after <strong>3 months</strong>. Some account and billing records may be
              retained as needed for security, operational, or legal purposes.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Ownership:</strong> You retain ownership of your content. We store and display
              it only to provide the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Services</h2>
            <p className="text-gray-600 mb-4">
              We use third-party services to operate {APP_NAME}. Examples may include:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>Email delivery providers:</strong> Sending invitations and notifications</li>
              <li><strong>Infrastructure/storage providers:</strong> Hosting the application and storing files</li>
              <li><strong>Image hosting (if applicable):</strong> Storing avatar/workspace logos</li>
            </ul>
            <p className="text-gray-600 mt-4">
              These providers process data on our behalf to deliver the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Selling and Advertising</h2>
            <p className="text-gray-600 mb-4">
              We <strong>do not sell</strong> your personal data. We also do not use your project
              deliverables or client feedback content for advertising.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-600 mb-4">Depending on your location, you may have rights to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Access and correct your personal information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to or restrict certain processing in some cases</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Note: {APP_NAME} does <strong>not</strong> provide a self-serve data export feature for
              users or clients.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, contact us at{' '}
              <a href="mailto:privacy@signo.com">privacy@signo.com</a>.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}