import { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export const rateLimitConfigs = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 attempts per 15 minutes
  },
  invite: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 invites per hour
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // 50 uploads per hour
  },
} as const;

function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  return cfConnectingIp || realIp || forwardedFor?.split(',')[0]?.trim() || 'unknown';
}

export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): { success: boolean; remaining: number; resetIn: number } {
  const clientId = identifier || getClientIdentifier(request);
  const key = `${request.nextUrl.pathname}:${clientId}`;
  const now = Date.now();
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetTime < now) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }
  
  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }
  
  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

export function createRateLimitResponse(resetIn: number) {
  const retryAfter = Math.ceil(resetIn / 1000);
  
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: `Please try again in ${retryAfter} seconds`,
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}

// Middleware helper
export function checkRateLimit(
  request: NextRequest,
  configKey: keyof typeof rateLimitConfigs,
  identifier?: string
) {
  const config = rateLimitConfigs[configKey];
  const result = rateLimit(request, config, identifier);
  
  if (!result.success) {
    return createRateLimitResponse(result.resetIn);
  }
  
  return null;
}