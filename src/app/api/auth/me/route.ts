import { NextRequest } from 'next/server';
import { getCurrentUser, getCurrentWorkspace, getSession } from '@/lib/session';
import { db } from '@/lib/db';
import {
  successResponse,
  unauthorizedResponse,
  handleApiError,
} from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return unauthorizedResponse();
    }

    // Handle team session
    if (session.type === 'team') {
      const user = await getCurrentUser();
      
      if (!user) {
        return unauthorizedResponse();
      }

      const workspace = await getCurrentWorkspace();

      return successResponse({
        type: 'team',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
        workspace: workspace
          ? {
              id: workspace.id,
              name: workspace.name,
              plan: workspace.plan,
              logoUrl: workspace.logoUrl,
              isOwner: workspace.ownerId === user.id,
              memberCount: workspace._count.members,
              projectCount: workspace._count.projects,
            }
          : null,
      });
    }

    // Handle client session
    if (session.type === 'client') {
      const client = await db.clientAccount.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          createdAt: true,
        },
      });

      if (!client) {
        return unauthorizedResponse();
      }

      // Get projects associated with this client's email
      const projects = await db.project.findMany({
        where: {
          clientEmail: client.email,
        },
        select: {
          id: true,
          title: true,
          status: true,
          shareToken: true,
          workspace: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return successResponse({
        type: 'client',
        user: {
          id: client.id,
          name: client.name,
          email: client.email,
          emailVerified: client.emailVerified,
          createdAt: client.createdAt,
        },
        projects: projects.map((p) => ({
          id: p.id,
          title: p.title,
          status: p.status,
          shareToken: p.shareToken,
          workspaceName: p.workspace.name,
        })),
      });
    }

    return unauthorizedResponse();
  } catch (error) {
    return handleApiError(error);
  }
}