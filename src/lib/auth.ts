import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface JwtPayload {
  userId: string;
  email: string;
  roles: number[];
  [key: string]: any;
}

// Secret Key for jose
const getSecretKey = () => new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

// ─── Sign Token ───────────────────────────────────────────────────────────────
export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN ?? '7d')
    .sign(getSecretKey());
}

// ─── Verify Token ─────────────────────────────────────────────────────────────
export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecretKey());
  return payload as JwtPayload;
}

// ─── Extract Auth from Next.js Request ────────────────────────────────────────
/**
 * Extracts and verifies the JWT from cookies first, then Authorization header.
 * Returns the decoded payload or null if no valid token is found.
 */
export async function getAuthFromRequest(req: NextRequest): Promise<JwtPayload | null> {
  try {
    // 1. Try cookie first (industry standard for Same-Site requests)
    let token = req.cookies.get('token')?.value;

    // 2. Fallback to Authorization header
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) return null;

    return await verifyToken(token);
  } catch {
    return null;
  }
}

// ─── Require Auth (throws if not authenticated) ──────────────────────────────
/**
 * Like getAuthFromRequest but throws an error if not authenticated.
 * Use this in route handlers where auth is mandatory.
 */
export async function requireAuth(req: NextRequest): Promise<JwtPayload> {
  const payload = await getAuthFromRequest(req);
  if (!payload) {
    throw new Error('Unauthorized');
  }

  // Global verification of user status
  const [user] = await db
    .select({ isActive: users.isActive, isDeleted: users.isDeleted })
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  if (!user) {
    throw new Error('User not found');
  }

  if (user.isDeleted || !user.isActive) {
    throw new Error('Account is deactivated or deleted');
  }

  return payload;
}

// ─── Role Check Helper ───────────────────────────────────────────────────────
/**
 * Checks if the user has at least one of the required roles.
 */
export function hasRole(user: JwtPayload, ...requiredRoleIds: number[]): boolean {
  return requiredRoleIds.some((roleId) => user.roles.includes(roleId));
}
