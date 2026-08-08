import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { globalConfigs, bannerImages } from '@/db/schema';
import { requireAuth, hasRole } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { parseFormData } from '@/lib/upload';
import { eq, desc, sql } from 'drizzle-orm';

export interface BannerItem {
  id: string;
  url: string;
  title: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Ensure DB Table Exists ───────────────────────────────────────────────────
async function ensureBannerTable() {
  try {
    await db.execute(sql`
      ALTER TABLE global_configs ALTER COLUMN value TYPE TEXT;
    `);
  } catch (err) {
    // Column might already be TEXT or altered
  }

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS banner_images (
        id VARCHAR(100) PRIMARY KEY,
        url TEXT NOT NULL,
        title VARCHAR(255),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  } catch (err) {
    console.error('Failed to create banner_images table:', err);
  }
}

// ─── Sync Global Config ───────────────────────────────────────────────────────
async function syncGlobalBannerConfigs(allBanners: BannerItem[]) {
  try {
    const activeBanners = allBanners.filter((b) => b.isActive);
    const primaryBannerUrl = activeBanners.length > 0 ? activeBanners[0].url : (allBanners[0]?.url || '');

    // Upsert hero_banner_url
    const [existingUrl] = await db
      .select()
      .from(globalConfigs)
      .where(eq(globalConfigs.key, 'hero_banner_url'))
      .limit(1);

    if (existingUrl) {
      await db
        .update(globalConfigs)
        .set({ value: primaryBannerUrl })
        .where(eq(globalConfigs.key, 'hero_banner_url'));
    } else {
      await db.insert(globalConfigs).values({ key: 'hero_banner_url', value: primaryBannerUrl });
    }

    // Upsert hero_banners JSON array
    const bannersJson = JSON.stringify(allBanners);
    const [existingJson] = await db
      .select()
      .from(globalConfigs)
      .where(eq(globalConfigs.key, 'hero_banners'))
      .limit(1);

    if (existingJson) {
      await db
        .update(globalConfigs)
        .set({ value: bannersJson })
        .where(eq(globalConfigs.key, 'hero_banners'));
    } else {
      await db.insert(globalConfigs).values({ key: 'hero_banners', value: bannersJson });
    }
  } catch (err) {
    console.error('Failed to sync global banner configs:', err);
  }
}

// ─── Helper: Fetch All Banners ───────────────────────────────────────────────
async function getAllBanners(): Promise<BannerItem[]> {
  await ensureBannerTable();

  const rows = await db
    .select()
    .from(bannerImages)
    .orderBy(desc(bannerImages.createdAt));

  if (rows.length === 0) {
    // Check if legacy hero_banner_url exists
    const [legacyConfig] = await db
      .select()
      .from(globalConfigs)
      .where(eq(globalConfigs.key, 'hero_banner_url'))
      .limit(1);

    if (legacyConfig?.value) {
      const defaultId = `banner_${Date.now()}`;
      await db.insert(bannerImages).values({
        id: defaultId,
        url: legacyConfig.value,
        title: 'Default Hero Banner',
        isActive: true,
      });

      return [
        {
          id: defaultId,
          url: legacyConfig.value,
          title: 'Default Hero Banner',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];
    }
  }

  return rows.map((r) => ({
    id: r.id,
    url: r.url,
    title: r.title || 'Hero Banner Image',
    isActive: Boolean(r.isActive),
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
  }));
}

// ─── GET /api/admin/banner ────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const banners = await getAllBanners();
    const activeCount = banners.filter((b) => b.isActive).length;

    return NextResponse.json({
      success: true,
      banners,
      activeCount,
    });
  } catch (error: any) {
    console.error('Failed to fetch admin banners:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ─── POST /api/admin/banner ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    await ensureBannerTable();

    const contentType = req.headers.get('content-type') || '';
    const newItems: Array<{ url: string; title: string; isActive: boolean }> = [];
    let defaultIsActive = true;

    if (contentType.includes('multipart/form-data')) {
      const { fields, files } = await parseFormData(req);
      if (fields.isActive !== undefined) {
        defaultIsActive = fields.isActive === 'true' || fields.isActive === '1';
      }

      // Collect all uploaded banner files
      const bannerFiles = files.filter(
        (f) =>
          f.fieldname === 'banner' ||
          f.fieldname === 'banners' ||
          f.fieldname === 'image' ||
          f.fieldname.startsWith('banner_') ||
          f.fieldname.startsWith('image_')
      );

      for (const file of bannerFiles) {
        newItems.push({
          url: file.filepath,
          title: file.filename || file.fieldname,
          isActive: defaultIsActive,
        });
      }

      if (bannerFiles.length === 0 && fields.bannerUrl) {
        // Support custom URL submitted in form data
        const urls = fields.bannerUrl
          .split(/[\n,]+/)
          .map((u) => u.trim())
          .filter(Boolean);

        for (const url of urls) {
          newItems.push({
            url,
            title: fields.title || 'Custom Banner URL',
            isActive: defaultIsActive,
          });
        }
      }
    } else {
      const body = await req.json();
      defaultIsActive = body.isActive !== undefined ? Boolean(body.isActive) : true;

      if (Array.isArray(body.bannerUrls)) {
        for (const url of body.bannerUrls) {
          if (url) {
            newItems.push({
              url,
              title: body.title || 'Custom Banner URL',
              isActive: defaultIsActive,
            });
          }
        }
      } else if (body.bannerUrl || body.url) {
        const urlStr = body.bannerUrl || body.url;
        const urls = urlStr
          .split(/[\n,]+/)
          .map((u: string) => u.trim())
          .filter(Boolean);

        for (const url of urls) {
          newItems.push({
            url,
            title: body.title || 'Custom Banner URL',
            isActive: defaultIsActive,
          });
        }
      }
    }

    if (newItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid image files or URLs provided' },
        { status: 400 }
      );
    }

    // Insert new banners into database
    for (const item of newItems) {
      const bannerId = `banner_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      await db.insert(bannerImages).values({
        id: bannerId,
        url: item.url,
        title: item.title,
        isActive: item.isActive,
      });
    }

    const allBanners = await getAllBanners();
    await syncGlobalBannerConfigs(allBanners);

    return NextResponse.json({
      success: true,
      message: `Successfully added ${newItems.length} banner image(s) with Active tag set to ${defaultIsActive ? 'Active' : 'Inactive'}`,
      banners: allBanners,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to upload/add banner:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to upload banner' },
      { status: 500 }
    );
  }
}

// ─── PATCH /api/admin/banner ──────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    await ensureBannerTable();
    const body = await req.json();

    if (body.action === 'activateAll') {
      await db.update(bannerImages).set({ isActive: true });
    } else if (body.action === 'deactivateAll') {
      await db.update(bannerImages).set({ isActive: false });
    } else if (body.id) {
      await db
        .update(bannerImages)
        .set({ isActive: Boolean(body.isActive) })
        .where(eq(bannerImages.id, body.id));
    } else {
      return NextResponse.json(
        { success: false, message: 'Banner ID or valid action required' },
        { status: 400 }
      );
    }

    const allBanners = await getAllBanners();
    await syncGlobalBannerConfigs(allBanners);

    return NextResponse.json({
      success: true,
      message: 'Banner active status updated successfully',
      banners: allBanners,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to update banner active status:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update banner' },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/admin/banner ─────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    if (!hasRole(authPayload, ROLES.SUPER_USER)) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
    }

    await ensureBannerTable();

    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'Banner ID is required' }, { status: 400 });
    }

    await db.delete(bannerImages).where(eq(bannerImages.id, id));

    const allBanners = await getAllBanners();
    await syncGlobalBannerConfigs(allBanners);

    return NextResponse.json({
      success: true,
      message: 'Banner image deleted successfully',
      banners: allBanners,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('Failed to delete banner:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
