import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { hashPassword, verifyPassword } from '@/lib/password';
import { changePasswordSchema } from '@/lib/validation';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  handleApiError,
  validateBody,
} from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';

// POST - Change password
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = checkRateLimit(request, 'auth');
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    // Validate request body
    const { data, error } = await validateBody(request, changePasswordSchema);
    if (error) {
      return error;
    }

    const { currentPassword, newPassword } = data;

    // Get user with password
    const user = await db.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return unauthorizedResponse();
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password);

    if (!isValidPassword) {
      return errorResponse('Current password is incorrect', 400);
    }

    // Check if new password is same as current
    const isSamePassword = await verifyPassword(newPassword, user.password);

    if (isSamePassword) {
      return errorResponse('New password must be different from current password', 400);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return successResponse({
      message: 'Password changed successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}