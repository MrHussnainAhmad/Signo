import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { sendEmail } from '@/lib/email/transporter';
import { changesRequestedTemplate } from '@/lib/email/templates';
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

const requestChangesSchema = z.object({
  note: z
    .string()
    .max(2000, 'Note must be less than 2000 characters')
    .optional(),
});

// POST - Request changes
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'client') {
      return unauthorizedResponse('Please log in to request changes');
    }

    // Validate request body
    const { data, error } = await validateBody(request, requestChangesSchema);
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

    // Check if project can have changes requested
    if (project.status === 'APPROVED') {
      return errorResponse('Cannot request changes on an approved project', 400);
    }

    // Update project status
    await db.project.update({
      where: { id: project.id },
      data: { status: 'CHANGES_REQUESTED' },
    });

    // Create approval event
    await db.approvalEvent.create({
      data: {
        projectId: project.id,
        eventType: 'CHANGES_REQUESTED',
        clientEmail: client.email,
        clientName: client.name,
        note: data.note,
      },
    });

    // If a note was provided, also add it as a comment
    if (data.note) {
      await db.comment.create({
        data: {
          projectId: project.id,
          authorType: 'CLIENT',
          authorName: client.name,
          authorEmail: client.email,
          body: `📝 Change request: ${data.note}`,
        },
      });
    }

    // Notify team members
    const projectUrl = `${config.appUrl}/app/projects/${project.id}`;

    for (const member of project.workspace.members) {
      const emailContent = changesRequestedTemplate(
        member.user.name,
        client.name,
        project.title,
        data.note,
        projectUrl
      );

      await sendEmail({
        to: member.user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    }

    return successResponse({
      message: 'Changes requested successfully',
      project: {
        id: project.id,
        title: project.title,
        status: 'CHANGES_REQUESTED',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}