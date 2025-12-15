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
      '25GB total storage',
      '1GB max file size',
      'Client approval page',
      'Comments + approvals',
      'Email notifications',
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
      '500GB total storage',
      '5GB max file size',
      'Up to 5 team members',
      'Team collaboration',
      'Workspace branding',
    ],
    cta: 'Get Studio',
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    description: 'For growing agencies',
    price: 49,
    tax: 0,
    total: 49,
    features: [
      'Everything in Studio',
      '1TB total storage',
      'Unlimited file size',
      'Up to 10 team members',
      'Priority support',
      'Dedicated account manager',
    ],
    cta: 'Get Business',
    popular: false,
    monthly: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-sm font-semibold tracking-wider text-indigo-600">
            Flexible pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Choose the right plan for you
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            One-time payments for freelancers and small teams. Monthly subscription for growing agencies.
          </p>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={[
                'relative rounded-3xl border p-7 shadow-sm flex flex-col',
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
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                {plan.tax > 0 && <span className="text-sm text-gray-500">+ ${plan.tax} tax</span>}
                {'monthly' in plan && plan.monthly && <span className="text-sm font-medium text-gray-500">/month</span>}
              </div>

              <div className="mt-4 rounded-2xl bg-white/70 p-4 ring-1 ring-gray-200">
                <p className="text-sm text-gray-700">
                  {'monthly' in plan && plan.monthly ? 'Monthly subscription' : 'One-time payment'}:{' '}
                  <span className="font-semibold text-gray-900">${plan.total}{'monthly' in plan && plan.monthly ? '/mo' : ''}</span>
                </p>
              </div>

              <ul className="mt-6 space-y-3 flex-1">
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
                a: 'Files and related project data are automatically deleted after 2 months.',
              },
              {
                icon: Shield,
                q: 'Is this a subscription?',
                a: 'Solo and Studio are one-time payments. Business is a monthly subscription.',
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