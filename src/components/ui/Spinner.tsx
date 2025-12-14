'use client';

import React from 'react';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  color?: 'primary' | 'white' | 'gray';
}

const sizeStyles: Record<SpinnerSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const colorMap: Record<string, string> = {
  primary: '#6366f1',
  white: '#ffffff',
  gray: '#4b5563',
};

export function Spinner({ size = 'md', className = '', color = 'primary' }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-200 ${sizeStyles[size]} ${className}`}
      style={{ borderTopColor: colorMap[color] }}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Full page loading spinner
interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Spinner size="xl" />
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  );
}

// Inline loading state
interface InlineLoaderProps {
  message?: string;
  size?: SpinnerSize;
  className?: string;
}

export function InlineLoader({ message, size = 'sm', className = '' }: InlineLoaderProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Spinner size={size} />
      {message && <span className="text-sm text-gray-600">{message}</span>}
    </div>
  );
}

// Button loading state
interface ButtonSpinnerProps {
  className?: string;
}

export function ButtonSpinner({ className = '' }: ButtonSpinnerProps) {
  return (
    <svg
      className={`animate-spin h-4 w-4 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Skeleton loader
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-200';

  const variantStyles = {
    text: 'rounded-lg h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-2xl',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} style={style} />;
}

// Card skeleton
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center gap-4 mb-5">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton width="60%" className="mb-2" height={20} />
          <Skeleton width="40%" height={16} />
        </div>
      </div>
      <Skeleton className="mb-3" height={16} />
      <Skeleton className="mb-3" height={16} />
      <Skeleton width="75%" height={16} />
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex gap-4">
          <Skeleton width="20%" height={16} />
          <Skeleton width="30%" height={16} />
          <Skeleton width="20%" height={16} />
          <Skeleton width="15%" height={16} />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-gray-100 px-6 py-4">
          <div className="flex gap-4">
            <Skeleton width="20%" height={16} />
            <Skeleton width="30%" height={16} />
            <Skeleton width="20%" height={16} />
            <Skeleton width="15%" height={16} />
          </div>
        </div>
      ))}
    </div>
  );
}