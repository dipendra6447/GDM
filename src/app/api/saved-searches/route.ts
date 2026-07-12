import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { savedSearches } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// GET /api/saved-searches — Get all saved searches for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;

    const list = await db
      .select()
      .from(savedSearches)
      .where(eq(savedSearches.userId, userId))
      .orderBy(desc(savedSearches.createdAt));

    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('❌ GET saved searches error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to fetch saved searches' }, { status: 500 });
  }
}

// POST /api/saved-searches — Save a new search query
export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;
    const { title, query } = await req.json();

    if (!title || !query) {
      return NextResponse.json({ success: false, message: 'Title and query are required' }, { status: 400 });
    }

    const [saved] = await db
      .insert(savedSearches)
      .values({ userId, title, query })
      .returning();

    return NextResponse.json({ success: true, message: 'Search saved successfully', data: saved }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('❌ POST saved search error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to save search' }, { status: 500 });
  }
}
