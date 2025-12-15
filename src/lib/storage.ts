import { db } from '@/lib/db';
import { config, type Plan } from '@/lib/config';

export async function getWorkspaceStorageUsage(workspaceId: string) {
  const result = await db.deliverable.aggregate({
    where: {
      project: {
        workspaceId: workspaceId,
      },
    },
    _sum: {
      fileSize: true,
    },
  });

  return result._sum.fileSize || 0;
}

export function getPlanLimits(plan: Plan) {
  if (plan === 'STUDIO') return config.limits.studio;
  if (plan === 'BUSINESS') return config.limits.business;
  // Default to solo for UNPAID too, effectively
  return config.limits.solo;
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}