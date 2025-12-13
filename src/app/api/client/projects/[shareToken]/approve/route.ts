import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { sendEmail } from '@/lib/email/transporter';
import { clientApprovalTemplate } from '@/lib/email/templates';
import { config } from '@/lib/config';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
} from '@/lib/api-response';

interface RouteParams {
  params: { shareToken: string };
}

// POST - Approve project
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'client') {
      return unauthorizedResponse('Please log in to approve this project');
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
        deliverables: true,
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

    // Check if project can be approved
    if (project.status === 'APPROVED') {
      return errorResponse('This project has already been approved', 400);
    }

    // Check if there are deliverables to approve
    if (project.deliverables.length === 0) {
      return errorResponse('Cannot approve a project with no deliverables', 400);
    }

    // Update project status
    await db.project.update({
      where: { id: project.id },
      data: { status: 'APPROVED' },
    });

    // Create approval event
    await db.approvalEvent.create({
      data: {
        projectId: project.id,
        eventType: 'APPROVED',
        clientEmail: client.email,
        clientName: client.name,
      },
    });

    // Notify team members
    const projectUrl = `${config.appUrl}/app/projects/${project.id}`;

    for (const member of project.workspace.members) {
      const emailContent = clientApprovalTemplate(
        member.user.name,
        client.name,
        project.title,
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
      message: 'Project approved successfully',
      project: {
        id: project.id,
        title: project.title,
        status: 'APPROVED',
      },
      reviewUrl: `/p/${params.shareToken}/review`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}