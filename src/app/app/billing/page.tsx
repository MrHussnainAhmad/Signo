'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, PlanBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Spinner';

interface BillingData {
  plan: 'UNPAID' | 'SOLO' | 'STUDIO';
  isOwner: boolean;
  memberCount: number;
  maxMembers: number;
  canUpgrade: boolean;
  purchases: Array<{
    id: string;
    type: string;
    amount: number;
    tax: number;
    total: number;
    createdAt: string;
  }>;
  pricing: {
    solo: { amount: number; tax: number; total: number };
    studio: { amount: number; tax: number; total: number };
    upgrade: { amount: number; tax: number; total: number };
  };
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const { success, error: showError } = useToast();
  
  const [data, setData] = useState<BillingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    // Handle success/cancel from Stripe
    if (searchParams.get('success') === 'true') {
      success('Payment Successful', 'Your plan has been activated!');
    } else if (searchParams.get('canceled') === 'true') {
      showError('Payment Canceled', 'Your payment was not completed.');
    }

    fetchBilling();
  }, []);

  async function fetchBilling() {
    try {
      const response = await fetch('/api/billing/checkout');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      showError('Error', 'Failed to load billing information');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCheckout(planType: 'solo' | 'studio' | 'upgrade') {
    setIsCheckingOut(planType);
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      });

      const result = await response.json();

      if (result.success && result.data.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      } else {
        showError('Error', result.error || 'Failed to start checkout');
      }
    } catch (error) {
      showError('Error', 'Failed to start checkout');
    } finally {
      setIsCheckingOut(null);
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton width={200} height={32} className="mb-2" />
          <Skeleton width={300} height={20} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton height={300} className="rounded-xl" />
          <Skeleton height={300} className="rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Manage your subscription and payment history"
      />

      {/* Current Plan */}
      <Card className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Plan</h3>
            <div className="flex items-center gap-3">
              <PlanBadge plan={data.plan} size="lg" />
              {data.plan !== 'UNPAID' && (
                <span className="text-gray-600">
                  {data.memberCount} / {data.maxMembers} members
                </span>
              )}
            </div>
          </div>
          {data.canUpgrade && (
            <Button
              onClick={() => handleCheckout('upgrade')}
              isLoading={isCheckingOut === 'upgrade'}
            >
              Upgrade to Studio - $15
            </Button>
          )}
        </div>
      </Card>

      {/* Plans */}
      {data.plan === 'UNPAID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Solo Plan */}
          <Card className="border-2 border-gray-200">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Solo</h3>
              <p className="text-gray-600 mt-1">For individual freelancers</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">
                  ${data.pricing.solo.amount}
                </span>
                <span className="text-gray-500 ml-2">+ ${data.pricing.solo.tax} tax</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">One-time payment</p>
            </div>

            <ul className="space-y-3 mb-6">
              {[
                'Unlimited projects',
                'Unlimited deliverables',
                'Google Drive storage',
                'Client portal',
                'Email notifications',
                '1 user account',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleCheckout('solo')}
              isLoading={isCheckingOut === 'solo'}
              variant="secondary"
              fullWidth
            >
              Get Solo - ${data.pricing.solo.total}
            </Button>
          </Card>

          {/* Studio Plan */}
          <Card className="border-2 border-indigo-600 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant="indigo">Most Popular</Badge>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Studio</h3>
              <p className="text-gray-600 mt-1">For teams and agencies</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">
                  ${data.pricing.studio.amount}
                </span>
                <span className="text-gray-500 ml-2">+ ${data.pricing.studio.tax} tax</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">One-time payment</p>
            </div>

            <ul className="space-y-3 mb-6">
              {[
                'Everything in Solo',
                'Up to 5 team members',
                'Team collaboration',
                'Workspace branding',
                'Priority support',
                'Advanced analytics',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleCheckout('studio')}
              isLoading={isCheckingOut === 'studio'}
              fullWidth
            >
              Get Studio - ${data.pricing.studio.total}
            </Button>
          </Card>
        </div>
      )}

      {/* Purchase History */}
      {data.purchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Purchase History</CardTitle>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tax</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="gray">{purchase.type}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      ${(purchase.amount / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      ${(purchase.tax / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      ${(purchase.total / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Money Back Guarantee */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          🔒 Secure payment powered by Stripe • 14-day money-back guarantee
        </p>
      </div>
    </div>
  );
}