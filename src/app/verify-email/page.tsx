'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

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
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(data.data.message);
        } else {
          const errorMessage = data.error || 'Verification failed';
          
          if (errorMessage.includes('Invalid') || errorMessage.includes('expired')) {
            setStatus('already_verified');
            setMessage('This verification link has already been used or has expired. If you already verified your email, you can log in now.');
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
      <AuthLayout title="Verifying your email..." subtitle="Please wait">
        <div className="flex flex-col items-center py-8">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying your email address...</p>
        </div>
      </AuthLayout>
    );
  }

  if (status === 'success') {
    return (
      <AuthLayout title="Email Verified!" subtitle="Your account is ready">
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
          <p className="text-gray-600 mb-6">{message}</p>
          <Button href="/login?verified=true" fullWidth>
            Continue to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (status === 'already_verified') {
    return (
      <AuthLayout title="Link Already Used" subtitle="This link has been used">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-3">
            <Button href="/login" fullWidth>
              Go to Login
            </Button>
            <Button href="/signup" variant="secondary" fullWidth>
              Create New Account
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Verification Failed" subtitle="Something went wrong">
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
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="space-y-3">
          <Button href="/signup" variant="secondary" fullWidth>
            Try Again
          </Button>
          <Button href="/login" fullWidth>
            Back to Login
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}