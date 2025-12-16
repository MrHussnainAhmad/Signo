'use client';

import React from 'react';
import { APP_NAME } from '@/lib/config';
import {
  BadgeCheck,
  MessageSquareText,
  Link2,
  Bell,
  Files,
  Shield,
  Clock,
} from 'lucide-react';

const bento = [
  {
    icon: Link2,
    title: 'One client link',
    description:
      'Send a single review link. Clients open it and respond without a complicated workflow.',
    className: 'md:col-span-2',
  },
  {
    icon: BadgeCheck,
    title: 'Approve / Request changes',
    description:
      'A clear decision button instead of “I guess it’s ok” messages scattered everywhere.',
    className: 'md:col-span-1',
  },
  {
    icon: MessageSquareText,
    title: 'Feedback stays together',
    description:
      'Comments live with the deliverables so you can track decisions and changes cleanly.',
    className: 'md:col-span-1',
  },
  {
    icon: Files,
    title: 'Version clarity',
    description:
      'Keep revisions understandable (v1, v2, v3) so nobody argues about what’s “latest.”',
    className: 'md:col-span-1',
  },
  {
    icon: Bell,
    title: 'Instant notifications',
    description:
      'Know when clients comment, approve, or request changes—no manual checking.',
    className: 'md:col-span-1',
  },
  {
    icon: Shield,
    title: 'Secure hosting',
    description:
      'Files are stored in SendWork storage for sharing and approvals. Ownership remains yours.',
    className: 'md:col-span-1',
  },
];

const steps = [
  {
    step: '01',
    title: 'Create a project',
    description: 'Add project name + client email.',
  },
  {
    step: '02',
    title: 'Upload deliverables',
    description: 'Add files to the project in seconds.',
  },
  {
    step: '03',
    title: 'Share the link',
    description: 'Client reviews on a clean page.',
  },
  {
    step: '04',
    title: 'Get a decision',
    description: 'Approve or request changes with a record.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold tracking-wider text-indigo-600">
            Built for fast approvals
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            A client approval flow that feels effortless
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {APP_NAME} is not a project management suite. It’s a simple approval page
            for deliverables—with clear feedback and clear sign-off.
          </p>
        </div>

        {/* Retention banner */}
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-900 ring-1 ring-gray-200">
              <Clock className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">Automatic data cleanup</p>
              <p className="mt-1 text-sm text-gray-600">
                For safety and simplicity, files and related data are automatically deleted after{' '}
                <span className="font-medium text-gray-900">3 months</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Bento grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {bento.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={[
                  'group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition',
                  'hover:-translate-y-0.5 hover:shadow-md',
                  item.className,
                ].join(' ')}
              >
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-gray-600">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* How it works */}
        <div className="mt-20">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              How it works
            </h3>
            <p className="mt-3 text-gray-600">
              Simple steps. No training for clients.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {steps.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-6"
              >
                <div className="text-sm font-semibold text-indigo-600">{s.step}</div>
                <div className="mt-2 text-lg font-semibold text-gray-900">{s.title}</div>
                <p className="mt-2 text-sm text-gray-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}