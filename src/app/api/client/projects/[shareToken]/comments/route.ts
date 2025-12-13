import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { createCommentSchema } from '@/lib/validation';
import { sendEmail } from '@/lib/email/transporter';
import { clientCommentNotificationTemplate } from '@/lib/email/templates';
import { config } from '@/lib/config';
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
  params: { shareToken: string };
}

// GET - Get comments for project
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'client') {
      return unauthorizedResponse('Please log in to view comments');
    }

    // Find project
    const project = await db.project.findUnique({
      where: { shareToken: params.shareToken },
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

    // Verify client owns this project
    const client = await db.clientAccount.findUnique({
      where: { id: session.userId },
    });

    if (!client || client.email !== project.clientEmail) {
      return forbiddenResponse('You do not have access to this project');
    }

    return successResponse({
      comments: project.comments.map((c) => ({
        id: c.id,
        authorType: c.authorType,
        authorName: c.authorName,
        body: c.body,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Add comment (Client side)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'client') {
      return unauthorizedResponse('Please log in to comment');
    }

    // Validate request body
    const { data, error } = await validateBody(request, createCommentSchema);
    if (error) {
      return error;
    }

    // Find project
    const project = await db.project.findUnique({
      where: { shareToken: params.shareToken },
      include: {
        workspace: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    // Verify client owns this project
    const client = await db.clientAccount.findUnique({
      where: { id: session.userId },
    });

    if (!client || client.email !== project.clientEmail) {
      return forbiddenResponse('You do not have access to this project');
    }

    // Cannot comment on approved projects
    if (project.status === 'APPROVED') {
      return forbiddenResponse('Cannot comment on an approved project');
    }

    // Create comment
    const comment = await db.comment.create({
      data: {
        projectId: project.id,
        authorType: 'CLIENT',
        authorName: client.name,
        authorEmail: client.email,
        body: data.body,
      },
    });

    // Notify team members
    const projectUrl = `${config.appUrl}/app/projects/${project.id}`;
    
    for (const member of project.workspace.members) {
      const emailContent = clientCommentNotificationTemplate(
        member.user.name,
        client.name,
        project.title,
        data.body,
        projectUrl
      );

      await sendEmail({
        to: member.user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    }

    return successResponse(
      {
        comment: {
          id: comment.id,
          authorType: comment.authorType,
          authorName: comment.authorName,
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