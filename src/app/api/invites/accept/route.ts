import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { hashToken } from '@/lib/tokens';
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
    
    console.log('🔍 Looking for invite...');
    console.log('Token (first 20 chars):', token.substring(0, 20) + '...');
    console.log('TokenHash:', tokenHash);

    // First, find ANY invite with this hash (ignore expiry/used for debugging)
    const anyInvite = await db.workspaceInvite.findFirst({
      where: { tokenHash: tokenHash },
    });

    if (!anyInvite) {
      // Let's check how many invites exist total
      const totalInvites = await db.workspaceInvite.count();
      console.log('❌ No invite found with this hash. Total invites in DB:', totalInvites);
      
      // List all recent invites for debugging (remove in production)
      const recentInvites = await db.workspaceInvite.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { 
          id: true, 
          email: true, 
          tokenHash: true,
          createdAt: true,
          expiresAt: true,
          usedAt: true 
        },
      });
      console.log('Recent invites:', JSON.stringify(recentInvites, null, 2));
      
      return errorResponse(
        'Invite not found. The link may be incorrect or the invite was deleted.',
        400
      );
    }

    console.log('✅ Found invite:', anyInvite.id);
    console.log('   Email:', anyInvite.email);
    console.log('   Expires:', anyInvite.expiresAt);
    console.log('   Used:', anyInvite.usedAt);

    // Check if already used
    if (anyInvite.usedAt) {
      return errorResponse('This invite has already been used.', 400);
    }

    // Check if expired
    if (anyInvite.expiresAt < new Date()) {
      return errorResponse(
        `This invite expired on ${anyInvite.expiresAt.toISOString()}. Please ask for a new invitation.`,
        400
      );
    }

    // Get workspace details
    const invite = await db.workspaceInvite.findFirst({
      where: {
        id: anyInvite.id,
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
      return errorResponse('Invite workspace not found', 400);
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
    console.error('❌ Error in GET /api/invites/accept:', error);
    return handleApiError(error);
  }
}

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
          emailVerified: true,
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
    console.error('❌ Error in POST /api/invites/accept:', error);
    return handleApiError(error);
  }
}