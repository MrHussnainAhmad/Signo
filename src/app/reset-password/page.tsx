'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setError('Reset token is missing.');
      return;
    }

    async function validateToken() {
      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setIsValid(true);
          setMaskedEmail(data.data.email);
        } else {
          setError(data.error || 'Invalid or expired reset link');
        }
      } catch {
        setError('Failed to validate reset link');
      } finally {
        setIsValidating(false);
      }
    }

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }

      setSuccess(true);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <AuthLayout title="Validating..." subtitle="Please wait">
        <div className="flex flex-col items-center py-8">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Validating your reset link...</p>
        </div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout title="Password Reset!" subtitle="Your password has been updated">
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
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <Button href="/login" fullWidth>
            Continue to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (!isValid) {
    return (
      <AuthLayout title="Invalid Link" subtitle="This reset link is not valid">
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
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button href="/forgot-password" variant="secondary" fullWidth>
              Request New Link
            </Button>
            <Button href="/login" fullWidth>
              Back to Login
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={`Enter a new password for ${maskedEmail}`}
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="New password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          placeholder="••••••••"
          hint="At least 8 characters with uppercase, lowercase, and number"
          required
          autoComplete="new-password"
        />

        <Input
          label="Confirm password"
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError('');
          }}
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />

        <Button type="submit" fullWidth isLoading={isLoading}>
          Reset password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Remember your password?{' '}
        <Link
          href="/login"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}