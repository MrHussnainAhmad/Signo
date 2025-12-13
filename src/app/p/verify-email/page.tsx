'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ClientAuthLayout } from '@/components/layout/ClientLayout';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export default function ClientVerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
        const response = await fetch(`/api/client/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(data.data.message);
          if (data.data.redirectTo) {
            setRedirectTo(data.data.redirectTo);
          }
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification.');
      }
    }

    verifyEmail();
  }, [token]);

  if (status === 'loading') {
    return (
      <ClientAuthLayout>
        <div className="text-center py-8">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-gray-600">Verifying your email...</p>
        </div>
      </ClientAuthLayout>
    );
  }

  if (status === 'success') {
    return (
      <ClientAuthLayout>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Button href={redirectTo} fullWidth>
            Continue
          </Button>
        </div>
      </ClientAuthLayout>
    );
  }

  return (
    <ClientAuthLayout>
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <Button href="/p/login" fullWidth>
          Back to Login
        </Button>
      </div>
    </ClientAuthLayout>
  );
}