import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { resetPasswordSchema } from '@/lib/validation';
import {
  successResponse,
  errorResponse,
  handleApiError,
  validateBody,
} from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = checkRateLimit(request, 'auth');
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Validate request body
    const { data, error } = await validateBody(request, resetPasswordSchema);
    if (error) {
      return error;
    }

    const { token, password } = data;

    // Find user with this reset token
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
      },
    });

    if (!user) {
      return errorResponse('Invalid or expired reset link', 400);
    }

    // Check if token has expired
    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      // Clear expired token
      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return errorResponse(
        'Reset link has expired. Please request a new one.',
        400
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password and clear reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return successResponse({
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET endpoint to verify token is valid
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return errorResponse('Reset token is required', 400);
    }

    // Find user with this reset token
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
      },
    });

    if (!user) {
      return errorResponse('Invalid or expired reset link', 400);
    }

    // Check if token has expired
    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      return errorResponse('Reset link has expired. Please request a new one.', 400);
    }

    return successResponse({
      valid: true,
      email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
    });
  } catch (error) {
    return handleApiError(error);
  }
}