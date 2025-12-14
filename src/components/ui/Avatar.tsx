'use client';

import React from 'react';
import Image from 'next/image';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; pixels: number }> = {
  xs: { container: 'w-6 h-6', text: 'text-xs', pixels: 24 },
  sm: { container: 'w-8 h-8', text: 'text-xs', pixels: 32 },
  md: { container: 'w-10 h-10', text: 'text-sm', pixels: 40 },
  lg: { container: 'w-12 h-12', text: 'text-base', pixels: 48 },
  xl: { container: 'w-16 h-16', text: 'text-lg', pixels: 64 },
};

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const styles = sizeStyles[size];
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  if (src) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden ring-1 ring-gray-200 ${styles.container} ${className}`}
      >
        <Image
          src={src}
          alt={name}
          width={styles.pixels}
          height={styles.pixels}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`
        inline-flex items-center justify-center rounded-full text-white font-semibold
        ${styles.container} ${styles.text} ${bgColor} ${className}
      `}
      title={name}
    >
      {initials}
    </div>
  );
}

// Avatar Group
interface AvatarGroupProps {
  users: Array<{ name: string; avatarUrl?: string | null }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({ users, max = 4, size = 'sm', className = '' }: AvatarGroupProps) {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visibleUsers.map((user, index) => (
        <div key={index} className="relative ring-2 ring-white rounded-full">
          <Avatar src={user.avatarUrl} name={user.name} size={size} />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={`
            relative inline-flex items-center justify-center rounded-full
            bg-gray-100 text-gray-700 font-semibold ring-2 ring-white
            ${sizeStyles[size].container} ${sizeStyles[size].text}
          `}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

// Avatar with status indicator
interface AvatarWithStatusProps extends AvatarProps {
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export function AvatarWithStatus({ status, size = 'md', ...props }: AvatarWithStatusProps) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  const statusSizes: Record<AvatarSize, string> = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  return (
    <div className="relative inline-block">
      <Avatar size={size} {...props} />
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 block rounded-full ring-2 ring-white
            ${statusColors[status]} ${statusSizes[size]}
          `}
        />
      )}
    </div>
  );
}