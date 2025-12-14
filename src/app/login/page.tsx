'use client';

import React, { useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { APP_NAME } from '@/lib/config';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  AlertCircle,
  CheckCircle2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  BadgeCheck,
  Link2,
  MessageSquareText,
  Clock,
  ShieldCheck,
} from 'lucide-react';

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = useMemo(() => searchParams.get('redirect') || '/app', [searchParams]);
  const verified = searchParams.get('verified');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), // backend unchanged
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      router.push(redirect);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* LEFT: Brand/value panel */}
        <aside className="relative overflow-hidden px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          {/* Subtle background (less purple, more controlled) */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />
            <div className="absolute -bottom-28 right-10 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-black/25" />
          </div>

          <div className="relative mx-auto flex h-full max-w-xl flex-col">
            {/* Top brand row */}
            <div className="flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                  <BadgeCheck className="h-6 w-6 text-indigo-200" aria-hidden="true" />
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-semibold tracking-wide text-white/60">
                    Welcome to
                  </p>
                  <p className="text-lg font-bold text-white">{APP_NAME}</p>
                </div>
              </Link>

              <Link
                href="/signup"
                className="text-sm font-semibold text-white/70 hover:text-white transition"
              >
                Create account
              </Link>
            </div>

            {/* Headline */}
            <div className="mt-12">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Log in to manage approvals
              </h1>
              <p className="mt-4 text-base sm:text-lg text-white/70">
                Keep deliverables, feedback, and sign-off in one clean flow.
              </p>
            </div>

            {/* Structured list (no “floating cards”) */}
            <div className="mt-10 rounded-3xl border border-white/10 bg-white/5">
              <div className="px-5 py-4 border-b border-white/10">
                <p className="text-sm font-semibold text-white/90">What you get</p>
                <p className="mt-1 text-sm text-white/60">
                  Simple for clients. Clear for you.
                </p>
              </div>

              <ul className="divide-y divide-white/10">
                {[
                  {
                    icon: Link2,
                    title: 'One approval link',
                    desc: 'Send a single link to review deliverables.',
                  },
                  {
                    icon: MessageSquareText,
                    title: 'Feedback in one place',
                    desc: 'No scattered email or chat threads.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Ownership stays yours',
                    desc: 'You own your work and files.',
                  },
                  {
                    icon: Clock,
                    title: 'Auto-delete after 3 months',
                    desc: 'Files and related data are removed automatically.',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title} className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                          <Icon className="h-5 w-5 text-indigo-200" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white/90">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm text-white/60">{item.desc}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Bottom legal */}
            <div className="mt-auto pt-10">
              <p className="text-xs text-white/45">
                By continuing you agree to the{' '}
                <Link
                  className="text-white/70 hover:text-white underline underline-offset-4"
                  href="/terms"
                >
                  Terms
                </Link>{' '}
                and{' '}
                <Link
                  className="text-white/70 hover:text-white underline underline-offset-4"
                  href="/privacy"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT: Form panel */}
        <main className="bg-gray-50 px-4 py-10 sm:px-8 lg:px-12 lg:py-14 flex items-center">
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Log in</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Enter your credentials to continue.
                  </p>
                </div>

                {verified && (
                  <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-700 mt-0.5" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-semibold text-green-900">Email verified</p>
                        <p className="text-sm text-green-800">You can log in now.</p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-700 mt-0.5" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-semibold text-red-900">Login failed</p>
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      />
                    </div>
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
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError('');
                        }}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                        className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-12 text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
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
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Link
                      href="/forgot-password"
                      className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" fullWidth isLoading={isLoading}>
                    Log in
                  </Button>
                </form>

                <div className="mt-6 border-t border-gray-200 pt-5">
                  <p className="text-center text-sm text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-semibold text-indigo-700 hover:text-indigo-800">
                      Sign up
                    </Link>
                  </p>

                  <p className="mt-3 text-center text-xs text-gray-500">
                    Client login?{' '}
                    <Link href="/p/login" className="font-medium text-gray-700 hover:text-gray-900">
                      Go to client portal login
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              © {new Date().getFullYear()} {APP_NAME}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Spinner size="lg" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}