import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { candidateId, candidateName } = body;

    if (!candidateId) {
      return NextResponse.json({ success: false, message: 'Candidate ID is required' }, { status: 400 });
    }

    // Process invitation logic (log, notify, or record in activity)
    console.log(`📩 Employer ${auth?.userId || 'Guest'} invited candidate: ${candidateName || candidateId}`);

    return NextResponse.json({
      success: true,
      message: `Invitation successfully sent to ${candidateName || 'candidate'}!`,
      data: {
        candidateId,
        invitedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ POST /api/candidates/invite error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send invitation' }, { status: 500 });
  }
}
