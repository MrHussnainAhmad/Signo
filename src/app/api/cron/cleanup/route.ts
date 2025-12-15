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

    // 1. Fetch all APPROVED projects with active data
    const approvedProjects = await db.project.findMany({
      where: {
        status: 'APPROVED',
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
        approvalEvents: {
          where: {
            eventType: 'APPROVED',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        deliverables: true,
      },
    });

    let warnedCount = 0;
    let deletedCount = 0;

    for (const project of approvedProjects) {
      // Determine approval date
      const approvalDate = project.approvalEvents[0]?.createdAt || project.updatedAt; // Fallback to updatedAt if event missing
      
      // Determine retention period based on plan
      const plan = project.workspace.plan;
      let retentionDays = 90; // Default 3 months
      if (plan === 'SOLO') {
        retentionDays = 30; // 1 month
      }

      const deleteDate = new Date(approvalDate);
      deleteDate.setDate(deleteDate.getDate() + retentionDays);

      const warningDate = new Date(deleteDate);
      warningDate.setDate(warningDate.getDate() - 7);

      const now = new Date();

      // Check for Deletion
      if (now >= deleteDate) {
        // Delete files from Drive
        if (project.deliverables.length > 0) {
          await Promise.all(
            project.deliverables.map((d) => deleteFromGoogleDrive(d.driveFileId))
          );

          await db.deliverable.deleteMany({
            where: { projectId: project.id },
          });
        }

        await db.project.update({
          where: { id: project.id },
          data: { dataDeletedAt: new Date() },
        });
        deletedCount++;
        continue; // Skip warning check if deleted
      }

      // Check for Warning
      if (now >= warningDate && !project.retentionWarningSentAt) {
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