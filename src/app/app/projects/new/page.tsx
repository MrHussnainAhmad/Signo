'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { FolderPlus, UserRound, Mail, Info, ArrowLeft, ArrowRight } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientEmail: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // backend unchanged
      const response = await fetch('/api/projects', {
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
          showError('Error', data.error || 'Failed to create project');
        }
        return;
      }

      success('Project Created', 'Your project has been created successfully');
      router.push(`/app/projects/${data.data.project.id}`);
    } catch {
      showError('Error', 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Create project"
        description="Set up a new project for client approval"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main form */}
        <div className="lg:col-span-7">
          <Card className="p-0 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Project details</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Add a title and the client’s contact info.
                  </p>
                </div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
                  <FolderPlus className="h-5 w-5 text-indigo-700" aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Project title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Website Redesign"
                  error={errors.title}
                  required
                  leftIcon={<FolderPlus className="w-5 h-5" aria-hidden="true" />}
                />

                <Input
                  label="Client name"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="e.g., John Smith"
                  error={errors.clientName}
                  required
                  leftIcon={<UserRound className="w-5 h-5" aria-hidden="true" />}
                />

                <Input
                  label="Client email"
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  placeholder="client@example.com"
                  hint="The client will receive an email with access to the project."
                  error={errors.clientEmail}
                  required
                  leftIcon={<Mail className="w-5 h-5" aria-hidden="true" />}
                />

                <div className="pt-2 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.back()}
                  >
                    <span className="inline-flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      Cancel
                    </span>
                  </Button>

                  <Button type="submit" isLoading={isLoading}>
                    <span className="inline-flex items-center gap-2">
                      Create project
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>

        {/* Side help panel */}
        <div className="lg:col-span-5">
          <Card className="p-0 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">What happens next</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    A quick overview of the approval flow.
                  </p>
                </div>
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-50 ring-1 ring-gray-200">
                  <Info className="h-5 w-5 text-gray-700" aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <ol className="space-y-4 text-sm text-gray-700">
                <li className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900">1) Upload deliverables</p>
                  <p className="mt-1 text-gray-600">Add files as versions (v1, v2, v3) while you iterate.</p>
                </li>
                <li className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900">2) Share the client link</p>
                  <p className="mt-1 text-gray-600">Copy the share link from the project page.</p>
                </li>
                <li className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900">3) Get a decision</p>
                  <p className="mt-1 text-gray-600">Clients approve or request changes with a clear record.</p>
                </li>
              </ol>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}