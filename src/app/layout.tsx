import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { APP_NAME } from '@/lib/config';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#6366f1',
};

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - Client Approval Portal`,
    template: `%s | ${APP_NAME}`,
  },
  description: `${APP_NAME} is a client approval portal for freelancers and agencies. Create projects, upload deliverables, and get client sign-off efficiently.`,
  keywords: [
    'client approval',
    'project management',
    'freelancer tools',
    'agency tools',
    'deliverables',
    'client feedback',
    'approval workflow',
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: APP_NAME,
    title: `${APP_NAME} - Client Approval Portal`,
    description: 'Streamline client approvals for your projects. Upload deliverables, get feedback, and close projects faster.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} - Client Approval Portal`,
    description: 'Streamline client approvals for your projects.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}