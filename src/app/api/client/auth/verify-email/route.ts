import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { config } from '@/lib/config';
import {
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return errorResponse('Verification token is required', 400);
    }

    // Find client with this verification token
    const client = await db.clientAccount.findFirst({
      where: {
        verificationToken: token,
        emailVerified: false,
      },
    });

    if (!client) {
      return errorResponse('Invalid or expired verification link', 400);
    }

    // Check if token has expired
    if (client.verificationExpiry && client.verificationExpiry < new Date()) {
      return errorResponse(
        'Verification link has expired. Please request a new one.',
        400
      );
    }

    // Update client as verified
    await db.clientAccount.update({
      where: { id: client.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    // Get projects for this client to redirect to the first one
    const project = await db.project.findFirst({
      where: { clientEmail: client.email },
      orderBy: { createdAt: 'desc' },
    });

    const redirectTo = project
      ? `/p/${project.shareToken}?verified=true`
      : '/p/login?verified=true';

    return successResponse({
      message: 'Email verified successfully. You can now log in.',
      verified: true,
      redirectTo,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return errorResponse('Verification token is required', 400);
    }

    // Find client with this verification token
    const client = await db.clientAccount.findFirst({
      where: {
        verificationToken: token,
        emailVerified: false,
      },
    });

    if (!client) {
      return errorResponse('Invalid or expired verification link', 400);
    }

    // Check if token has expired
    if (client.verificationExpiry && client.verificationExpiry < new Date()) {
      return errorResponse(
        'Verification link has expired. Please request a new one.',
        400
      );
    }

    // Update client as verified
    await db.clientAccount.update({
      where: { id: client.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    return successResponse({
      message: 'Email verified successfully. You can now log in.',
      verified: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}