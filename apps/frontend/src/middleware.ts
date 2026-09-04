import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
  ADMIN_LOGIN_PATH,
  ADMIN_SESSION_COOKIE_NAME,
  isAdminLoginPath,
  isProtectedAdminPath,
} from '@/features/admin/constants/session';

function redirectToLogin(request: NextRequest, nextPath?: string) {
  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
  if (nextPath && isProtectedAdminPath(nextPath)) {
    loginUrl.searchParams.set('next', nextPath);
  }
  return NextResponse.redirect(loginUrl);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (isAdminLoginPath(pathname)) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (isProtectedAdminPath(pathname)) {
    if (!sessionCookie) {
      return redirectToLogin(request, pathname);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
