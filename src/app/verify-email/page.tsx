'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { CheckCircle2, Info, XCircle, Mail } from 'lucide-react';

function Panel({
  tone,
  title,
  message,
  actions,
}: {
  tone: 'loading' | 'success' | 'info' | 'error';
  title: string;
  message: string;
  actions?: React.ReactNode;
}) {
  const toneStyles =
    tone === 'success'
      ? {
          wrap: 'border-green-200 bg-green-50',
          iconWrap: 'bg-green-100 text-green-700 ring-green-200',
          Icon: CheckCircle2,
        }
      : tone === 'info'
        ? {
            wrap: 'border-blue-200 bg-blue-50',
            iconWrap: 'bg-blue-100 text-blue-700 ring-blue-200',
            Icon: Info,
          }
        : tone === 'error'
          ? {
              wrap: 'border-red-200 bg-red-50',
              iconWrap: 'bg-red-100 text-red-700 ring-red-200',
              Icon: XCircle,
            }
          : {
              wrap: 'border-gray-200 bg-gray-50',
              iconWrap: 'bg-white text-gray-700 ring-gray-200',
              Icon: Mail,
            };

  const Icon = toneStyles.Icon;

  return (
    <div className="text-center">
      <div
        className={[
          'mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ring-1',
          toneStyles.iconWrap,
        ].join(' ')}
      >
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-gray-600">{message}</p>

      <div className={['mt-6 rounded-2xl border p-4', toneStyles.wrap].join(' ')}>
        {tone === 'loading' ? (
          <div className="flex items-center justify-center gap-3">
            <Spinner size="sm" />
            <span className="text-sm font-medium text-gray-700">Verifying…</span>
          </div>
        ) : (
          <p className="text-sm text-gray-700">
            {tone === 'success'
              ? 'Your email is verified and your account is ready.'
              : tone === 'info'
                ? 'If you already verified, you can log in now.'
                : 'You can try again or go back to login.'}
          </p>
        )}
      </div>

      {actions && <div className="mt-6 space-y-3">{actions}</div>}
    </div>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'already_verified' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }

    async function verifyEmail() {
      try {
        // backend logic unchanged (same endpoint + token query)
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(data.data.message);
        } else {
          const errorMessage = data.error || 'Verification failed';

          // keep your exact logic
          if (errorMessage.includes('Invalid') || errorMessage.includes('expired')) {
            setStatus('already_verified');
            setMessage(
              'This verification link has already been used or has expired. If you already verified your email, you can log in now.'
            );
          } else {
            setStatus('error');
            setMessage(errorMessage);
          }
        }
      } catch {
        setStatus('error');
        setMessage('An error occurred during verification.');
      }
    }

    verifyEmail();
  }, [token]);

  if (status === 'loading') {
    return (
      <AuthLayout title="Verify email" subtitle="Confirming your account">
        <Panel
          tone="loading"
          title="Verifying email"
          message="We’re confirming your email verification."
        />
      </AuthLayout>
    );
  }

  if (status === 'success') {
    return (
      <AuthLayout title="Email verified" subtitle="Your account is ready">
        <Panel
          tone="success"
          title="Email verified"
          message={message}
          actions={
            <Button href="/login?verified=true" fullWidth>
              Continue to login
            </Button>
          }
        />
      </AuthLayout>
    );
  }

  if (status === 'already_verified') {
    return (
      <AuthLayout title="Link already used" subtitle="You can log in">
        <Panel
          tone="info"
          title="Link already used"
          message={message}
          actions={
            <>
              <Button href="/login" fullWidth>
                Go to login
              </Button>
              <Button href="/signup" variant="secondary" fullWidth>
                Create new account
              </Button>
            </>
          }
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Verification failed" subtitle="Something went wrong">
      <Panel
        tone="error"
        title="Verification failed"
        message={message}
        actions={
          <>
            <Button href="/signup" variant="secondary" fullWidth>
              Try again
            </Button>
            <Button href="/login" fullWidth>
              Back to login
            </Button>
          </>
        }
      />
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Spinner size="lg" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}