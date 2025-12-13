'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';

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

  const [formData, setFormData] = useState({
    name: '',
    password: '',
  });
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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setFormErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    try {
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

  if (isValidating) {
    return (
      <AuthLayout title="Validating Invite..." subtitle="Please wait">
        <div className="flex flex-col items-center py-8">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Validating your invitation...</p>
        </div>
      </AuthLayout>
    );
  }

  if (error && !inviteData) {
    return (
      <AuthLayout title="Invalid Invite" subtitle="This invitation is not valid">
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
          <Button href="/login" fullWidth>
            Go to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (!inviteData) return null;

  if (inviteData.userExists) {
    return (
      <AuthLayout
        title="You are Invited!"
        subtitle={`${inviteData.inviterName} invited you to join ${inviteData.workspaceName}`}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-6">
            An account already exists for <strong>{inviteData.email}</strong>.
            Please log in to join the workspace.
          </p>
          <Button href={`/login?redirect=/invite?token=${token}`} fullWidth>
            Log In
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="You are Invited!"
      subtitle={`${inviteData.inviterName} invited you to join ${inviteData.workspaceName}`}
    >
      <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
        <p className="text-sm text-indigo-700">
          You will be joining as <strong>{inviteData.email}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Your Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          error={formErrors.name}
          required
        />

        <Input
          label="Create Password"
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
          Join Workspace
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <InviteContent />
    </Suspense>
  );
}