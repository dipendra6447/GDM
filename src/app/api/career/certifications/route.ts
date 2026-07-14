import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { certifications } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// GET /api/career/certifications
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;
    const rows = await db.select().from(certifications).where(eq(certifications.userId, userId));
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch certifications' }, { status: 500 });
  }
}

// POST /api/career/certifications
export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;
    const data = await req.json();
    const [created] = await db.insert(certifications).values({ userId, ...data }).returning();
    return NextResponse.json({ success: true, message: 'Certification added', data: created }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to create certification' }, { status: 500 });
  }
}
