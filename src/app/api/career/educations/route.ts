import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { educations } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// GET /api/career/educations
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;
    const rows = await db.select().from(educations).where(eq(educations.userId, userId));
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch educations' }, { status: 500 });
  }
}

// POST /api/career/educations
export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;
    const data = await req.json();
    const [created] = await db.insert(educations).values({ userId, ...data }).returning();
    return NextResponse.json({ success: true, message: 'Education added', data: created }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to create education' }, { status: 500 });
  }
}
