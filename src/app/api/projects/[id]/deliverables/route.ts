export const runtime = "nodejs";

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import {
  uploadToGoogleDrive,
  deleteFromGoogleDrive,
  isAllowedFileType,
  isFileSizeAllowed,
  MAX_FILE_SIZE,
  getResumableUploadUrl,
  verifyFileInProject,
  getFileMetadata,
  findLatestFileInProject,
} from '@/lib/google-drive';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
  validateBody,
} from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';
import { getWorkspaceStorageUsage, getPlanLimits, formatBytes } from '@/lib/storage';
import { z } from 'zod';

interface RouteParams {
  params: { id: string };
}

const initUploadSchema = z.object({
  action: z.literal('init'),
  fileName: z.string(),
  mimeType: z.string(),
  fileSize: z.number(),
});

const finalizeUploadSchema = z.object({
  action: z.literal('finalize'),
  fileId: z.string().optional(),
  fileName: z.string(),
});

// GET - List deliverables
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
        deliverables: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    return successResponse({
      deliverables: project.deliverables.map((d) => ({
        id: d.id,
        fileName: d.fileName,
        mimeType: d.mimeType,
        fileSize: d.fileSize,
        webViewLink: d.webViewLink,
        downloadLink: d.downloadLink,
        versionNumber: d.versionNumber,
        createdAt: d.createdAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Handle Upload (Init & Finalize)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Rate limiting
    const rateLimitResult = checkRateLimit(request, 'upload');
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const action = body.action;

    // Find project
    const project = await db.project.findFirst({
      where: {
        id: params.id,
        workspaceId: session.workspaceId,
      },
      include: {
        workspace: {
          select: {
            plan: true,
          },
        },
      },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    if (project.status === 'APPROVED') {
      return forbiddenResponse('Cannot upload to an approved project');
    }

    // --- Action: Init ---
    if (action === 'init') {
      const result = initUploadSchema.safeParse(body);
      if (!result.success) return errorResponse('Invalid init parameters', 400);
      const { fileName, mimeType, fileSize } = result.data;

      // Validate type
      if (!isAllowedFileType(mimeType)) {
        return errorResponse(
          'File type not allowed. Supported: images, PDFs, documents, videos, audio, and archives.',
          400
        );
      }

      // Validate limits
      const limits = getPlanLimits(project.workspace.plan);
      if (fileSize > limits.maxFileSize) {
        return errorResponse(
          `File is larger than ${formatBytes(limits.maxFileSize)}, please choose a smaller file or upgrade plan`,
          400
        );
      }

      const currentUsage = await getWorkspaceStorageUsage(session.workspaceId);
      if (currentUsage + fileSize > limits.maxStorage) {
        return errorResponse(
          'Storage full. Please delete approved projects or upgrade to other plan.',
          400
        );
      }

      // Get resumable upload URL
      const uploadUrl = await getResumableUploadUrl({
        fileName,
        mimeType,
        projectId: project.id,
      });

      return successResponse({ uploadUrl });
    }

    // --- Action: Finalize ---
    if (action === 'finalize') {
      const result = finalizeUploadSchema.safeParse(body);
      if (!result.success) return errorResponse('Invalid finalize parameters', 400);
      const { fileId, fileName } = result.data;

      let metadata: any = null;

      if (fileId) {
        // Standard flow: Client sent fileId
        // Verify file ownership/location
        const isValid = await verifyFileInProject(fileId, project.id);
        if (!isValid) {
          return forbiddenResponse('Invalid file or location');
        }
        metadata = await getFileMetadata(fileId);
      } else {
        // Recovery flow: Client lost fileId (e.g. CORS error), find file by name
        // Add a small delay to allow Drive indexing to catch up
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // This is safe because verifyFileInProject logic is inherent in findLatestFileInProject (checks parent folder)
        metadata = await findLatestFileInProject(project.id, fileName);
      }

      if (!metadata) {
        return errorResponse('File not found in Drive. Upload may have failed.', 404);
      }

      // Versioning
      const latestDeliverable = await db.deliverable.findFirst({
        where: {
          projectId: project.id,
          fileName: metadata.name || fileName,
        },
        orderBy: {
          versionNumber: 'desc',
        },
      });
      const versionNumber = latestDeliverable ? latestDeliverable.versionNumber + 1 : 1;

      // Create Record
      const deliverable = await db.deliverable.create({
        data: {
          projectId: project.id,
          driveFileId: metadata.id!,
          webViewLink: metadata.webViewLink || '',
          downloadLink: metadata.webContentLink || '',
          fileName: metadata.name || fileName,
          mimeType: metadata.mimeType || 'application/octet-stream',
          fileSize: parseInt(metadata.size || '0', 10),
          versionNumber,
        },
      });

      if (project.status === 'CHANGES_REQUESTED') {
        await db.project.update({
          where: { id: project.id },
          data: { status: 'WAITING_FOR_CLIENT' },
        });
      }

      return successResponse({
        deliverable: {
          id: deliverable.id,
          fileName: deliverable.fileName,
          mimeType: deliverable.mimeType,
          fileSize: deliverable.fileSize,
          webViewLink: deliverable.webViewLink,
          versionNumber: deliverable.versionNumber,
          createdAt: deliverable.createdAt,
        },
        message: 'File uploaded successfully',
      });
    }

    return errorResponse('Invalid action', 400);

  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Delete deliverable
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const deliverableId = searchParams.get('deliverableId');

    if (!deliverableId) {
      return errorResponse('Deliverable ID is required', 400);
    }

    // Find project and deliverable
    const project = await db.project.findFirst({
      where: {
        id: params.id,
        workspaceId: session.workspaceId,
      },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    // Cannot delete from approved projects
    if (project.status === 'APPROVED') {
      return forbiddenResponse('Cannot delete from an approved project');
    }

    const deliverable = await db.deliverable.findFirst({
      where: {
        id: deliverableId,
        projectId: project.id,
      },
    });

    if (!deliverable) {
      return notFoundResponse('Deliverable not found');
    }

    // Delete from Google Drive
    await deleteFromGoogleDrive(deliverable.driveFileId);

    // Delete from database
    await db.deliverable.delete({
      where: { id: deliverable.id },
    });

    return successResponse({
      message: 'Deliverable deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}