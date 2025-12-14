'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, PlanBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Spinner';
import {
  ArrowRight,
  Check,
  Minus,
  ShieldCheck,
  Users,
  ReceiptText,
  LockKeyhole,
  Sparkles,
} from 'lucide-react';

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

type PlanKey = 'solo' | 'studio';

const planMeta: Record<PlanKey, { title: string; blurb: string }> = {
  solo: {
    title: 'Solo',
    blurb: 'For individual freelancers.',
  },
  studio: {
    title: 'Studio',
    blurb: 'For teams and agencies.',
  },
};

const comparisonRows: Array<{
  label: string;
  solo: boolean | 'text';
  studio: boolean | 'text';
  soloText?: string;
  studioText?: string;
}> = [
  { label: 'Unlimited projects', solo: true, studio: true },
  { label: 'Unlimited deliverables', solo: true, studio: true },
  { label: 'Client portal', solo: true, studio: true },
  { label: 'Comments + approvals', solo: true, studio: true },
  { label: 'Email notifications', solo: true, studio: true },
  { label: 'User accounts', solo: 'text', studio: 'text', soloText: '1', studioText: 'Up to 5' },
  { label: 'Workspace branding', solo: false, studio: true },
  { label: 'Priority support', solo: false, studio: true },
  { label: 'Advanced analytics', solo: false, studio: true },
];

function MoneyBreakdown({
  amount,
  tax,
  total,
}: {
  amount: number;
  tax: number;
  total: number;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-4xl font-bold tracking-tight text-gray-900">${amount}</div>
          <div className="mt-1 text-sm text-gray-500">One-time payment</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">+ ${tax} tax</div>
          <div className="mt-1 text-sm font-semibold text-gray-900">Total: ${total}</div>
        </div>
      </div>
    </div>
  );
}

function CellCheck({ value }: { value: boolean | 'text'; }) {
  if (value === 'text') return null;
  return value ? (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-50 ring-1 ring-green-200">
      <Check className="h-4 w-4 text-green-700" aria-hidden="true" />
    </span>
  ) : (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-50 ring-1 ring-gray-200">
      <Minus className="h-4 w-4 text-gray-500" aria-hidden="true" />
    </span>
  );
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const { success, error: showError } = useToast();

  const [data, setData] = useState<BillingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    // backend logic untouched
    if (searchParams.get('success') === 'true') {
      success('Payment Successful', 'Your plan has been activated!');
    } else if (searchParams.get('canceled') === 'true') {
      showError('Payment Canceled', 'Your payment was not completed.');
    }

    fetchBilling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchBilling() {
    try {
      // backend untouched
      const response = await fetch('/api/billing/checkout');
      const result = await response.json();
      if (result.success) setData(result.data);
    } catch {
      showError('Error', 'Failed to load billing information');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCheckout(planType: 'solo' | 'studio' | 'upgrade') {
    setIsCheckingOut(planType);
    try {
      // backend untouched
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
    } catch {
      showError('Error', 'Failed to start checkout');
    } finally {
      setIsCheckingOut(null);
    }
  }

  const upgradeText = useMemo(() => {
    if (!data) return 'Upgrade to Studio';
    return `Upgrade to Studio — $${data.pricing.upgrade.total}`;
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton width={200} height={32} className="mb-2" />
          <Skeleton width={340} height={20} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton height={160} className="rounded-2xl" />
          <Skeleton height={160} className="rounded-2xl" />
          <Skeleton height={160} className="rounded-2xl" />
        </div>

        <Skeleton height={420} className="rounded-2xl" />
        <Skeleton height={260} className="rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  const isUnpaid = data.plan === 'UNPAID';
  const canPurchase = data.isOwner;

  return (
    <div className="space-y-8">
      <PageHeader title="Billing" description="Plans, checkout, and purchase history" />

      {/* Top overview (NEW layout: 3 compact cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Plan</p>
              <div className="mt-3 flex items-center gap-3">
                <PlanBadge plan={data.plan} size="lg" />
                {data.canUpgrade && (
                  <Badge variant="gray">Upgrade available</Badge>
                )}
              </div>
              <p className="mt-3 text-sm text-gray-600">
                {data.plan === 'UNPAID'
                  ? 'Choose a plan to unlock the workspace.'
                  : 'Your workspace is active.'}
              </p>
            </div>

            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-50 ring-1 ring-gray-200">
              <Sparkles className="h-5 w-5 text-gray-700" aria-hidden="true" />
            </div>
          </div>

          {data.canUpgrade && (
            <div className="mt-5">
              <Button
                onClick={() => handleCheckout('upgrade')}
                isLoading={isCheckingOut === 'upgrade'}
                disabled={!canPurchase}
                fullWidth
              >
                <span className="inline-flex items-center gap-2">
                  {upgradeText}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Button>

              {!canPurchase && (
                <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
                  <LockKeyhole className="h-4 w-4 mt-0.5" aria-hidden="true" />
                  Only the workspace owner can upgrade.
                </div>
              )}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Team</p>
              <div className="mt-3 flex items-center gap-2 text-gray-900">
                <Users className="h-5 w-5 text-gray-500" aria-hidden="true" />
                {data.plan === 'UNPAID' ? (
                  <span className="text-sm text-gray-600">Seats depend on plan</span>
                ) : (
                  <span className="text-sm font-semibold">
                    {data.memberCount} / {data.maxMembers} members
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm text-gray-600">
                {data.plan === 'STUDIO'
                  ? 'Studio supports up to 5 members.'
                  : data.plan === 'SOLO'
                    ? 'Solo is for a single user.'
                    : 'Purchase a plan to add members.'}
              </p>
            </div>

            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-50 ring-1 ring-gray-200">
              <Users className="h-5 w-5 text-gray-700" aria-hidden="true" />
            </div>
          </div>

          {!data.isOwner && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <LockKeyhole className="h-5 w-5 text-amber-800 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Owner required</p>
                  <p className="mt-1 text-sm text-amber-800">
                    Only the workspace owner can purchase or upgrade.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Payments</p>
              <p className="mt-3 text-sm text-gray-600">
                One-time purchases. No subscription renewals.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm text-gray-600">
                <ReceiptText className="h-4 w-4 text-gray-400" aria-hidden="true" />
                {data.purchases.length} purchase(s)
              </div>
            </div>

            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-50 ring-1 ring-gray-200">
              <ShieldCheck className="h-5 w-5 text-gray-700" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-gray-500 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Secure checkout</p>
                <p className="mt-1 text-sm text-gray-600">
                  Payments are processed securely by Stripe.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Plans (NEW: comparison table on desktop, cards on mobile) */}
      {isUnpaid && (
        <Card className="p-0 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-xl font-bold text-gray-900">Choose a plan</h2>
            <p className="mt-1 text-sm text-gray-600">
              Pick the plan that matches how you work.
            </p>
          </div>

          {/* Mobile: stacked plan cards */}
          <div className="md:hidden p-6 space-y-6">
            {(['solo', 'studio'] as PlanKey[]).map((k) => {
              const meta = planMeta[k];
              const price = data.pricing[k];
              const isStudio = k === 'studio';

              return (
                <div
                  key={k}
                  className={[
                    'rounded-3xl border p-5',
                    isStudio ? 'border-indigo-200 bg-indigo-50/40' : 'border-gray-200 bg-white',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">{meta.title}</h3>
                        {isStudio && <Badge variant="indigo">Popular</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{meta.blurb}</p>
                    </div>
                    <Badge variant="gray">One-time</Badge>
                  </div>

                  <MoneyBreakdown amount={price.amount} tax={price.tax} total={price.total} />

                  <ul className="mt-5 space-y-3 text-sm text-gray-700">
                    {comparisonRows
                      .filter((r) => (k === 'solo' ? r.solo : r.studio) !== false)
                      .map((r) => {
                        const val = k === 'solo' ? r.solo : r.studio;
                        const textVal =
                          val === 'text' ? (k === 'solo' ? r.soloText : r.studioText) : null;

                        return (
                          <li key={r.label} className="flex items-start gap-3">
                            <Check className="mt-0.5 h-4 w-4 text-green-600" aria-hidden="true" />
                            <span>
                              {r.label}
                              {textVal ? <span className="font-semibold text-gray-900"> — {textVal}</span> : null}
                            </span>
                          </li>
                        );
                      })}
                  </ul>

                  <div className="mt-6">
                    <Button
                      onClick={() => handleCheckout(k)}
                      isLoading={isCheckingOut === k}
                      disabled={!canPurchase}
                      variant={isStudio ? 'primary' : 'secondary'}
                      fullWidth
                    >
                      Buy {meta.title} — ${price.total}
                    </Button>

                    {!canPurchase && (
                      <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
                        <LockKeyhole className="h-4 w-4 mt-0.5" aria-hidden="true" />
                        Only the workspace owner can purchase.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: feature comparison table */}
          <div className="hidden md:block">
            <div className="grid grid-cols-12">
              <div className="col-span-6 border-r border-gray-200 px-6 py-5">
                <p className="text-sm font-semibold text-gray-900">Features</p>
                <p className="mt-1 text-sm text-gray-600">
                  Compare Solo vs Studio.
                </p>
              </div>

              <div className="col-span-3 border-r border-gray-200 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-500">SOLO</p>
                    <p className="mt-1 text-lg font-bold text-gray-900">Solo</p>
                    <p className="mt-1 text-sm text-gray-600">{planMeta.solo.blurb}</p>
                  </div>
                  <Badge variant="gray">One-time</Badge>
                </div>

                <MoneyBreakdown
                  amount={data.pricing.solo.amount}
                  tax={data.pricing.solo.tax}
                  total={data.pricing.solo.total}
                />

                <Button
                  onClick={() => handleCheckout('solo')}
                  isLoading={isCheckingOut === 'solo'}
                  disabled={!canPurchase}
                  variant="secondary"
                  fullWidth
                  className="mt-4"
                >
                  Buy Solo — ${data.pricing.solo.total}
                </Button>
              </div>

              <div className="col-span-3 px-6 py-5 bg-indigo-50/40">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold tracking-wide text-indigo-700">STUDIO</p>
                      <Badge variant="indigo">Popular</Badge>
                    </div>
                    <p className="mt-1 text-lg font-bold text-gray-900">Studio</p>
                    <p className="mt-1 text-sm text-gray-600">{planMeta.studio.blurb}</p>
                  </div>
                  <Badge variant="gray">One-time</Badge>
                </div>

                <MoneyBreakdown
                  amount={data.pricing.studio.amount}
                  tax={data.pricing.studio.tax}
                  total={data.pricing.studio.total}
                />

                <Button
                  onClick={() => handleCheckout('studio')}
                  isLoading={isCheckingOut === 'studio'}
                  disabled={!canPurchase}
                  fullWidth
                  className="mt-4"
                >
                  Buy Studio — ${data.pricing.studio.total}
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-200">
              {comparisonRows.map((row) => (
                <div key={row.label} className="grid grid-cols-12 border-b border-gray-100">
                  <div className="col-span-6 border-r border-gray-100 px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{row.label}</p>
                  </div>

                  <div className="col-span-3 border-r border-gray-100 px-6 py-4">
                    <div className="flex items-center justify-between">
                      {row.solo === 'text' ? (
                        <span className="text-sm font-semibold text-gray-900">{row.soloText}</span>
                      ) : (
                        <CellCheck value={row.solo} />
                      )}
                    </div>
                  </div>

                  <div className="col-span-3 px-6 py-4 bg-indigo-50/20">
                    <div className="flex items-center justify-between">
                      {row.studio === 'text' ? (
                        <span className="text-sm font-semibold text-gray-900">{row.studioText}</span>
                      ) : (
                        <CellCheck value={row.studio} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!canPurchase && (
              <div className="px-6 py-4">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <LockKeyhole className="h-5 w-5 text-amber-800 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Owner required</p>
                      <p className="mt-1 text-sm text-amber-800">
                        Only the workspace owner can purchase a plan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Purchase history (NEW: timeline on mobile, table on desktop) */}
      <Card className="p-0 overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Purchase history</CardTitle>
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <ReceiptText className="h-4 w-4 text-gray-400" aria-hidden="true" />
              {data.purchases.length}
            </div>
          </div>
        </CardHeader>

        {data.purchases.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">No purchases yet.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Plan</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Tax</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.purchases.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="gray">{p.type}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        ${(p.amount / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        ${(p.tax / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        ${(p.total / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile timeline */}
            <div className="md:hidden p-4">
              <div className="space-y-3">
                {data.purchases.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </p>
                        <div className="mt-2">
                          <Badge variant="gray">{p.type}</Badge>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        ${(p.total / 100).toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <div className="text-xs text-gray-500">Amount</div>
                        <div className="font-medium text-gray-900">
                          ${(p.amount / 100).toFixed(2)}
                        </div>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <div className="text-xs text-gray-500">Tax</div>
                        <div className="font-medium text-gray-900">
                          ${(p.tax / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Footer note: no emojis, no money-back, no Drive */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <ShieldCheck className="h-4 w-4 text-gray-400" aria-hidden="true" />
        Secure payment powered by Stripe
      </div>
    </div>
  );
}