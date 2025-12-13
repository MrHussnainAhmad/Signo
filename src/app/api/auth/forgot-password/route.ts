import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { forgotPasswordSchema } from '@/lib/validation';
import { createResetToken } from '@/lib/tokens';
import { sendEmail } from '@/lib/email/transporter';
import { passwordResetTemplate } from '@/lib/email/templates';
import { config } from '@/lib/config';
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
    const { data, error } = await validateBody(request, forgotPasswordSchema);
    if (error) {
      return error;
    }

    const { email } = data;

    // Always return success to prevent email enumeration
    const successMessage =
      'If an account exists with this email, you will receive a password reset link.';

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user doesn't exist (security)
      return successResponse({
        message: successMessage,
      });
    }

    // Check if user is verified
    if (!user.emailVerified) {
      // Return success but don't send email (security)
      return successResponse({
        message: successMessage,
      });
    }

    // Create reset token
    const resetData = createResetToken();

    // Update user with reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetData.token,
        resetTokenExpiry: resetData.expiry,
      },
    });

    // Send password reset email
    const resetUrl = `${config.appUrl}/reset-password?token=${resetData.token}`;
    const emailContent = passwordResetTemplate(user.name, resetUrl);

    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return successResponse({
      message: successMessage,
    });
  } catch (error) {
    return handleApiError(error);
  }
}