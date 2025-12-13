import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// Success response
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

// Error response
export function errorResponse(
  message: string,
  status: number = 400,
  errors?: Record<string, string[]>
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error: message,
  };

  if (errors) {
    response.errors = errors;
  }

  return NextResponse.json(response, { status });
}

// Handle Zod validation errors
export function validationErrorResponse(error: ZodError): NextResponse {
  const errors: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });

  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      errors,
    },
    { status: 400 }
  );
}

// Unauthorized response
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 401 }
  );
}

// Forbidden response
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 403 }
  );
}

// Not found response
export function notFoundResponse(message: string = 'Not found'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 404 }
  );
}

// Server error response
export function serverErrorResponse(
  message: string = 'Internal server error'
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 500 }
  );
}

// Handle API errors consistently
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof ZodError) {
    return validationErrorResponse(error);
  }

  if (error instanceof Error) {
    // Check for specific error types
    if (error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    if (error.message === 'Email not verified') {
      return forbiddenResponse('Please verify your email first');
    }

    if (error.message === 'Not found') {
      return notFoundResponse();
    }

    // Log unexpected errors but don't expose details
    console.error('Unexpected error:', error.message);
  }

  return serverErrorResponse();
}

// Rate limit exceeded response
export function rateLimitResponse(retryAfter: number): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Too many requests',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}

// Redirect response (for client-side handling)
export function redirectResponse(url: string): NextResponse {
  return NextResponse.json(
    {
      success: true,
      redirect: url,
    },
    { status: 200 }
  );
}

// Created response
export function createdResponse<T>(data: T): NextResponse {
  return successResponse(data, 201);
}

// No content response
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

// Parse JSON body safely
export async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    const body = await request.json();
    return body as T;
  } catch {
    return null;
  }
}

// Validate and parse request body
export async function validateBody<T>(
  request: Request,
  schema: { parse: (data: unknown) => T }
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  const body = await parseJsonBody(request);

  if (body === null) {
    return {
      data: null,
      error: errorResponse('Invalid JSON body'),
    };
  }

  try {
    const data = schema.parse(body);
    return { data, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        data: null,
        error: validationErrorResponse(err),
      };
    }
    return {
      data: null,
      error: errorResponse('Invalid request body'),
    };
  }
}