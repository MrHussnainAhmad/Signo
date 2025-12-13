import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { createVerificationToken } from '@/lib/tokens';
import { signupSchema } from '@/lib/validation';
import { sendEmail } from '@/lib/email/transporter';
import { emailVerificationTemplate } from '@/lib/email/templates';
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
    const { data, error } = await validateBody(request, signupSchema);
    if (error) {
      return error;
    }

    const { name, email, password } = data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse('An account with this email already exists', 400);
    }

    // Check if email is used by a client account
    const existingClient = await db.clientAccount.findUnique({
      where: { email },
    });

    if (existingClient) {
      return errorResponse(
        'This email is registered as a client account. Please use a different email.',
        400
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create verification token
    const verificationData = createVerificationToken();

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken: verificationData.token,
        verificationExpiry: verificationData.expiry,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Create default workspace for the user
    const workspace = await db.workspace.create({
      data: {
        name: `${name}'s Workspace`,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    });

    // Send verification email
    const verifyUrl = `${config.appUrl}/verify-email?token=${verificationData.token}`;
    const emailContent = emailVerificationTemplate(name, verifyUrl);

    await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return successResponse(
      {
        user,
        workspace: {
          id: workspace.id,
          name: workspace.name,
        },
        message: 'Account created successfully. Please check your email to verify your account.',
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}