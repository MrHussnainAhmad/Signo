import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { deleteFromGoogleDrive } from '@/lib/google-drive';
import {
  successResponse,
  unauthorizedResponse,
  handleApiError,
  forbiddenResponse,
} from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    const workspace = await db.workspace.findUnique({
      where: { id: session.workspaceId },
    });

    if (!workspace) {
      return unauthorizedResponse();
    }

    // Only owner can trigger manual cleanup (simplifies logic for Solo/Studio/Business)
    if (workspace.ownerId !== session.userId) {
      return forbiddenResponse('Only the workspace owner can delete project data');
    }

    // Find all APPROVED projects with active data
    const approvedProjects = await db.project.findMany({
      where: {
        workspaceId: session.workspaceId,
        status: 'APPROVED',
        dataDeletedAt: null,
      },
      include: {
        deliverables: true,
      },
    });

    let deletedCount = 0;
    let freedSpace = 0;

    for (const project of approvedProjects) {
      if (project.deliverables.length > 0) {
        // Calculate space freed
        const projectSize = project.deliverables.reduce((acc, d) => acc + (d.fileSize || 0), 0);
        freedSpace += projectSize;

        // Delete from Drive
        await Promise.all(
          project.deliverables.map((d) => deleteFromGoogleDrive(d.driveFileId))
        );

        // Delete from DB
        await db.deliverable.deleteMany({
          where: { projectId: project.id },
        });
      }

      // Mark as deleted
      await db.project.update({
        where: { id: project.id },
        data: { dataDeletedAt: new Date() },
      });
      deletedCount++;
    }

    return successResponse({
      message: `Successfully deleted data for ${deletedCount} projects`,
      deletedCount,
      freedSpace,
    });
  } catch (error) {
    return handleApiError(error);
  }
}