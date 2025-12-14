'use client';

import React, { useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { APP_NAME } from '@/lib/config';
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Link2,
  Lock,
  Mail,
  MessageSquareText,
  Send,
  UserRound,
} from 'lucide-react';

function SignupInner() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [resendState, setResendState] = useState<'idle' | 'loading' | 'sent'>('idle');
  const canResend = useMemo(() => formData.email.trim().length > 3, [formData.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '', general: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // backend unchanged
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(data.errors).forEach(([key, value]) => {
            fieldErrors[key] = (value as string[])[0];
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: data.error || 'Signup failed' });
        }
        return;
      }

      setSuccess(true);
    } catch {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!canResend || resendState === 'loading') return;

    try {
      setResendState('loading');
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }), // backend unchanged
      });
      setResendState('sent');
      // stays "sent" (no timers / no promises about time)
    } catch {
      setResendState('idle');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* LEFT: Form panel (light) */}
        <main className="px-4 py-10 sm:px-8 lg:px-12 lg:py-14 flex items-center">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-sm">
                  <BadgeCheck className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <span className="text-lg font-bold text-gray-900">{APP_NAME}</span>
              </Link>

              <Link
                href="/login"
                className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
              >
                Log in
              </Link>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="p-6 sm:p-8">
                {!success ? (
                  <>
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
                      <p className="mt-1 text-sm text-gray-600">
                        Start managing client approvals today.
                      </p>
                    </div>

                    {errors.general && (
                      <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-red-700 mt-0.5" aria-hidden="true" />
                          <div>
                            <p className="text-sm font-semibold text-red-900">Signup failed</p>
                            <p className="text-sm text-red-800">{errors.general}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900" htmlFor="name">
                          Full name
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <UserRound className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            autoComplete="name"
                            required
                            className={[
                              'w-full rounded-2xl border bg-white py-3 pl-10 pr-3 text-gray-900 shadow-sm outline-none transition',
                              'focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100',
                              errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200',
                            ].join(' ')}
                          />
                        </div>
                        {errors.name && <p className="text-sm text-red-700">{errors.name}</p>}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900" htmlFor="email">
                          Email
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <Mail className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                            className={[
                              'w-full rounded-2xl border bg-white py-3 pl-10 pr-3 text-gray-900 shadow-sm outline-none transition',
                              'focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100',
                              errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200',
                            ].join(' ')}
                          />
                        </div>
                        {errors.email && <p className="text-sm text-red-700">{errors.email}</p>}
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900" htmlFor="password">
                          Password
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <Lock className="h-5 w-5" aria-hidden="true" />
                          </div>

                          <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                            className={[
                              'w-full rounded-2xl border bg-white py-3 pl-10 pr-12 text-gray-900 shadow-sm outline-none transition',
                              'focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100',
                              errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200',
                            ].join(' ')}
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
                        {errors.password && <p className="text-sm text-red-700">{errors.password}</p>}
                      </div>

                      {/* Terms */}
                      <div className="flex items-start gap-3 pt-1">
                        <input
                          type="checkbox"
                          id="terms"
                          required
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600">
                          I agree to the{' '}
                          <Link href="/terms" className="font-semibold text-indigo-700 hover:text-indigo-800">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy" className="font-semibold text-indigo-700 hover:text-indigo-800">
                            Privacy Policy
                          </Link>
                          .
                        </label>
                      </div>

                      <Button type="submit" fullWidth isLoading={isLoading}>
                        Create account
                      </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link href="/login" className="font-semibold text-indigo-700 hover:text-indigo-800">
                        Log in
                      </Link>
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 ring-1 ring-green-200">
                        <CheckCircle2 className="h-7 w-7 text-green-700" aria-hidden="true" />
                      </div>

                      <h1 className="mt-4 text-2xl font-bold text-gray-900">Check your email</h1>
                      <p className="mt-2 text-sm text-gray-600">
                        We sent a verification link to:
                      </p>

                      <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900 break-words">
                          {formData.email}
                        </p>
                      </div>

                      <p className="mt-4 text-sm text-gray-600">
                        Click the link in the email to verify your account.
                      </p>

                      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={resendVerification}
                          disabled={!canResend || resendState === 'loading'}
                        >
                          <span className="inline-flex items-center gap-2">
                            <Send className="h-4 w-4" aria-hidden="true" />
                            {resendState === 'sent'
                              ? 'Verification sent'
                              : resendState === 'loading'
                                ? 'Sending...'
                                : 'Resend email'}
                          </span>
                        </Button>

                        <Button type="button" onClick={() => (window.location.href = '/login')}>
                          Go to login
                        </Button>
                      </div>

                      <p className="mt-6 text-xs text-gray-500">
                        If you don’t see it, check spam/junk folders.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              © {new Date().getFullYear()} {APP_NAME}
            </p>
          </div>
        </main>

        {/* RIGHT: Value panel (dark/purple) — opposite side from login */}
        <aside className="relative overflow-hidden px-6 py-10 sm:px-10 lg:px-14 lg:py-14 bg-slate-950">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-indigo-500/18 blur-3xl" />
            <div className="absolute -bottom-28 -left-24 h-96 w-96 rounded-full bg-purple-500/14 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-black/25" />
          </div>

          <div className="relative mx-auto flex h-full max-w-xl flex-col">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white/80">Why {APP_NAME}</p>
              <Link
                href="/#pricing"
                className="text-sm font-semibold text-white/70 hover:text-white transition"
              >
                Pricing
              </Link>
            </div>

            <h2 className="mt-10 text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Less back-and-forth.
              <span className="block text-indigo-200">More finished projects.</span>
            </h2>

            <p className="mt-4 text-base sm:text-lg text-white/70">
              Designed for approvals: deliverables, feedback, and a clear decision—without client confusion.
            </p>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/5">
              <div className="px-5 py-4 border-b border-white/10">
                <p className="text-sm font-semibold text-white/90">Core workflow</p>
                <p className="mt-1 text-sm text-white/60">Simple and predictable.</p>
              </div>

              <ul className="divide-y divide-white/10">
                {[
                  { icon: Link2, title: 'Share one link', desc: 'Clients open the page and review.' },
                  { icon: MessageSquareText, title: 'Collect feedback', desc: 'Comments stay organized per project.' },
                  { icon: BadgeCheck, title: 'Get sign-off', desc: 'Approve or request changes clearly.' },
                  { icon: Clock, title: 'Auto-delete', desc: 'Files and related data are deleted after 3 months.' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title} className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
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

            <div className="mt-auto pt-10">
              <p className="text-xs text-white/45">
                You keep ownership of your content. We host files for approvals and delete them automatically after 3 months.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Spinner size="lg" />
        </div>
      }
    >
      <SignupInner />
    </Suspense>
  );
}