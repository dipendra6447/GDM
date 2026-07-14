import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Secret Key for jose
const getSecretKey = () => new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Paths that require authentication
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/api/dashboard');
  const isCareerRoute = pathname.startsWith('/api/career');

  if (isAdminRoute || isDashboardRoute || isCareerRoute) {
    let token = req.cookies.get('token')?.value;

    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return handleUnauthorized(req);
    }

    try {
      // Verify token at the Edge using jose
      const { payload } = await jwtVerify(token, getSecretKey());

      // If it's an admin route, we could optionally check roles here too,
      // but requireAuth will do the detailed database & role checks.
      if (isAdminRoute) {
        const roles = payload.roles as number[];
        // 4 is SUPER_USER
        if (!roles.includes(4)) {
          return handleForbidden(req);
        }
      }

    } catch (error) {
      // Token invalid or expired
      return handleUnauthorized(req);
    }
  }

  return NextResponse.next();
}

function handleUnauthorized(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  // Redirect UI routes to login
  const loginUrl = new URL('/login', req.url);
  return NextResponse.redirect(loginUrl);
}

function handleForbidden(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ success: false, message: 'Forbidden: Insufficient privileges' }, { status: 403 });
  }

  // Redirect UI routes to home
  const homeUrl = new URL('/', req.url);
  return NextResponse.redirect(homeUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication APIs)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
