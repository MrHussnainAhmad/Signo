'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Mail, AlertCircle, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // backend unchanged
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset email');
        return;
      }

      setSuccess(true);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Check your email" subtitle="We sent a reset link if the account exists">
        <div className="text-center">
          <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-200">
            <CheckCircle2 className="h-7 w-7 text-indigo-700" aria-hidden="true" />
          </div>

          <p className="text-gray-600">
            If an account exists for{' '}
            <span className="font-semibold text-gray-900 break-words">{email}</span>, you’ll receive
            a password reset link.
          </p>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left">
            <p className="text-sm font-semibold text-gray-900">Tip</p>
            <p className="mt-1 text-sm text-gray-600">
              Check spam/junk folders and search for “reset”.
            </p>
          </div>

          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-indigo-700 ring-1 ring-gray-200 hover:bg-gray-50 transition w-full"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email to get a reset link">
      {/* Error */}
      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-red-900">Couldn’t send reset email</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field (premium) */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-gray-900">
            Email address
          </label>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Mail className="h-5 w-5" aria-hidden="true" />
            </div>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={[
            'w-full rounded-2xl px-4 py-3 font-semibold text-white',
            'bg-indigo-600 hover:bg-indigo-700 transition',
            'focus:outline-none focus:ring-4 focus:ring-indigo-200',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'inline-flex items-center justify-center gap-2',
          ].join(' ')}
        >
          {isLoading ? <Spinner size="sm" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          Send reset link
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Remember your password?{' '}
        <Link href="/login" className="font-semibold text-indigo-700 hover:text-indigo-800">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}