import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { createVerificationToken } from '@/lib/tokens';
import { clientSignupSchema } from '@/lib/validation';
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
    const { data, error } = await validateBody(request, clientSignupSchema);
    if (error) {
      return error;
    }

    const { name, email, password } = data;

    // Check if client account already exists
    const existingClient = await db.clientAccount.findUnique({
      where: { email },
    });

    if (existingClient) {
      return errorResponse('An account with this email already exists', 400);
    }

    // Check if email is used by a team account
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse(
        'This email is registered as a team account. Please use a different email or log in as a team member.',
        400
      );
    }

    // Check if there are any projects for this client email
    const projectsForClient = await db.project.findMany({
      where: { clientEmail: email },
    });

    if (projectsForClient.length === 0) {
      return errorResponse(
        'No projects found for this email. You can only sign up if a project has been shared with you.',
        400
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create verification token
    const verificationData = createVerificationToken();

    // Create client account
    const client = await db.clientAccount.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken: verificationData.token,
        verificationExpiry: verificationData.expiry,
      },
    });

    // Send verification email
    const verifyUrl = `${config.appUrl}/p/verify-email?token=${verificationData.token}`;
    const emailContent = emailVerificationTemplate(name, verifyUrl);

    await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return successResponse(
      {
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
        },
        projectCount: projectsForClient.length,
        message: 'Account created successfully. Please check your email to verify your account.',
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}