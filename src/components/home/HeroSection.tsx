'use client';

import React from 'react';
import { APP_NAME } from '@/lib/config';
import { Button } from '@/components/ui/Button';
import {
  BadgeCheck,
  Link2,
  MessageSquareText,
  ShieldCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0B1020]">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-[520px] w-[520px] rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-black/10" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-white/90">
              <BadgeCheck className="h-4 w-4 text-indigo-200" aria-hidden="true" />
              Deliverables → feedback → decision
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Send files. Get a decision.
              <span className="block text-indigo-200">Without the chaos.</span>
            </h1>

            <p className="mt-5 text-lg text-white/70 max-w-xl">
              {APP_NAME} is a client approval page for freelancers and agencies.
              Upload deliverables, collect feedback in one place, and get clear
              approve / changes sign-off.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button href="/signup" size="lg">
                Create your first approval link
              </Button>
              <Button href="/#pricing" variant="secondary" size="lg">
                View pricing
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Link2, label: 'One link for clients' },
                { icon: ShieldCheck, label: 'Ownership stays yours' },
                { icon: Clock, label: 'Auto-delete after 3 months' },
              ].map((i) => {
                const Icon = i.icon;
                return (
                  <div
                    key={i.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-indigo-200 ring-1 ring-white/10">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <p className="text-sm font-semibold text-white/90">{i.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right mock */}
          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl">
              <div className="rounded-2xl bg-white">
                {/* Header bar */}
                <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      Client Approval
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      Project: Website Redesign • Version v2
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800">
                    Waiting
                  </span>
                </div>

                {/* Files */}
                <div className="p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="aspect-video rounded-xl bg-gray-100 ring-1 ring-gray-200"
                      />
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          Feedback
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          “Please reduce hero text size and move the CTA up.”
                        </p>
                      </div>
                      <MessageSquareText className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition">
                        Approve
                      </button>
                      <button className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50 transition">
                        Request changes
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between text-xs text-gray-500">
                    <span>Paper trail included</span>
                    <span className="inline-flex items-center gap-1">
                      Next <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-6 left-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white shadow-xl">
              <p className="text-sm font-semibold">Clear approvals</p>
              <p className="text-xs text-white/70">No more “is it approved?”</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}