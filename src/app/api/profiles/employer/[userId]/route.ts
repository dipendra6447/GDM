import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { employerProfiles } from '@/db/schema';

// GET /api/profiles/employer/[userId] (public view)
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const [profile] = await db.select().from(employerProfiles).where(eq(employerProfiles.userId, userId)).limit(1);
  if (!profile) return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: profile });
}
