'use client';

import React from 'react';

type BadgeVariant = 'gray' | 'indigo' | 'green' | 'yellow' | 'red' | 'blue' | 'purple';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  gray: 'bg-gray-100 text-gray-800 ring-gray-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  green: 'bg-green-50 text-green-700 ring-green-200',
  yellow: 'bg-yellow-50 text-yellow-800 ring-yellow-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  purple: 'bg-purple-50 text-purple-700 ring-purple-200',
};

const dotColors: Record<BadgeVariant, string> = {
  gray: 'bg-gray-500',
  indigo: 'bg-indigo-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function Badge({
  children,
  variant = 'gray',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full ring-1
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant]}`} />
      )}
      {children}
      {removable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1.5 -mr-0.5 p-0.5 rounded-full hover:bg-black/10 transition-colors"
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

// Project Status Badge
type ProjectStatus = 'WAITING_FOR_CLIENT' | 'CHANGES_REQUESTED' | 'APPROVED';

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: BadgeSize;
  className?: string;
}

const statusConfig: Record<ProjectStatus, { label: string; variant: BadgeVariant }> = {
  WAITING_FOR_CLIENT: { label: 'Waiting for Client', variant: 'yellow' },
  CHANGES_REQUESTED: { label: 'Changes Requested', variant: 'red' },
  APPROVED: { label: 'Approved', variant: 'green' },
};

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size} dot className={className}>
      {config.label}
    </Badge>
  );
}

// Plan Badge
type PlanType = 'UNPAID' | 'SOLO' | 'STUDIO' | 'BUSINESS';

interface PlanBadgeProps {
  plan: PlanType;
  size?: BadgeSize;
  className?: string;
}

const planConfig: Record<PlanType, { label: string; variant: BadgeVariant }> = {
  UNPAID: { label: 'Free', variant: 'gray' },
  SOLO: { label: 'Solo', variant: 'indigo' },
  STUDIO: { label: 'Studio', variant: 'purple' },
  BUSINESS: { label: 'Business', variant: 'blue' },
};

export function PlanBadge({ plan, size = 'md', className = '' }: PlanBadgeProps) {
  const config = planConfig[plan];

  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.label}
    </Badge>
  );
}

// Role Badge
type RoleType = 'OWNER' | 'MEMBER';

interface RoleBadgeProps {
  role: RoleType;
  size?: BadgeSize;
  className?: string;
}

const roleConfig: Record<RoleType, { label: string; variant: BadgeVariant }> = {
  OWNER: { label: 'Owner', variant: 'indigo' },
  MEMBER: { label: 'Member', variant: 'gray' },
};

export function RoleBadge({ role, size = 'sm', className = '' }: RoleBadgeProps) {
  const config = roleConfig[role];

  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.label}
    </Badge>
  );
}