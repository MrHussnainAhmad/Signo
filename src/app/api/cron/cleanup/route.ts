import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email/transporter';
import { dataRetentionWarningTemplate } from '@/lib/email/templates';
import { deleteFromGoogleDrive } from '@/lib/google-drive';
import { successResponse, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Basic security: Check for CRON_SECRET if it's set
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    // 1. Send Warnings (7 days before deletion)
    // Policy: Delete after 60 days (2 months). Warn at 53 days.
    const warningThreshold = new Date();
    warningThreshold.setDate(warningThreshold.getDate() - 53);

    const projectsToWarn = await db.project.findMany({
      where: {
        createdAt: { lte: warningThreshold },
        retentionWarningSentAt: null,
        dataDeletedAt: null,
      },
      include: {
        workspace: {
          include: {
            owner: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    let warnedCount = 0;
    for (const project of projectsToWarn) {
      const deleteDate = new Date(project.createdAt);
      deleteDate.setDate(deleteDate.getDate() + 60);

      const emailContent = dataRetentionWarningTemplate(
        project.workspace.owner.name,
        project.title,
        deleteDate.toLocaleDateString()
      );

      const sent = await sendEmail({
        to: project.workspace.owner.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      if (sent) {
        await db.project.update({
          where: { id: project.id },
          data: { retentionWarningSentAt: new Date() },
        });
        warnedCount++;
      }
    }

    // 2. Delete Data (After 60 days)
    const deleteThreshold = new Date();
    deleteThreshold.setDate(deleteThreshold.getDate() - 60);

    const projectsToDelete = await db.project.findMany({
      where: {
        createdAt: { lte: deleteThreshold },
        dataDeletedAt: null,
      },
      include: {
        deliverables: true,
      },
    });

    let deletedCount = 0;
    for (const project of projectsToDelete) {
      // Delete files from Drive
      if (project.deliverables.length > 0) {
        // Parallel deletion for speed
        await Promise.all(
          project.deliverables.map((d) => deleteFromGoogleDrive(d.driveFileId))
        );

        // Delete deliverable records from DB
        await db.deliverable.deleteMany({
          where: { projectId: project.id },
        });
      }

      // Mark project as data deleted
      await db.project.update({
        where: { id: project.id },
        data: { dataDeletedAt: new Date() },
      });
      deletedCount++;
    }

    return successResponse({
      warned: warnedCount,
      deleted: deletedCount,
      message: 'Cleanup job completed successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}