import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { createInviteToken } from '@/lib/tokens';
import { inviteMemberSchema } from '@/lib/validation';
import { sendEmail } from '@/lib/email/transporter';
import { studioInviteTemplate } from '@/lib/email/templates';
import { config } from '@/lib/config';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  handleApiError,
  validateBody,
} from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';

// POST - Create invite
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = checkRateLimit(request, 'invite');
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    // Validate request body
    const { data, error } = await validateBody(request, inviteMemberSchema);
    if (error) {
      return error;
    }

    const { email } = data;

    // Get workspace and verify ownership
    const workspace = await db.workspace.findUnique({
      where: { id: session.workspaceId },
      include: {
        owner: true,
        members: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        invites: {
          where: {
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
        },
      },
    });

    if (!workspace) {
      return errorResponse('Workspace not found', 404);
    }

    // Only owner can invite members
    if (workspace.ownerId !== session.userId) {
      return forbiddenResponse('Only the workspace owner can invite members');
    }

    // Check if workspace has Studio or Business plan
    if (workspace.plan !== 'STUDIO' && workspace.plan !== 'BUSINESS') {
      return forbiddenResponse(
        'Upgrade to Studio or Business plan to invite team members. Solo plan allows only one user.'
      );
    }

    // Check member limit
    const currentMemberCount = workspace.members.length;
    const pendingInviteCount = workspace.invites.length;
    let maxMembers = config.limits.solo.maxMembers;
    
    if (workspace.plan === 'STUDIO') {
      maxMembers = config.limits.studio.maxMembers;
    } else if (workspace.plan === 'BUSINESS') {
      maxMembers = config.limits.business.maxMembers;
    }

    if (currentMemberCount + pendingInviteCount >= maxMembers) {
      return errorResponse(
        `${workspace.plan} plan allows up to ${maxMembers} team members. You have ${currentMemberCount} members and ${pendingInviteCount} pending invites.`,
        400
      );
    }

    // Check if email is already a member
    const isMember = workspace.members.some(
      (m) => m.user.email.toLowerCase() === email.toLowerCase()
    );
    if (isMember) {
      return errorResponse('This person is already a member of your workspace', 400);
    }

    // Check if there's already a pending invite for this email
    const existingInvite = await db.workspaceInvite.findFirst({
      where: {
        workspaceId: workspace.id,
        email: email.toLowerCase(),
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      return errorResponse(
        'An invite has already been sent to this email. It expires in 1 hour.',
        400
      );
    }

    // Create invite token
    const inviteData = createInviteToken();

    // Store invite in database
    const invite = await db.workspaceInvite.create({
      data: {
        workspaceId: workspace.id,
        email: email.toLowerCase(),
        tokenHash: inviteData.tokenHash,
        expiresAt: inviteData.expiry,
      },
    });

    // Send invite email
    const inviteUrl = `${config.appUrl}/invite?token=${inviteData.token}`;
    const emailContent = studioInviteTemplate(
      workspace.name,
      workspace.owner.name,
      inviteUrl
    );

    const emailSent = await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (!emailSent) {
      // Delete invite if email failed
      await db.workspaceInvite.delete({
        where: { id: invite.id },
      });
      return errorResponse('Failed to send invite email. Please try again.', 500);
    }

    return successResponse({
      message: `Invite sent to ${email}`,
      invite: {
        id: invite.id,
        email: invite.email,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET - List pending invites
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    // Get workspace
    const workspace = await db.workspace.findUnique({
      where: { id: session.workspaceId },
    });

    if (!workspace) {
      return errorResponse('Workspace not found', 404);
    }

    // Only owner can view invites
    if (workspace.ownerId !== session.userId) {
      return forbiddenResponse('Only the workspace owner can view invites');
    }

    // Get pending invites
    const invites = await db.workspaceInvite.findMany({
      where: {
        workspaceId: workspace.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        email: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse({
      invites,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Cancel invite
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'team') {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get('id');

    if (!inviteId) {
      return errorResponse('Invite ID is required', 400);
    }

    // Get workspace
    const workspace = await db.workspace.findUnique({
      where: { id: session.workspaceId },
    });

    if (!workspace) {
      return errorResponse('Workspace not found', 404);
    }

    // Only owner can cancel invites
    if (workspace.ownerId !== session.userId) {
      return forbiddenResponse('Only the workspace owner can cancel invites');
    }

    // Find and delete invite
    const invite = await db.workspaceInvite.findFirst({
      where: {
        id: inviteId,
        workspaceId: workspace.id,
        usedAt: null,
      },
    });

    if (!invite) {
      return errorResponse('Invite not found', 404);
    }

    await db.workspaceInvite.delete({
      where: { id: invite.id },
    });

    return successResponse({
      message: 'Invite cancelled successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}