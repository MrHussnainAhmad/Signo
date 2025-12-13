import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { clientLoginSchema } from '@/lib/validation';
import { createSession } from '@/lib/session';
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
    const { data, error } = await validateBody(request, clientLoginSchema);
    if (error) {
      return error;
    }

    const { email, password } = data;

    // Find client
    const client = await db.clientAccount.findUnique({
      where: { email },
    });

    if (!client) {
      return errorResponse('Invalid email or password', 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, client.password);

    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 401);
    }

    // Check if email is verified
    if (!client.emailVerified) {
      return errorResponse(
        'Please verify your email before logging in. Check your inbox for the verification link.',
        403
      );
    }

    // Get projects for this client
    const projects = await db.project.findMany({
      where: { clientEmail: email },
      select: {
        id: true,
        title: true,
        status: true,
        shareToken: true,
      },
    });

    // Create session
    await createSession({
      userId: client.id,
      workspaceId: '', // Clients don't have workspaces
      email: client.email,
      type: 'client',
    });

    return successResponse({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
      },
      projects: projects.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        shareToken: p.shareToken,
      })),
      message: 'Logged in successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}