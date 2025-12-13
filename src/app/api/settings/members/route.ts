import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { config } from '@/lib/config';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  handleApiError,
} from '@/lib/api-response';

// GET - List members
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    const workspace = await db.workspace.findUnique({
      where: { id: session.workspaceId },
      include: {
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
        invites: {
          where: {
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          select: {
            id: true,
            email: true,
            expiresAt: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!workspace) {
      return errorResponse('Workspace not found', 404);
    }

    const isOwner = workspace.ownerId === session.userId;
    const maxMembers = workspace.plan === 'STUDIO'
      ? config.limits.studio.maxMembers
      : config.limits.solo.maxMembers;

    return successResponse({
      members: workspace.members.map((m) => ({
        id: m.id,
        role: m.role,
        user: m.user,
        isCurrentUser: m.userId === session.userId,
        canRemove: isOwner && m.userId !== session.userId,
        joinedAt: m.createdAt,
      })),
      pendingInvites: isOwner ? workspace.invites : [],
      isOwner,
      canInvite: isOwner && workspace.plan === 'STUDIO' && 
        (workspace.members.length + workspace.invites.length) < maxMembers,
      maxMembers,
      currentCount: workspace.members.length,
      pendingCount: workspace.invites.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Remove member
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return errorResponse('Member ID is required', 400);
    }

    // Get workspace
    const workspace = await db.workspace.findUnique({
      where: { id: session.workspaceId },
    });

    if (!workspace) {
      return errorResponse('Workspace not found', 404);
    }

    // Only owner can remove members
    if (workspace.ownerId !== session.userId) {
      return forbiddenResponse('Only the workspace owner can remove members');
    }

    // Find the member
    const member = await db.workspaceMember.findFirst({
      where: {
        id: memberId,
        workspaceId: workspace.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!member) {
      return errorResponse('Member not found', 404);
    }

    // Cannot remove owner
    if (member.userId === workspace.ownerId) {
      return forbiddenResponse('Cannot remove the workspace owner');
    }

    // Remove member
    await db.workspaceMember.delete({
      where: { id: member.id },
    });

    return successResponse({
      message: `${member.user.name} has been removed from the workspace`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}