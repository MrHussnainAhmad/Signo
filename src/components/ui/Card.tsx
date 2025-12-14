'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-sm border border-gray-200
        ${hover ? 'transition-all hover:shadow-md hover:-translate-y-0.5' : ''}
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function CardHeader({ children, className = '', action }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-5 ${className}`}>
      <div className="min-w-0">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export function CardTitle({ children, className = '', as: Tag = 'h3' }: CardTitleProps) {
  return <Tag className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</Tag>;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return <div className={`mt-6 pt-5 border-t border-gray-200 ${className}`}>{children}</div>;
}

// Stat Card for dashboard
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatCard({ label, value, icon, change, className = '' }: StatCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p
              className={`mt-2 text-sm font-medium ${
                change.value >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change.value >= 0 ? '↑' : '↓'} {Math.abs(change.value)}%{' '}
              <span className="text-gray-500 font-normal">{change.label}</span>
            </p>
          )}
        </div>
        {icon && (
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// Empty State Card
interface EmptyStateCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyStateCard({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateCardProps) {
  return (
    <Card className={`text-center py-12 ${className}`}>
      {icon && <div className="mx-auto w-12 h-12 text-gray-400 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-2 text-gray-600 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </Card>
  );
}