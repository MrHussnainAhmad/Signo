import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { config as appConfig } from '@/lib/config';

// Routes that require authentication
const protectedRoutes = ['/app'];

// Routes that should redirect to app if already authenticated
const authRoutes = ['/login', '/signup'];

// Public routes (no auth check needed)
const publicRoutes = ['/', '/privacy', '/terms', '/verify-email', '/invite', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session cookie
  const sessionCookie = request.cookies.get(appConfig.sessionCookieName);
  const hasSession = !!sessionCookie?.value;

  // Check if it's an API route
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check if it's a static file or Next.js internal route
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Client portal routes - handle separately
  if (pathname.startsWith('/p/')) {
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Auth routes - redirect to app if already authenticated
  if (authRoutes.includes(pathname)) {
    if (hasSession) {
      return NextResponse.redirect(new URL('/app', request.url));
    }
    return NextResponse.next();
  }

  // Public routes - always accessible
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};