import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { createCommentSchema } from '@/lib/validation';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
  validateBody,
} from '@/lib/api-response';

interface RouteParams {
  params: { id: string };
}

// GET - List comments
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
        comments: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    return successResponse({
      comments: project.comments.map((c) => ({
        id: c.id,
        authorType: c.authorType,
        authorName: c.authorName,
        authorEmail: c.authorEmail,
        body: c.body,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Add comment (Team side)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    // Validate request body
    const { data, error } = await validateBody(request, createCommentSchema);
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

    // Cannot comment on approved projects
    if (project.status === 'APPROVED') {
      return forbiddenResponse('Cannot comment on an approved project');
    }

    // Get user info
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      return unauthorizedResponse();
    }

    // Create comment
    const comment = await db.comment.create({
      data: {
        projectId: project.id,
        authorType: 'TEAM',
        authorId: user.id,
        authorName: user.name,
        authorEmail: user.email,
        body: data.body,
      },
    });

    return successResponse(
      {
        comment: {
          id: comment.id,
          authorType: comment.authorType,
          authorName: comment.authorName,
          authorEmail: comment.authorEmail,
          body: comment.body,
          createdAt: comment.createdAt,
        },
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Delete comment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return errorResponse('Comment ID is required', 400);
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

    // Find comment
    const comment = await db.comment.findFirst({
      where: {
        id: commentId,
        projectId: project.id,
        authorType: 'TEAM',
        authorId: session.userId,
      },
    });

    if (!comment) {
      return notFoundResponse('Comment not found or you cannot delete it');
    }

    // Delete comment
    await db.comment.delete({
      where: { id: comment.id },
    });

    return successResponse({
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}