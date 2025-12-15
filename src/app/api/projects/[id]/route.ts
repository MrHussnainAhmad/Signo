import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { updateProjectSchema } from '@/lib/validation';
import { config } from '@/lib/config';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  handleApiError,
  validateBody,
} from '@/lib/api-response';

interface RouteParams {
  params: { id: string };
}

// GET - Get single project
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    const project = await db.project.findFirst({
      where: {
        id: params.id,
        workspaceId: session.workspaceId,
      },
      include: {
        workspace: {
          select: {
            plan: true,
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
        },
        review: true,
      },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    return successResponse({
      project: {
        id: project.id,
        title: project.title,
        clientName: project.clientName,
        clientEmail: project.clientEmail,
        status: project.status,
        shareToken: project.shareToken,
        shareUrl: `${config.appUrl}/p/${project.shareToken}`,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        workspace: {
          plan: project.workspace.plan,
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
        comments: project.comments.map((c) => ({
          id: c.id,
          authorType: c.authorType,
          authorName: c.authorName,
          authorEmail: c.authorEmail,
          body: c.body,
          createdAt: c.createdAt,
        })),
        approvalEvents: project.approvalEvents.map((e) => ({
          id: e.id,
          eventType: e.eventType,
          clientName: e.clientName,
          clientEmail: e.clientEmail,
          note: e.note,
          createdAt: e.createdAt,
        })),
        review: project.review
          ? {
              id: project.review.id,
              rating: project.review.rating,
              text: project.review.text,
              authorName: project.review.authorName,
              createdAt: project.review.createdAt,
            }
          : null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH - Update project
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    // Validate request body
    const { data, error } = await validateBody(request, updateProjectSchema);
    if (error) {
      return error;
    }

    // Find project
    const project = await db.project.findFirst({
      where: {
        id: params.id,
        workspaceId: session.workspaceId,
      },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    // Cannot update approved projects
    if (project.status === 'APPROVED') {
      return errorResponse('Cannot update an approved project', 400);
    }

    // Update project
    const updatedProject = await db.project.update({
      where: { id: project.id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.clientName && { clientName: data.clientName }),
      },
    });

    return successResponse({
      project: {
        id: updatedProject.id,
        title: updatedProject.title,
        clientName: updatedProject.clientName,
        clientEmail: updatedProject.clientEmail,
        status: updatedProject.status,
        updatedAt: updatedProject.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Delete project
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    // Find project
    const project = await db.project.findFirst({
      where: {
        id: params.id,
        workspaceId: session.workspaceId,
      },
      include: {
        deliverables: true,
      },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    // Import here to avoid circular dependencies
    const { deleteFromGoogleDrive } = await import('@/lib/google-drive');

    // Delete all deliverables from Google Drive
    for (const deliverable of project.deliverables) {
      await deleteFromGoogleDrive(deliverable.driveFileId);
    }

    // Delete project (cascades to deliverables, comments, etc.)
    await db.project.delete({
      where: { id: project.id },
    });

    return successResponse({
      message: 'Project deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}