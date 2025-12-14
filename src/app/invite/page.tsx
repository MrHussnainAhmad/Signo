'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import {
  UserPlus,
  Mail,
  Users,
  ShieldCheck,
  LogIn,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface InviteData {
  valid: boolean;
  email: string;
  workspaceName: string;
  inviterName: string;
  userExists: boolean;
}

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [isValidating, setIsValidating] = useState(true);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({ name: '', password: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invite token is missing');
      setIsValidating(false);
      return;
    }

    async function validateToken() {
      try {
        // backend logic unchanged
        const response = await fetch(`/api/invites/accept?token=${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setInviteData(data.data);
        } else {
          setError(data.error || 'Invalid or expired invite link');
        }
      } catch {
        setError('Failed to validate invite');
      } finally {
        setIsValidating(false);
      }
    }

    validateToken();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});
    setError('');

    try {
      // backend logic unchanged
      const response = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name: formData.name,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(data.errors).forEach(([key, value]) => {
            fieldErrors[key] = (value as string[])[0];
          });
          setFormErrors(fieldErrors);
        } else {
          setError(data.error || 'Failed to accept invite');
        }
        return;
      }

      router.push('/app');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- UI (new layout) ----------
  const title =
    inviteData?.workspaceName ? `Join ${inviteData.workspaceName}` : 'Join workspace';

  const subtitle =
    inviteData?.inviterName && inviteData?.workspaceName
      ? `${inviteData.inviterName} invited you to join this workspace.`
      : 'You were invited to join a workspace.';

  return (
    <div className="min-h-screen bg-white">
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* LEFT: Context panel */}
        <aside className="relative overflow-hidden bg-slate-950 px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/18 blur-3xl" />
            <div className="absolute -bottom-24 right-10 h-[520px] w-[520px] rounded-full bg-purple-500/12 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-black/25" />
          </div>

          <div className="relative mx-auto flex h-full max-w-xl flex-col">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-indigo-200" aria-hidden="true" />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold tracking-wide text-white/60">Workspace invite</p>
                <p className="text-lg font-bold text-white">{title}</p>
              </div>
            </Link>

            <h1 className="mt-10 text-4xl font-bold tracking-tight text-white">
              You’re invited.
            </h1>
            <p className="mt-4 text-lg text-white/70">{subtitle}</p>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/5">
              <div className="px-6 py-5 border-b border-white/10">
                <p className="text-sm font-semibold text-white/90">What happens next</p>
                <p className="mt-1 text-sm text-white/60">Two quick steps.</p>
              </div>

              <ul className="divide-y divide-white/10">
                <li className="px-6 py-5">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                      <Mail className="h-5 w-5 text-indigo-200" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white/90">Confirm your email</p>
                      <p className="mt-1 text-sm text-white/60">
                        You’ll join using the invited email address.
                      </p>
                    </div>
                  </div>
                </li>

                <li className="px-6 py-5">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                      <Users className="h-5 w-5 text-indigo-200" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white/90">Access the workspace</p>
                      <p className="mt-1 text-sm text-white/60">
                        Once accepted, you’ll land in the app.
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-auto pt-10">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                    <ShieldCheck className="h-5 w-5 text-indigo-200" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90">Secure invitation</p>
                    <p className="mt-1 text-sm text-white/60">
                      Invites are token-based and can expire.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT: Action panel */}
        <main className="flex items-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-gray-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
              <div className="p-6 sm:p-8">
                {/* Validating */}
                {isValidating && (
                  <div className="text-center">
                    <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 ring-1 ring-gray-200">
                      <Spinner size="md" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Validating invite</h2>
                    <p className="mt-2 text-sm text-gray-600">
                      Checking invitation details.
                    </p>
                  </div>
                )}

                {/* Invalid */}
                {!isValidating && error && !inviteData && (
                  <div className="text-center">
                    <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-200">
                      <AlertTriangle className="h-7 w-7 text-red-700" aria-hidden="true" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Invalid invite</h2>
                    <p className="mt-2 text-sm text-gray-600">{error}</p>

                    <div className="mt-6">
                      <Button href="/login" fullWidth>
                        <span className="inline-flex items-center gap-2">
                          <LogIn className="h-4 w-4" aria-hidden="true" />
                          Go to login
                        </span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Valid */}
                {!isValidating && inviteData && (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Accept invitation</h2>
                      <p className="mt-2 text-sm text-gray-600">
                        You’re joining{' '}
                        <span className="font-semibold text-gray-900">
                          {inviteData.workspaceName}
                        </span>{' '}
                        as:
                      </p>

                      <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900 break-words">
                          {inviteData.email}
                        </p>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-semibold text-red-900">Couldn’t accept invite</p>
                        <p className="mt-1 text-sm text-red-800">{error}</p>
                      </div>
                    )}

                    {/* Existing user -> login */}
                    {inviteData.userExists ? (
                      <div className="space-y-3">
                        <div className="rounded-2xl border border-gray-200 bg-white p-4">
                          <p className="text-sm font-semibold text-gray-900">Account found</p>
                          <p className="mt-1 text-sm text-gray-600">
                            Log in to join the workspace with your existing account.
                          </p>
                        </div>

                        <Button href={`/login?redirect=/invite?token=${token}`} fullWidth>
                          <span className="inline-flex items-center gap-2">
                            <LogIn className="h-4 w-4" aria-hidden="true" />
                            Log in to join
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </span>
                        </Button>
                      </div>
                    ) : (
                      // New user -> set name + password
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                          label="Your name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          error={formErrors.name}
                          required
                        />

                        <Input
                          label="Create password"
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          hint="At least 8 characters with uppercase, lowercase, and number"
                          error={formErrors.password}
                          required
                        />

                        <Button type="submit" fullWidth isLoading={isSubmitting}>
                          <span className="inline-flex items-center gap-2">
                            Join workspace
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </span>
                        </Button>

                        <p className="text-center text-sm text-gray-600">
                          Already have an account?{' '}
                          <Link
                            href={`/login?redirect=/invite?token=${token}`}
                            className="font-semibold text-indigo-700 hover:text-indigo-800"
                          >
                            Log in
                          </Link>
                        </p>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-gray-500">
              Invites can expire. If this link doesn’t work, ask the workspace owner for a new invite.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Spinner size="lg" />
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}