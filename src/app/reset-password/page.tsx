'use client';

import React, { useEffect, useState, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  ShieldCheck,
  KeyRound,
  Link2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordsMismatch = useMemo(() => {
    if (!password || !confirmPassword) return false;
    return password !== confirmPassword;
  }, [password, confirmPassword]);

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setError('Reset token is missing.');
      return;
    }

    async function validateToken() {
      try {
        // backend logic unchanged
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
      // backend logic unchanged
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

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* LEFT: Premium info panel */}
        <aside className="hidden lg:block relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0">
            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/18 blur-3xl" />
            <div className="absolute -bottom-24 right-10 h-[520px] w-[520px] rounded-full bg-purple-500/12 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-black/25" />
          </div>

          <div className="relative h-full px-12 py-14 flex">
            <div className="my-auto w-full max-w-xl">
              <div className="inline-flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-indigo-200" aria-hidden="true" />
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-semibold tracking-wide text-white/60">
                    Account security
                  </p>
                  <p className="text-lg font-bold text-white">Reset your password</p>
                </div>
              </div>

              <h2 className="mt-10 text-4xl font-bold tracking-tight text-white">
                Secure access,
                <span className="block text-indigo-200">restored.</span>
              </h2>
              <p className="mt-4 text-lg text-white/70">
                Use the reset link from your email to set a new password and regain access.
              </p>

              <div className="mt-10 rounded-3xl border border-white/10 bg-white/5">
                <div className="px-6 py-5 border-b border-white/10">
                  <p className="text-sm font-semibold text-white/90">Tips</p>
                  <p className="mt-1 text-sm text-white/60">Keep your account protected.</p>
                </div>

                <ul className="divide-y divide-white/10">
                  {[
                    { icon: Link2, title: 'Use the latest link', desc: 'Older reset links may expire.' },
                    { icon: KeyRound, title: 'Choose a strong password', desc: 'Mix uppercase, lowercase, and numbers.' },
                    { icon: AlertTriangle, title: 'Didn’t request this?', desc: 'You can safely ignore the email.' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.title} className="px-6 py-5">
                        <div className="flex items-start gap-4">
                          <div className="mt-0.5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                            <Icon className="h-5 w-5 text-indigo-200" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white/90">{item.title}</p>
                            <p className="mt-1 text-sm text-white/60">{item.desc}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <p className="mt-10 text-xs text-white/45">
                This page only updates your password after your reset token is validated.
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT: Main panel */}
        <main className="flex items-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            {/* Back link */}
            <div className="mb-8">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to login
              </Link>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
              <div className="p-6 sm:p-8">
                {/* VALIDATING */}
                {isValidating && (
                  <div className="text-center">
                    <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 ring-1 ring-gray-200">
                      <Spinner size="md" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Validating link</h1>
                    <p className="mt-2 text-sm text-gray-600">
                      We’re confirming your reset request.
                    </p>
                  </div>
                )}

                {/* SUCCESS */}
                {!isValidating && success && (
                  <div className="text-center">
                    <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 ring-1 ring-green-200">
                      <CheckCircle2 className="h-7 w-7 text-green-700" aria-hidden="true" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900">Password updated</h1>
                    <p className="mt-2 text-sm text-gray-600">
                      Your password has been reset successfully. You can log in with your new password.
                    </p>

                    <div className="mt-6">
                      <Button href="/login" fullWidth>
                        Continue to login
                      </Button>
                    </div>
                  </div>
                )}

                {/* INVALID LINK */}
                {!isValidating && !success && !isValid && (
                  <div className="text-center">
                    <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-200">
                      <XCircle className="h-7 w-7 text-red-700" aria-hidden="true" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900">Invalid link</h1>
                    <p className="mt-2 text-sm text-gray-600">{error}</p>

                    <div className="mt-6 space-y-3">
                      <Button href="/forgot-password" variant="secondary" fullWidth>
                        Request new link
                      </Button>
                      <Button href="/login" fullWidth>
                        Back to login
                      </Button>
                    </div>
                  </div>
                )}

                {/* RESET FORM */}
                {!isValidating && !success && isValid && (
                  <>
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
                      <p className="mt-2 text-sm text-gray-600">
                        Enter a new password for{' '}
                        <span className="font-semibold text-gray-900">{maskedEmail}</span>.
                      </p>
                    </div>

                    {error && (
                      <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-700" aria-hidden="true" />
                          <div>
                            <p className="text-sm font-semibold text-red-900">Reset failed</p>
                            <p className="text-sm text-red-800">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* New password */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900" htmlFor="password">
                          New password
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setError('');
                            }}
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                            className="w-full rounded-2xl border border-gray-200 bg-white py-3 px-3 pr-12 text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute inset-y-0 right-0 flex items-center pr-2"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition">
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" aria-hidden="true" />
                              ) : (
                                <Eye className="h-5 w-5" aria-hidden="true" />
                              )}
                            </span>
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">
                          At least 8 characters with uppercase, lowercase, and number.
                        </p>
                      </div>

                      {/* Confirm password */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900" htmlFor="confirmPassword">
                          Confirm password
                        </label>
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              setError('');
                            }}
                            placeholder="••••••••"
                            required
                            autoComplete="new-password"
                            className={[
                              'w-full rounded-2xl border bg-white py-3 px-3 pr-12 text-gray-900 shadow-sm outline-none transition',
                              'focus:ring-4',
                              passwordsMismatch
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100',
                            ].join(' ')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute inset-y-0 right-0 flex items-center pr-2"
                            aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                          >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition">
                              {showConfirm ? (
                                <EyeOff className="h-5 w-5" aria-hidden="true" />
                              ) : (
                                <Eye className="h-5 w-5" aria-hidden="true" />
                              )}
                            </span>
                          </button>
                        </div>
                        {passwordsMismatch && (
                          <p className="text-sm text-red-700">Passwords do not match.</p>
                        )}
                      </div>

                      <Button type="submit" fullWidth isLoading={isLoading} disabled={passwordsMismatch}>
                        Reset password
                      </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                      Remember your password?{' '}
                      <Link href="/login" className="font-semibold text-indigo-700 hover:text-indigo-800">
                        Log in
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Secure password reset
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Spinner size="lg" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}