import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { workExperiences } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// GET /api/career/experiences
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;
    const rows = await db.select().from(workExperiences).where(eq(workExperiences.userId, userId));
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch experiences' }, { status: 500 });
  }
}

// POST /api/career/experiences
export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;
    const data = await req.json();
    const [created] = await db.insert(workExperiences).values({ userId, ...data }).returning();
    return NextResponse.json({ success: true, message: 'Work experience added', data: created }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to create experience' }, { status: 500 });
  }
}
