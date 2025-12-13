import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { updateProfileSchema } from '@/lib/validation';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  handleApiError,
  validateBody,
} from '@/lib/api-response';

// GET - Get profile
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return unauthorizedResponse();
    }

    return successResponse({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH - Update profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    // Validate request body
    const { data, error } = await validateBody(request, updateProfileSchema);
    if (error) {
      return error;
    }

    // Check if there's anything to update
    if (!data.name) {
      return errorResponse('No fields to update', 400);
    }

    // Update user
    const user = await db.user.update({
      where: { id: session.userId },
      data: {
        ...(data.name && { name: data.name }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        emailVerified: true,
        updatedAt: true,
      },
    });

    return successResponse({
      user,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}