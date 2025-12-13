import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifyEmailSchema } from '@/lib/validation';
import { sendEmail } from '@/lib/email/transporter';
import { welcomeEmailTemplate } from '@/lib/email/templates';
import { config } from '@/lib/config';
import {
  successResponse,
  errorResponse,
  handleApiError,
  validateBody,
} from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const { data, error } = await validateBody(request, verifyEmailSchema);
    if (error) {
      return error;
    }

    const { token } = data;

    // Find user with this verification token
    const user = await db.user.findFirst({
      where: {
        verificationToken: token,
        emailVerified: false,
      },
    });

    if (!user) {
      return errorResponse('Invalid or expired verification link', 400);
    }

    // Check if token has expired
    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      return errorResponse(
        'Verification link has expired. Please request a new one.',
        400
      );
    }

    // Update user as verified
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    // Send welcome email with plan advice
    const loginUrl = `${config.appUrl}/login`;
    const emailContent = welcomeEmailTemplate(user.name, loginUrl);

    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return successResponse({
      message: 'Email verified successfully. You can now log in.',
      verified: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET endpoint for direct link verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return errorResponse('Verification token is required', 400);
    }

    // Find user with this verification token
    const user = await db.user.findFirst({
      where: {
        verificationToken: token,
        emailVerified: false,
      },
    });

    if (!user) {
      return errorResponse('Invalid or expired verification link', 400);
    }

    // Check if token has expired
    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      return errorResponse(
        'Verification link has expired. Please request a new one.',
        400
      );
    }

    // Update user as verified
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    // Send welcome email
    const loginUrl = `${config.appUrl}/login`;
    const emailContent = welcomeEmailTemplate(user.name, loginUrl);

    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return successResponse({
      message: 'Email verified successfully. You can now log in.',
      verified: true,
      redirectTo: '/login?verified=true',
    });
  } catch (error) {
    return handleApiError(error);
  }
}