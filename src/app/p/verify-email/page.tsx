'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClientAuthLayout } from '@/components/layout/ClientLayout';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { CheckCircle2, XCircle, Mail } from 'lucide-react';

function StatusCard({
  variant,
  title,
  message,
  action,
}: {
  variant: 'loading' | 'success' | 'error';
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  const styles =
    variant === 'success'
      ? {
          wrap: 'border-green-200 bg-green-50',
          iconWrap: 'bg-green-100 text-green-700 ring-green-200',
          Icon: CheckCircle2,
        }
      : variant === 'error'
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

  const Icon = styles.Icon;

  return (
    <div className="text-center">
      <div
        className={[
          'mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ring-1',
          styles.iconWrap,
        ].join(' ')}
      >
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-600">{message}</p>

      <div className={['mt-6 rounded-2xl border p-4', styles.wrap].join(' ')}>
        {variant === 'loading' ? (
          <div className="flex items-center justify-center gap-3">
            <Spinner size="sm" />
            <span className="text-sm font-medium text-gray-700">Verifying…</span>
          </div>
        ) : (
          <p className="text-sm text-gray-700">
            {variant === 'success'
              ? 'You can continue to the client portal.'
              : 'You can go back to login and try again.'}
          </p>
        )}
      </div>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function ClientVerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [redirectTo, setRedirectTo] = useState('/p/login');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }

    async function verifyEmail() {
      try {
        // backend logic unchanged (same endpoint + token query)
        const response = await fetch(`/api/client/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(data?.data?.message || 'Your email has been verified.');
          if (data?.data?.redirectTo) setRedirectTo(data.data.redirectTo);
        } else {
          setStatus('error');
          setMessage(data?.error || 'Verification failed');
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
      <ClientAuthLayout>
        <StatusCard
          variant="loading"
          title="Verify your email"
          message="We’re confirming your email verification."
        />
      </ClientAuthLayout>
    );
  }

  if (status === 'success') {
    return (
      <ClientAuthLayout>
        <StatusCard
          variant="success"
          title="Email verified"
          message={message}
          action={
            <Button href={redirectTo} fullWidth>
              Continue
            </Button>
          }
        />
      </ClientAuthLayout>
    );
  }

  return (
    <ClientAuthLayout>
      <StatusCard
        variant="error"
        title="Verification failed"
        message={message}
        action={
          <Button href="/p/login" fullWidth>
            Back to login
          </Button>
        }
      />
    </ClientAuthLayout>
  );
}

export default function ClientVerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Spinner size="lg" />
        </div>
      }
    >
      <ClientVerifyEmailContent />
    </Suspense>
  );
}