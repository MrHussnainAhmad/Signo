'use client';

import React from 'react';
import { APP_NAME } from '@/lib/config';
import { Button } from '@/components/ui/Button';
import { Check, Shield, Clock, UserRound } from 'lucide-react';

const plans = [
  {
    id: 'solo',
    name: 'Solo',
    description: 'For individual freelancers',
    price: 19,
    tax: 3,
    total: 22,
    features: [
      'Unlimited projects',
      'Unlimited deliverables',
      'Client approval page',
      'Comments + approvals',
      'Email notifications',
      'One user account',
    ],
    cta: 'Get Solo',
    popular: false,
  },
  {
    id: 'studio',
    name: 'Studio',
    description: 'For teams and agencies',
    price: 29,
    tax: 3,
    total: 32,
    features: [
      'Everything in Solo',
      'Up to 5 team members',
      'Team collaboration',
      'Workspace branding',
      'Priority support',
      'Advanced insights',
    ],
    cta: 'Get Studio',
    popular: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-sm font-semibold tracking-wider text-indigo-600">
            One-time payment
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simple pricing. No subscriptions.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Pay once and use {APP_NAME}. No monthly plans.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={[
                'relative rounded-3xl border p-7 shadow-sm',
                plan.popular
                  ? 'border-indigo-600 bg-indigo-50/40'
                  : 'border-gray-200 bg-white',
              ].join(' ')}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-indigo-600 px-4 py-1 text-sm font-semibold text-white">
                    Most popular
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="mt-1 text-gray-600">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-gray-900">${plan.price}</div>
                  <div className="text-sm text-gray-500">+ ${plan.tax} tax</div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white/70 p-4 ring-1 ring-gray-200">
                <p className="text-sm text-gray-700">
                  One-time payment:{' '}
                  <span className="font-semibold text-gray-900">${plan.total}</span>
                </p>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 text-green-600" aria-hidden="true" />
                    <span className="text-gray-700">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                <Button
                  href="/signup"
                  variant={plan.popular ? 'primary' : 'secondary'}
                  fullWidth
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-600">
            Already on Solo?{' '}
            <span className="font-medium text-gray-900">Upgrade to Studio for $15</span>
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-16 mx-auto max-w-3xl">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            FAQ
          </h3>

          <div className="space-y-4">
            {[
              {
                icon: UserRound,
                q: 'Do clients need an account?',
                a: 'No. Clients open the link, review, comment, and approve/request changes.',
              },
              {
                icon: Shield,
                q: 'Where are files stored?',
                a: `${APP_NAME} stores uploaded files in its own storage for sharing and approvals. Ownership remains yours.`,
              },
              {
                icon: Clock,
                q: 'How long is data kept?',
                a: 'Files and related project data are automatically deleted after 3 months.',
              },
              {
                icon: Shield,
                q: 'Is this a subscription?',
                a: 'No. It’s a one-time payment. No monthly renewals.',
              },
            ].map((faq) => {
              const Icon = faq.icon;
              return (
                <div key={faq.q} className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-900 ring-1 ring-gray-200">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{faq.q}</h4>
                      <p className="mt-2 text-gray-700">{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}