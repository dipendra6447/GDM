import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { savedSearches } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

// DELETE /api/saved-searches/[id] — Remove a saved search query
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: searchId } = await params;
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;

    await db
      .delete(savedSearches)
      .where(and(eq(savedSearches.id, searchId), eq(savedSearches.userId, userId)));

    return NextResponse.json({ success: true, message: 'Saved search removed successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('❌ DELETE saved search error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to delete saved search' }, { status: 500 });
  }
}
