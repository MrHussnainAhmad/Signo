'use client';

import React, { useState } from 'react';
import { APP_NAME } from '@/lib/config';
import { Button } from '@/components/ui/Button';

const plans = [
  {
    id: 'solo',
    name: 'Solo',
    description: 'Perfect for individual freelancers',
    price: 19,
    tax: 3,
    total: 22,
    features: [
      'Unlimited projects',
      'Unlimited deliverables',
      'Google Drive integration',
      'Client portal',
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
      'Advanced analytics',
    ],
    cta: 'Get Studio',
    popular: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900">
            Simple, one-time pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            No subscriptions. No hidden fees. Pay once, use forever.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative bg-white rounded-2xl shadow-sm border-2 p-8
                ${plan.popular ? 'border-indigo-600' : 'border-gray-200'}
              `}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-gray-600">{plan.description}</p>
                
                <div className="mt-6">
                  <span className="text-5xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500 ml-2">
                    + ${plan.tax} tax
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  One-time payment of ${plan.total}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                href="/signup"
                variant={plan.popular ? 'primary' : 'secondary'}
                fullWidth
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Upgrade Note */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Already on Solo?{' '}
            <span className="font-medium text-gray-900">
              Upgrade to Studio for just $15
            </span>
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-6">
            {[
              {
                q: 'Is this really a one-time payment?',
                a: `Yes! ${APP_NAME} is a one-time purchase. No monthly fees, no annual renewals. Pay once and use it forever.`,
              },
              {
                q: 'Can I upgrade from Solo to Studio later?',
                a: 'Absolutely! You can upgrade from Solo to Studio at any time for just $15 (no additional tax).',
              },
              {
                q: 'What happens to my files?',
                a: 'All deliverables are stored in your Google Drive account. You maintain full control and ownership of your files.',
              },
              {
                q: 'Is there a free trial?',
                a: 'We offer a 14-day money-back guarantee. If you\'re not satisfied, we\'ll refund your purchase.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}