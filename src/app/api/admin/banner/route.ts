import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { globalConfigs } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { parseFormData } from '@/lib/upload';
import { eq } from 'drizzle-orm';

// POST /api/admin/banner - Upload or update hero banner URL
export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    let bannerUrl = '';

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const { fields, files } = await parseFormData(req);
      const bannerFile = files.find((f) => f.fieldname === 'banner' || f.fieldname === 'image');
      if (bannerFile) {
        bannerUrl = bannerFile.filepath;
      } else if (fields.bannerUrl) {
        bannerUrl = fields.bannerUrl;
      }
    } else {
      const body = await req.json();
      bannerUrl = body.bannerUrl || body.value || '';
    }

    if (!bannerUrl) {
      return NextResponse.json(
        { success: false, message: 'Banner image or URL is required' },
        { status: 400 }
      );
    }

    // Upsert into globalConfigs
    const [existing] = await db
      .select()
      .from(globalConfigs)
      .where(eq(globalConfigs.key, 'hero_banner_url'))
      .limit(1);

    if (existing) {
      await db
        .update(globalConfigs)
        .set({ value: bannerUrl })
        .where(eq(globalConfigs.key, 'hero_banner_url'));
    } else {
      await db.insert(globalConfigs).values({
        key: 'hero_banner_url',
        value: bannerUrl,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Hero banner updated successfully',
      bannerUrl,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to update banner:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update banner' },
      { status: 500 }
    );
  }
}
