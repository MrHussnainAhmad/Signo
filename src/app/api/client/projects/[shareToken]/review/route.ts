import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { createReviewSchema } from '@/lib/validation';
import { sendEmail } from '@/lib/email/transporter';
import { reviewThankYouTemplate } from '@/lib/email/templates';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
  validateBody,
} from '@/lib/api-response';

interface RouteParams {
  params: { shareToken: string };
}

// GET - Get review for project
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Find project
    const project = await db.project.findUnique({
      where: { shareToken: params.shareToken },
      include: {
        review: true,
      },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    if (!project.review) {
      return successResponse({
        review: null,
        canReview: project.status === 'APPROVED',
      });
    }

    return successResponse({
      review: {
        id: project.review.id,
        rating: project.review.rating,
        text: project.review.text,
        authorName: project.review.authorName,
        createdAt: project.review.createdAt,
      },
      canReview: false,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Submit review
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.type !== 'client') {
      return unauthorizedResponse('Please log in to submit a review');
    }

    // Validate request body
    const { data, error } = await validateBody(request, createReviewSchema);
    if (error) {
      return error;
    }

    // Find project
    const project = await db.project.findUnique({
      where: { shareToken: params.shareToken },
      include: {
        review: true,
        workspace: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!project) {
      return notFoundResponse('Project not found');
    }

    // Verify client owns this project
    const client = await db.clientAccount.findUnique({
      where: { id: session.userId },
    });

    if (!client || client.email !== project.clientEmail) {
      return forbiddenResponse('You do not have access to this project');
    }

    // Check if project is approved (required for review)
    if (project.status !== 'APPROVED') {
      return forbiddenResponse('You can only review approved projects');
    }

    // Check if review already exists
    if (project.review) {
      return errorResponse('You have already submitted a review for this project', 400);
    }

    // Create review
    const review = await db.review.create({
      data: {
        projectId: project.id,
        authorId: client.id,
        authorName: client.name,
        authorEmail: client.email,
        rating: data.rating,
        text: data.text || null,
      },
    });

    // Send thank you email
    const emailContent = reviewThankYouTemplate(
      client.name,
      project.title,
      data.rating
    );

    await sendEmail({
      to: client.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    return successResponse(
      {
        review: {
          id: review.id,
          rating: review.rating,
          text: review.text,
          authorName: review.authorName,
          createdAt: review.createdAt,
        },
        message: 'Thank you for your review!',
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}