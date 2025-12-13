import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { createVerificationToken } from '@/lib/tokens';
import { sendEmail } from '@/lib/email/transporter';
import { emailVerificationTemplate } from '@/lib/email/templates';
import { config } from '@/lib/config';
import { z } from 'zod';
import {
  successResponse,
  errorResponse,
  handleApiError,
  validateBody,
} from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';

const resendSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - stricter for this endpoint
    const rateLimitResult = checkRateLimit(request, 'auth');
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Validate request body
    const { data, error } = await validateBody(request, resendSchema);
    if (error) {
      return error;
    }

    const { email } = data;

    // Generic success message to prevent email enumeration
    const successMessage = 'If an unverified account exists with this email, a new verification link has been sent.';

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return successResponse({ message: successMessage });
    }

    // Check if already verified
    if (user.emailVerified) {
      return successResponse({ message: successMessage });
    }

    // Check if we recently sent a verification email (within last 2 minutes)
    if (user.verificationExpiry) {
      const tokenCreatedAt = new Date(user.verificationExpiry.getTime() - config.verificationTokenExpiry);
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      
      if (tokenCreatedAt > twoMinutesAgo) {
        return errorResponse(
          'A verification email was recently sent. Please wait a few minutes before requesting another.',
          429
        );
      }
    }

    // Create new verification token
    const verificationData = createVerificationToken();

    // Update user with new token
    await db.user.update({
      where: { id: user.id },
      data: {
        verificationToken: verificationData.token,
        verificationExpiry: verificationData.expiry,
      },
    });

    // Send verification email
    const verifyUrl = `${config.appUrl}/verify-email?token=${verificationData.token}`;
    const emailContent = emailVerificationTemplate(user.name, verifyUrl);

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