import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import {
  uploadLogo,
  isValidImageFile,
  isImageSizeAllowed,
  MAX_IMAGE_SIZE,
} from '@/lib/cloudinary';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  handleApiError,
} from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';

// POST - Upload workspace logo
export async function POST(request: NextRequest) {
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

    // Get workspace and verify ownership
    const workspace = await db.workspace.findUnique({
      where: { id: session.workspaceId },
    });

    if (!workspace) {
      return errorResponse('Workspace not found', 404);
    }

    // Only owner can update logo
    if (workspace.ownerId !== session.userId) {
      return forbiddenResponse('Only the workspace owner can update the logo');
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    // Validate file type
    if (!isValidImageFile(file.type)) {
      return errorResponse(
        'Invalid file type. Allowed: JPG, PNG, GIF, WebP',
        400
      );
    }

    // Validate file size
    if (!isImageSizeAllowed(file.size)) {
      return errorResponse(
        `File too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
        400
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result = await uploadLogo(buffer, workspace.id);

    // Update workspace logo URL
    const updatedWorkspace = await db.workspace.update({
      where: { id: workspace.id },
      data: { logoUrl: result.secureUrl },
      select: {
        id: true,
        name: true,
        logoUrl: true,
      },
    });

    return successResponse({
      workspace: updatedWorkspace,
      message: 'Logo uploaded successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Remove workspace logo
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    // Get workspace and verify ownership
    const workspace = await db.workspace.findUnique({
      where: { id: session.workspaceId },
    });

    if (!workspace) {
      return errorResponse('Workspace not found', 404);
    }

    // Only owner can remove logo
    if (workspace.ownerId !== session.userId) {
      return forbiddenResponse('Only the workspace owner can remove the logo');
    }

    if (!workspace.logoUrl) {
      return errorResponse('No logo to remove', 400);
    }

    // Remove logo URL from workspace
    const updatedWorkspace = await db.workspace.update({
      where: { id: workspace.id },
      data: { logoUrl: null },
      select: {
        id: true,
        name: true,
        logoUrl: true,
      },
    });

    return successResponse({
      workspace: updatedWorkspace,
      message: 'Logo removed successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}