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
} from '@/lib/google-drive';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
} from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';

interface RouteParams {
  params: { id: string };
}

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

// POST - Upload deliverable
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

    // Find project
    const project = await db.project.findFirst({
      where: {
        id: params.id,
        workspaceId: session.workspaceId,
      },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    // Cannot upload to approved projects
    if (project.status === 'APPROVED') {
      return forbiddenResponse('Cannot upload to an approved project');
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    // Validate file type
    if (!isAllowedFileType(file.type)) {
      return errorResponse(
        'File type not allowed. Supported: images, PDFs, documents, videos, audio, and archives.',
        400
      );
    }

    // Validate file size
    if (!isFileSizeAllowed(file.size)) {
      return errorResponse(
        `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        400
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Google Drive
    const uploadedFile = await uploadToGoogleDrive({
      fileName: file.name,
      mimeType: file.type,
      buffer,
      projectId: project.id,
    });

    // Get current version number
    const latestDeliverable = await db.deliverable.findFirst({
      where: {
        projectId: project.id,
        fileName: file.name,
      },
      orderBy: {
        versionNumber: 'desc',
      },
    });

    const versionNumber = latestDeliverable ? latestDeliverable.versionNumber + 1 : 1;

    // Save deliverable to database
    const deliverable = await db.deliverable.create({
      data: {
        projectId: project.id,
        driveFileId: uploadedFile.driveFileId,
        webViewLink: uploadedFile.webViewLink,
        downloadLink: uploadedFile.downloadLink,
        fileName: uploadedFile.fileName,
        mimeType: uploadedFile.mimeType,
        fileSize: uploadedFile.fileSize,
        versionNumber,
      },
    });

    // Update project status if it was waiting for client
    if (project.status === 'CHANGES_REQUESTED') {
      await db.project.update({
        where: { id: project.id },
        data: { status: 'WAITING_FOR_CLIENT' },
      });
    }

    return successResponse(
      {
        deliverable: {
          id: deliverable.id,
          fileName: deliverable.fileName,
          mimeType: deliverable.mimeType,
          fileSize: deliverable.fileSize,
          webViewLink: deliverable.webViewLink,
          downloadLink: deliverable.downloadLink,
          versionNumber: deliverable.versionNumber,
          createdAt: deliverable.createdAt,
        },
        message: 'File uploaded successfully',
      },
      201
    );
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