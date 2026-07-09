import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { jobSeekerProfiles } from '@/db/schema';

// GET /api/profiles/job-seeker/[userId] (public view — for recruiters)
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const [profile] = await db.select().from(jobSeekerProfiles).where(eq(jobSeekerProfiles.userId, userId)).limit(1);

  if (!profile) {
    return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: profile });
}
