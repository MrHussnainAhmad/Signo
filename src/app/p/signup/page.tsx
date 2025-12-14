'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { APP_NAME } from '@/lib/config';
import { Spinner } from '@/components/ui/Spinner';
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserRound,
  Link2,
  MessageSquareText,
} from 'lucide-react';

function Field({
  id,
  label,
  value,
  onChange,
  type,
  placeholder,
  autoComplete,
  required,
  icon,
  error,
  right,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  icon: React.ReactNode;
  error?: string;
  right?: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-gray-900">
        {label}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          {icon}
        </div>

        <input
          id={id}
          name={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={[
            'w-full rounded-2xl border bg-white py-3 pl-10 pr-12 text-gray-900 shadow-sm outline-none transition',
            'focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100',
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200',
          ].join(' ')}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {right ?? <div className="h-10 w-10" />}
        </div>
      </div>

      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}

function ClientSignupInner() {
  const searchParams = useSearchParams();

  const redirect = useMemo(() => searchParams.get('redirect') || '/p', [searchParams]);
  const prefillEmail = useMemo(() => searchParams.get('email') || '', [searchParams]);

  const loginHref = useMemo(() => {
    return `/p/login?redirect=${encodeURIComponent(redirect)}&email=${encodeURIComponent(prefillEmail)}`;
  }, [redirect, prefillEmail]);

  const [formData, setFormData] = useState({
    name: '',
    email: prefillEmail,
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // backend unchanged
      const response = await fetch('/api/client/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* LEFT: Premium info panel (dark) — opposite side from your client login */}
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
                  <BadgeCheck className="h-6 w-6 text-indigo-200" aria-hidden="true" />
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-semibold tracking-wide text-white/60">
                    Client portal powered by
                  </p>
                  <p className="text-lg font-bold text-white">{APP_NAME}</p>
                </div>
              </div>

              <h2 className="mt-10 text-4xl font-bold tracking-tight text-white">
                Review work.
                <span className="block text-indigo-200">Approve clearly.</span>
              </h2>
              <p className="mt-4 text-lg text-white/70">
                Sign up so you can access your project links, leave feedback, and confirm approvals.
              </p>

              <div className="mt-10 rounded-3xl border border-white/10 bg-white/5">
                <div className="px-6 py-5 border-b border-white/10">
                  <p className="text-sm font-semibold text-white/90">What you can do</p>
                  <p className="mt-1 text-sm text-white/60">Simple, no learning curve.</p>
                </div>

                <ul className="divide-y divide-white/10">
                  {[
                    { icon: Link2, title: 'Access project links', desc: 'Open deliverables from one place.' },
                    { icon: MessageSquareText, title: 'Leave clear feedback', desc: 'Comments stay organized.' },
                    { icon: CheckCircle2, title: 'Approve or request changes', desc: 'A clear decision flow.' },
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
                Use the same email address where you received the project invitation.
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT: Form */}
        <main className="flex items-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            {/* Top bar */}
            <div className="mb-8 flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-sm">
                  <BadgeCheck className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-semibold text-gray-500">Client portal</p>
                  <p className="text-lg font-bold text-gray-900">{APP_NAME}</p>
                </div>
              </Link>

              <Link
                href={loginHref}
                className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
              >
                Log in
              </Link>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
              <div className="p-6 sm:p-8">
                {!success ? (
                  <>
                    <div className="mb-6">
                      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Create client account
                      </h1>
                      <p className="mt-1 text-sm text-gray-600">
                        Sign up to view and approve your projects.
                      </p>

                      {prefillEmail && (
                        <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3">
                          <p className="text-xs font-semibold text-indigo-900">Invitation email detected</p>
                          <p className="mt-1 text-sm text-indigo-800 break-words">{prefillEmail}</p>
                        </div>
                      )}
                    </div>

                    {errors.general && (
                      <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="mt-0.5 h-5 w-5 text-red-700" aria-hidden="true" />
                          <div>
                            <p className="text-sm font-semibold text-red-900">Signup failed</p>
                            <p className="text-sm text-red-800">{errors.general}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                      <Field
                        id="name"
                        label="Full name"
                        value={formData.name}
                        onChange={(v) => {
                          setFormData((p) => ({ ...p, name: v }));
                          setErrors((p) => ({ ...p, name: '', general: '' }));
                        }}
                        type="text"
                        placeholder="John Smith"
                        autoComplete="name"
                        required
                        icon={<UserRound className="h-5 w-5" aria-hidden="true" />}
                        error={errors.name}
                      />

                      <Field
                        id="email"
                        label="Email"
                        value={formData.email}
                        onChange={(v) => {
                          setFormData((p) => ({ ...p, email: v }));
                          setErrors((p) => ({ ...p, email: '', general: '' }));
                        }}
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        icon={<Mail className="h-5 w-5" aria-hidden="true" />}
                        error={errors.email}
                        hint="Use the same email where you received the project invitation."
                      />

                      <Field
                        id="password"
                        label="Password"
                        value={formData.password}
                        onChange={(v) => {
                          setFormData((p) => ({ ...p, password: v }));
                          setErrors((p) => ({ ...p, password: '', general: '' }));
                        }}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        icon={<Lock className="h-5 w-5" aria-hidden="true" />}
                        error={errors.password}
                        hint="At least 8 characters with uppercase, lowercase, and number."
                        right={
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" aria-hidden="true" />
                            ) : (
                              <Eye className="h-5 w-5" aria-hidden="true" />
                            )}
                          </button>
                        }
                      />

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
                        Create account
                      </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                      Already have an account?{' '}
                      <Link href={loginHref} className="font-semibold text-indigo-700 hover:text-indigo-800">
                        Log in
                      </Link>
                    </p>
                  </>
                ) : (
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
                      Verify your email to access your projects.
                    </p>

                    <div className="mt-6">
                      <Link
                        href={`/p/login?redirect=${encodeURIComponent(redirect)}&email=${encodeURIComponent(formData.email)}`}
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition focus:outline-none focus:ring-4 focus:ring-indigo-200"
                      >
                        Go to login
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Client access only • {APP_NAME}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ClientSignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Spinner size="lg" />
        </div>
      }
    >
      <ClientSignupInner />
    </Suspense>
  );
}