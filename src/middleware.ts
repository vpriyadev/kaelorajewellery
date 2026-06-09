import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protect admin routes server-side by reading kaelora_session cookie.
// If no session or role !== 'admin' -> redirect to homepage '/'
// Google authentication is required before accessing /admin routes

function parseSessionCookie(req: NextRequest) {
  const cookie = req.cookies.get('kaelora_session');
  if (!cookie) return null;
  try {
    const raw = typeof cookie === 'string' ? cookie : cookie.value;
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect paths under /admin
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const session = parseSessionCookie(req);
  
  // If no session or role is not admin, redirect to homepage
  if (!session || session.role !== 'admin') {
    const home = new URL('/', req.url);
    return NextResponse.redirect(home);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*'
  ],
};
