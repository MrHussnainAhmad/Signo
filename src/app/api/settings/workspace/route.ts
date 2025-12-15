import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  handleApiError,
  validateBody,
} from '@/lib/api-response';

import { getWorkspaceStorageUsage, getPlanLimits } from '@/lib/storage';

const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional(),
});

// GET - Get workspace details
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    const workspace = await db.workspace.findUnique({
      where: { id: session.workspaceId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        _count: {
          select: {
            projects: true,
            members: true,
          },
        },
      },
    });

    if (!workspace) {
      return errorResponse('Workspace not found', 404);
    }

    const currentStorage = await getWorkspaceStorageUsage(workspace.id);
    const limits = getPlanLimits(workspace.plan);

    return successResponse({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        plan: workspace.plan,
        logoUrl: workspace.logoUrl,
        owner: workspace.owner,
        isOwner: workspace.ownerId === session.userId,
        members: workspace.members.map((m) => ({
          id: m.id,
          role: m.role,
          user: m.user,
          joinedAt: m.createdAt,
        })),
        projectCount: workspace._count.projects,
        memberCount: workspace._count.members,
        createdAt: workspace.createdAt,
        currentStorage,
        maxStorage: limits.maxStorage,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH - Update workspace
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    // Validate request body
    const { data, error } = await validateBody(request, updateWorkspaceSchema);
    if (error) {
      return error;
    }

    // Get workspace
    const workspace = await db.workspace.findUnique({
      where: { id: session.workspaceId },
    });

    if (!workspace) {
      return errorResponse('Workspace not found', 404);
    }

    // Only owner can update workspace
    if (workspace.ownerId !== session.userId) {
      return forbiddenResponse('Only the workspace owner can update settings');
    }

    // Check if there's anything to update
    if (!data.name) {
      return errorResponse('No fields to update', 400);
    }

    // Update workspace
    const updatedWorkspace = await db.workspace.update({
      where: { id: workspace.id },
      data: {
        ...(data.name && { name: data.name }),
      },
      select: {
        id: true,
        name: true,
        plan: true,
        logoUrl: true,
        updatedAt: true,
      },
    });

    return successResponse({
      workspace: updatedWorkspace,
      message: 'Workspace updated successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}