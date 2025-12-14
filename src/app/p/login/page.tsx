'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { APP_NAME } from '@/lib/config';
import { Spinner } from '@/components/ui/Spinner';
import {
  AlertCircle,
  BadgeCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MessageSquareText,
  Link2,
  CheckCircle2,
} from 'lucide-react';

function ClientLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = useMemo(() => searchParams.get('redirect') || '/p', [searchParams]);
  const prefillEmail = useMemo(() => searchParams.get('email') || '', [searchParams]);

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const signupHref = useMemo(() => {
    return `/p/signup?redirect=${encodeURIComponent(redirect)}&email=${encodeURIComponent(prefillEmail)}`;
  }, [redirect, prefillEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // backend unchanged
      const response = await fetch('/api/client/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
    <div className="min-h-screen bg-white">
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* LEFT: Form */}
        <main className="flex items-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            {/* Top bar */}
            <div className="mb-8 flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-sm">
                  <BadgeCheck className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-semibold text-gray-500">Powered by</p>
                  <p className="text-lg font-bold text-gray-900">{APP_NAME}</p>
                </div>
              </Link>

              <Link
                href="/login"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                Agency login
              </Link>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
              <div className="p-6 sm:p-8">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Client portal
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Log in to review deliverables, leave feedback, and approve.
                  </p>

                  {prefillEmail && (
                    <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3">
                      <p className="text-xs font-semibold text-indigo-900">
                        Email prefilled
                      </p>
                      <p className="mt-1 text-sm text-indigo-800 break-words">
                        {prefillEmail}
                      </p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-red-700" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-semibold text-red-900">
                          Login failed
                        </p>
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-gray-900">
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
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                        className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-semibold text-gray-900">
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
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError('');
                        }}
                        autoComplete="current-password"
                        required
                        placeholder="••••••••"
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
                    {isLoading && <Spinner size="sm" />}
                    Log in
                  </button>
                </form>

                <div className="mt-6 border-t border-gray-200 pt-5">
                  <p className="text-center text-sm text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link
                      href={signupHref}
                      className="font-semibold text-indigo-700 hover:text-indigo-800"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Client access only • {APP_NAME}
            </p>
          </div>
        </main>

        {/* RIGHT: Premium info panel (structured, not messy) */}
        <aside className="hidden lg:block relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0">
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/18 blur-3xl" />
            <div className="absolute -bottom-24 left-10 h-[520px] w-[520px] rounded-full bg-purple-500/12 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-black/25" />
          </div>

          <div className="relative h-full px-12 py-14 flex">
            <div className="my-auto w-full max-w-xl">
              <p className="text-sm font-semibold tracking-wide text-white/60">
                Client review portal
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight text-white">
                Everything in one place.
              </h2>
              <p className="mt-4 text-lg text-white/70">
                Review deliverables, leave feedback, and confirm approval with a clear record.
              </p>

              <div className="mt-10 rounded-3xl border border-white/10 bg-white/5">
                <div className="px-6 py-5 border-b border-white/10">
                  <p className="text-sm font-semibold text-white/90">What you can do</p>
                  <p className="mt-1 text-sm text-white/60">No confusing tools.</p>
                </div>

                <ul className="divide-y divide-white/10">
                  {[
                    { icon: Link2, title: 'Open one link', desc: 'Access the project review page easily.' },
                    { icon: MessageSquareText, title: 'Comment clearly', desc: 'Keep feedback tied to the deliverables.' },
                    { icon: CheckCircle2, title: 'Approve or request changes', desc: 'A simple decision flow.' },
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
                Powered by {APP_NAME}. This portal is for clients to review and approve projects.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function ClientLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Spinner size="lg" />
        </div>
      }
    >
      <ClientLoginInner />
    </Suspense>
  );
}