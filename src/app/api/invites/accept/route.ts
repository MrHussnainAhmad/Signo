import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { hashToken, verifyTokenHash } from '@/lib/tokens';
import { acceptInviteSchema } from '@/lib/validation';
import { createSession } from '@/lib/session';
import { sendEmail } from '@/lib/email/transporter';
import { memberAddedNotificationTemplate } from '@/lib/email/templates';
import {
  successResponse,
  errorResponse,
  handleApiError,
  validateBody,
} from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';

// POST - Accept invite and create account
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = checkRateLimit(request, 'auth');
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Validate request body
    const { data, error } = await validateBody(request, acceptInviteSchema);
    if (error) {
      return error;
    }

    const { token, name, password } = data;

    // Hash the token to find the invite
    const tokenHash = hashToken(token);

    // Find valid invite
    const invite = await db.workspaceInvite.findFirst({
      where: {
        tokenHash: tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        workspace: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!invite) {
      return errorResponse(
        'Invalid or expired invite link. Please ask for a new invitation.',
        400
      );
    }

    // Verify token hash matches
    if (!verifyTokenHash(token, invite.tokenHash)) {
      return errorResponse('Invalid invite token', 400);
    }

    // Check if user already exists with this email
    const existingUser = await db.user.findUnique({
      where: { email: invite.email },
    });

    let user;

    if (existingUser) {
      // User exists - check if already a member of this workspace
      const existingMembership = await db.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: invite.workspaceId,
            userId: existingUser.id,
          },
        },
      });

      if (existingMembership) {
        // Mark invite as used
        await db.workspaceInvite.update({
          where: { id: invite.id },
          data: { usedAt: new Date() },
        });

        return errorResponse('You are already a member of this workspace', 400);
      }

      // Add existing user to workspace
      await db.workspaceMember.create({
        data: {
          workspaceId: invite.workspaceId,
          userId: existingUser.id,
          role: 'MEMBER',
        },
      });

      user = existingUser;
    } else {
      // Create new user
      const hashedPassword = await hashPassword(password);

      user = await db.user.create({
        data: {
          name,
          email: invite.email,
          password: hashedPassword,
          emailVerified: true, // Verified via invite link
          workspaces: {
            create: {
              workspaceId: invite.workspaceId,
              role: 'MEMBER',
            },
          },
        },
      });
    }

    // Mark invite as used
    await db.workspaceInvite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    });

    // Notify workspace owner
    const emailContent = memberAddedNotificationTemplate(
      invite.workspace.owner.name,
      name,
      invite.email
    );

    await sendEmail({
      to: invite.workspace.owner.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    // Create session for the new user
    await createSession({
      userId: user.id,
      workspaceId: invite.workspaceId,
      email: user.email,
      type: 'team',
    });

    return successResponse({
      message: 'Welcome to the team!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      workspace: {
        id: invite.workspace.id,
        name: invite.workspace.name,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET - Validate invite token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return errorResponse('Invite token is required', 400);
    }

    // Hash the token to find the invite
    const tokenHash = hashToken(token);

    // Find valid invite
    const invite = await db.workspaceInvite.findFirst({
      where: {
        tokenHash: tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        workspace: {
          select: {
            name: true,
            owner: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!invite) {
      return errorResponse(
        'Invalid or expired invite link. Please ask for a new invitation.',
        400
      );
    }

    // Verify token hash
    if (!verifyTokenHash(token, invite.tokenHash)) {
      return errorResponse('Invalid invite token', 400);
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: invite.email },
    });

    return successResponse({
      valid: true,
      email: invite.email,
      workspaceName: invite.workspace.name,
      inviterName: invite.workspace.owner.name,
      expiresAt: invite.expiresAt,
      userExists: !!existingUser,
    });
  } catch (error) {
    return handleApiError(error);
  }
}