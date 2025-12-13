'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
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
    } catch (err) {
      showError('Error', 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Create New Project"
        description="Set up a new project for client approval"
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Project Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Website Redesign"
            error={errors.title}
            required
          />

          <Input
            label="Client Name"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            placeholder="e.g., John Smith"
            error={errors.clientName}
            required
          />

          <Input
            label="Client Email"
            type="email"
            name="clientEmail"
            value={formData.clientEmail}
            onChange={handleChange}
            placeholder="client@example.com"
            hint="The client will receive an email with access to the project"
            error={errors.clientEmail}
            required
          />

          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" isLoading={isLoading}>
              Create Project
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}