import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import {
  successResponse,
  handleApiError,
} from '@/lib/api-response';

export const dynamic = 'force-dynamic';

// GET - Get public reviews for homepage carousel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get reviews with high ratings (4-5 stars)
    const reviews = await db.review.findMany({
      where: {
        rating: {
          gte: 4,
        },
      },
      include: {
        project: {
          select: {
            title: true,
            workspace: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Get average rating and total count
    const stats = await db.review.aggregate({
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    return successResponse({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        text: r.text,
        authorName: r.authorName,
        projectTitle: r.project.title,
        workspaceName: r.project.workspace.name,
        createdAt: r.createdAt,
      })),
      stats: {
        averageRating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0,
        totalReviews: stats._count.rating,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}