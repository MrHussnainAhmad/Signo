import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { verifyPassword } from '@/lib/password';
import { createVerificationToken } from '@/lib/tokens';
import { changeEmailSchema } from '@/lib/validation';
import { sendEmail } from '@/lib/email/transporter';
import { emailChangeVerificationTemplate } from '@/lib/email/templates';
import { config } from '@/lib/config';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  handleApiError,
  validateBody,
} from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';

// POST - Request email change
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
    const { data, error } = await validateBody(request, changeEmailSchema);
    if (error) {
      return error;
    }

    const { newEmail, password } = data;

    // Get user
    const user = await db.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return unauthorizedResponse();
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return errorResponse('Password is incorrect', 400);
    }

    // Check if email is same as current
    if (newEmail === user.email) {
      return errorResponse('New email must be different from current email', 400);
    }

    // Check if email is already in use
    const existingUser = await db.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      return errorResponse('This email is already in use', 400);
    }

    // Check if email is used by a client account
    const existingClient = await db.clientAccount.findUnique({
      where: { email: newEmail },
    });

    if (existingClient) {
      return errorResponse('This email is registered as a client account', 400);
    }

    // Create verification token
    const verificationData = createVerificationToken();

    // Store pending email change (using verification token fields)
    // We'll store the new email in a special format in the token
    const pendingToken = `${verificationData.token}:${newEmail}`;

    await db.user.update({
      where: { id: user.id },
      data: {
        verificationToken: pendingToken,
        verificationExpiry: verificationData.expiry,
      },
    });

    // Send verification email to NEW address
    const verifyUrl = `${config.appUrl}/verify-email-change?token=${verificationData.token}`;
    const emailContent = emailChangeVerificationTemplate(
      user.name,
      newEmail,
      verifyUrl
    );

    await sendEmail({
      to: newEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return successResponse({
      message: `Verification email sent to ${newEmail}. Please check your inbox.`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET - Verify email change
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return errorResponse('Verification token is required', 400);
    }

    // Find user with matching token
    const users = await db.user.findMany({
      where: {
        verificationToken: {
          startsWith: token,
        },
      },
    });

    const user = users.find((u) => u.verificationToken?.startsWith(token + ':'));

    if (!user || !user.verificationToken) {
      return errorResponse('Invalid or expired verification link', 400);
    }

    // Check if token has expired
    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      await db.user.update({
        where: { id: user.id },
        data: {
          verificationToken: null,
          verificationExpiry: null,
        },
      });
      return errorResponse('Verification link has expired', 400);
    }

    // Extract new email from token
    const [, newEmail] = user.verificationToken.split(':');

    if (!newEmail) {
      return errorResponse('Invalid verification token', 400);
    }

    // Update email
    await db.user.update({
      where: { id: user.id },
      data: {
        email: newEmail,
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    return successResponse({
      message: 'Email changed successfully',
      newEmail,
    });
  } catch (error) {
    return handleApiError(error);
  }
}