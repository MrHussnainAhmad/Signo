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

    // Find all APPROVED projects with active data (or stuck data)
    const approvedProjects = await db.project.findMany({
      where: {
        workspaceId: session.workspaceId,
        status: 'APPROVED',
      },
      include: {
        deliverables: true,
      },
    });

    // Debug: count all projects
    const totalProjects = await db.project.count({
      where: {
        workspaceId: session.workspaceId,
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

        // Mark as deleted (or update timestamp)
        await db.project.update({
          where: { id: project.id },
          data: { dataDeletedAt: new Date() },
        });
        deletedCount++;
      } else {
        // If no deliverables but not marked as deleted, mark it now
        if (!project.dataDeletedAt) {
           await db.project.update({
            where: { id: project.id },
            data: { dataDeletedAt: new Date() },
          });
        }
      }
    }

    return successResponse({
      message: `Successfully deleted data for ${deletedCount} projects`,
      deletedCount,
      freedSpace,
      totalFound: approvedProjects.length,
      totalProjects,
      projectIds: approvedProjects.map(p => p.id),
    });
  } catch (error) {
    return handleApiError(error);
  }
}