import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  handleApiError,
} from '@/lib/api-response';

interface RouteParams {
  params: { shareToken: string };
}

// GET - Get project by share token (for clients)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    
    // Find project by share token
    const project = await db.project.findUnique({
      where: { shareToken: params.shareToken },
      include: {
        workspace: {
          select: {
            name: true,
            logoUrl: true,
          },
        },
        deliverables: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        comments: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        approvalEvents: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        review: true,
      },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    // Check if client is logged in
    let isAuthenticated = false;
    let canInteract = false;

    if (session && session.type === 'client') {
      const client = await db.clientAccount.findUnique({
        where: { id: session.userId },
      });

      if (client && client.email === project.clientEmail) {
        isAuthenticated = true;
        canInteract = project.status !== 'APPROVED';
      }
    }

    // Public project info (limited if not authenticated)
    const response = {
      project: {
        id: project.id,
        title: project.title,
        clientName: project.clientName,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        workspace: {
          name: project.workspace.name,
          logoUrl: project.workspace.logoUrl,
        },
        deliverables: project.deliverables.map((d) => ({
          id: d.id,
          fileName: d.fileName,
          mimeType: d.mimeType,
          fileSize: d.fileSize,
          webViewLink: d.webViewLink,
          downloadLink: d.downloadLink,
          versionNumber: d.versionNumber,
          createdAt: d.createdAt,
        })),
        comments: isAuthenticated
          ? project.comments.map((c) => ({
              id: c.id,
              authorType: c.authorType,
              authorName: c.authorName,
              body: c.body,
              createdAt: c.createdAt,
            }))
          : [],
        lastApprovalEvent: project.approvalEvents[0]
          ? {
              eventType: project.approvalEvents[0].eventType,
              createdAt: project.approvalEvents[0].createdAt,
            }
          : null,
        hasReview: !!project.review,
      },
      isAuthenticated,
      canInteract,
      requiresAuth: !isAuthenticated,
      clientEmail: project.clientEmail,
    };

    return successResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
}