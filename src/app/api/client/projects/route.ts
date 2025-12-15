import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import {
  successResponse,
  unauthorizedResponse,
  handleApiError,
} from '@/lib/api-response';
import { config } from '@/lib/config';

export const dynamic = 'force-dynamic';

// GET - List projects for logged-in client
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'client') {
      return unauthorizedResponse();
    }

    // Find client to get email
    const client = await db.clientAccount.findUnique({
      where: { id: session.userId },
    });

    if (!client) {
      return unauthorizedResponse();
    }

    // Find projects for this client email
    const projects = await db.project.findMany({
      where: {
        clientEmail: client.email,
        status: { not: 'DELETED' }, // Exclude deleted
      },
      select: {
        id: true,
        title: true,
        status: true,
        shareToken: true,
        createdAt: true,
        workspace: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return successResponse({
      projects: projects.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        shareToken: p.shareToken,
        shareUrl: `${config.appUrl}/p/${p.shareToken}`,
        workspaceName: p.workspace.name,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}