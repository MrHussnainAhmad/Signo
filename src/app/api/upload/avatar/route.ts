import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import {
  uploadAvatar,
  isValidImageFile,
  isImageSizeAllowed,
  MAX_IMAGE_SIZE,
} from '@/lib/cloudinary';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  handleApiError,
} from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';

// POST - Upload avatar
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
    const result = await uploadAvatar(buffer, session.userId);

    // Update user avatar URL
    const user = await db.user.update({
      where: { id: session.userId },
      data: { avatarUrl: result.secureUrl },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    return successResponse({
      user,
      message: 'Avatar uploaded successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Remove avatar
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    // Get user
    const user = await db.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return unauthorizedResponse();
    }

    if (!user.avatarUrl) {
      return errorResponse('No avatar to remove', 400);
    }

    // Remove avatar URL from user
    // Note: We could also delete from Cloudinary, but keeping for potential recovery
    const updatedUser = await db.user.update({
      where: { id: session.userId },
      data: { avatarUrl: null },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
    });

    return successResponse({
      user: updatedUser,
      message: 'Avatar removed successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}