import { NextRequest } from 'next/server';
import { destroySession } from '@/lib/session';
import { successResponse, handleApiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    await destroySession();

    return successResponse({
      message: 'Logged out successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    await destroySession();

    return successResponse({
      message: 'Logged out successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}