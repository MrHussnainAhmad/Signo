import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { loginSchema } from '@/lib/validation';
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
    const { data, error } = await validateBody(request, loginSchema);
    if (error) {
      return error;
    }

    const { email, password } = data;

    // Find user
    const user = await db.user.findUnique({
      where: { email },
      include: {
        workspaces: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
                plan: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 401);
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return errorResponse(
        'Please verify your email before logging in. Check your inbox for the verification link.',
        403
      );
    }

    // Get user's primary workspace
    const membership = user.workspaces[0];
    
    if (!membership) {
      return errorResponse('No workspace found for this account', 500);
    }

    // Check plan-based login restrictions
    const workspace = await db.workspace.findUnique({
      where: { id: membership.workspaceId },
      include: {
        owner: true,
        members: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
      },
    });

    if (!workspace) {
      return errorResponse('Workspace not found', 500);
    }

    // Solo plan: Only owner email can log in
    if (workspace.plan === 'SOLO' && workspace.owner.email !== email) {
      return errorResponse(
        'This workspace is on a Solo plan. Only the owner can log in.',
        403
      );
    }

    // Create session
    await createSession({
      userId: user.id,
      workspaceId: membership.workspaceId,
      email: user.email,
      type: 'team',
    });

    return successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        plan: workspace.plan,
      },
      message: 'Logged in successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}