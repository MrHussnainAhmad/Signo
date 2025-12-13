import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { createProjectSchema } from '@/lib/validation';
import { generateShareToken } from '@/lib/tokens';
import { sendEmail } from '@/lib/email/transporter';
import { projectCreatedTemplate, clientProjectInviteTemplate } from '@/lib/email/templates';
import { config } from '@/lib/config';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  handleApiError,
  validateBody,
} from '@/lib/api-response';

// GET - List all projects
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build filter
    const where: Record<string, unknown> = {
      workspaceId: session.workspaceId,
    };

    if (status && ['WAITING_FOR_CLIENT', 'CHANGES_REQUESTED', 'APPROVED'].includes(status)) {
      where.status = status;
    }

    // Get projects with counts
    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        include: {
          _count: {
            select: {
              deliverables: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      db.project.count({ where }),
    ]);

    return successResponse({
      projects: projects.map((p) => ({
        id: p.id,
        title: p.title,
        clientName: p.clientName,
        clientEmail: p.clientEmail,
        status: p.status,
        shareToken: p.shareToken,
        shareUrl: `${config.appUrl}/p/${p.shareToken}`,
        deliverableCount: p._count.deliverables,
        commentCount: p._count.comments,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    // Validate request body
    const { data, error } = await validateBody(request, createProjectSchema);
    if (error) {
      return error;
    }

    const { title, clientName, clientEmail } = data;

    // Get workspace and verify plan
    const workspace = await db.workspace.findUnique({
      where: { id: session.workspaceId },
      include: {
        owner: true,
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
    });

    if (!workspace) {
      return errorResponse('Workspace not found', 404);
    }

    // Check if workspace has a paid plan
    if (workspace.plan === 'UNPAID') {
      return forbiddenResponse('Please purchase a plan to create projects');
    }

    // Generate unique share token
    let shareToken = generateShareToken();
    
    // Ensure token is unique
    let tokenExists = await db.project.findUnique({ where: { shareToken } });
    while (tokenExists) {
      shareToken = generateShareToken();
      tokenExists = await db.project.findUnique({ where: { shareToken } });
    }

    // Create project
    const project = await db.project.create({
      data: {
        workspaceId: workspace.id,
        title,
        clientName,
        clientEmail: clientEmail.toLowerCase(),
        shareToken,
        status: 'WAITING_FOR_CLIENT',
      },
    });

    const projectUrl = `${config.appUrl}/app/projects/${project.id}`;
    const clientUrl = `${config.appUrl}/p/${shareToken}`;

    // Notify all team members about new project
    for (const member of workspace.members) {
      const emailContent = projectCreatedTemplate(
        member.user.name,
        title,
        clientName,
        clientEmail,
        projectUrl
      );

      await sendEmail({
        to: member.user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    }

    // Send invite email to client
    const clientEmailContent = clientProjectInviteTemplate(
      clientName,
      title,
      workspace.name,
      clientUrl
    );

    await sendEmail({
      to: clientEmail,
      subject: clientEmailContent.subject,
      html: clientEmailContent.html,
      text: clientEmailContent.text,
    });

    return successResponse(
      {
        project: {
          id: project.id,
          title: project.title,
          clientName: project.clientName,
          clientEmail: project.clientEmail,
          status: project.status,
          shareToken: project.shareToken,
          shareUrl: clientUrl,
          createdAt: project.createdAt,
        },
        message: 'Project created successfully. Client has been notified.',
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}