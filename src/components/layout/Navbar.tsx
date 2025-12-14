'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { APP_NAME } from '@/lib/config';
import { Button } from '@/components/ui/Button';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  isAuthenticated?: boolean;
}

export function Navbar({ isAuthenticated = false }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/#features', label: 'Features' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/#reviews', label: 'Reviews' },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">{APP_NAME}</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Button href="/app" variant="primary">
                Dashboard
              </Button>
            ) : (
              <>
                <Button href="/login" variant="ghost">
                  Log in
                </Button>
                <Button href="/signup" variant="primary">
                  Get started
                </Button>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-xl p-2 text-gray-700 hover:bg-gray-100"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 border-t border-gray-100 pt-4 flex flex-col gap-2">
                {isAuthenticated ? (
                  <Button href="/app" variant="primary" fullWidth>
                    Dashboard
                  </Button>
                ) : (
                  <>
                    <Button href="/login" variant="secondary" fullWidth>
                      Log in
                    </Button>
                    <Button href="/signup" variant="primary" fullWidth>
                      Get started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}