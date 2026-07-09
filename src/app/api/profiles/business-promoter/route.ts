import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { businessPromoterProfiles } from '@/db/schema';
import { requireAuth } from '@/lib/auth';
import { parseFormData } from '@/lib/upload';

// GET /api/profiles/business-promoter
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const [profile] = await db.select().from(businessPromoterProfiles).where(eq(businessPromoterProfiles.userId, authPayload.userId)).limit(1);
    if (!profile) return NextResponse.json({ success: false, message: 'Profile not found. Please create one.' }, { status: 404 });
    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT /api/profiles/business-promoter
export async function PUT(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;
    const { fields, files } = await parseFormData(req);
    const updateData: any = { ...fields };

    const logoFile = files.find(f => f.fieldname === 'logo');
    if (logoFile) updateData.logoUrl = logoFile.filepath;
    if (updateData.foundationDate) updateData.foundationDate = new Date(updateData.foundationDate);

    const [currentProfile] = await db.select().from(businessPromoterProfiles).where(eq(businessPromoterProfiles.userId, userId)).limit(1);
    const mergedProfile = { ...(currentProfile || {}), ...updateData };

    const completionFields = [
      'businessName', 'businessCategory', 'about', 'logoUrl', 'foundationDate', 'purpose', 'contactPhone',
      'contactEmail', 'address', 'websiteUrl', 'linkedinUrl', 'instagramUrl',
      'facebookUrl', 'gstNumber'
    ];
    let filledFields = 0;
    completionFields.forEach(field => {
      if (mergedProfile[field as keyof typeof mergedProfile] !== null &&
          mergedProfile[field as keyof typeof mergedProfile] !== undefined &&
          mergedProfile[field as keyof typeof mergedProfile] !== '') filledFields++;
    });
    updateData.profileCompletion = Math.round((filledFields / completionFields.length) * 100);

    if (currentProfile) {
      const [updated] = await db.update(businessPromoterProfiles).set({ ...updateData, updatedAt: new Date() }).where(eq(businessPromoterProfiles.userId, userId)).returning();
      return NextResponse.json({ success: true, message: 'Profile updated', data: updated });
    } else {
      const [created] = await db.insert(businessPromoterProfiles).values({ userId, ...updateData }).returning();
      return NextResponse.json({ success: true, message: 'Profile created', data: created }, { status: 201 });
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    console.error('❌ Business promoter profile error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to update profile' }, { status: 500 });
  }
}
