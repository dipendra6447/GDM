import { NextResponse } from 'next/server';
import { db } from '@/db';
import { globalConfigs, bannerImages } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/config/banner - Public endpoint to fetch active hero banner URL(s)
export async function GET() {
  try {
    // 1. Check banner_images table for active banners
    const activeRows = await db
      .select()
      .from(bannerImages)
      .where(eq(bannerImages.isActive, true))
      .orderBy(desc(bannerImages.createdAt))
      .catch(() => []);

    if (activeRows.length > 0) {
      const activeUrls = activeRows.map((r) => r.url);
      return NextResponse.json({
        success: true,
        bannerUrl: activeUrls[0],
        banners: activeUrls,
      });
    }

    // 2. Fallback to global_configs hero_banners JSON array
    const [jsonConfig] = await db
      .select()
      .from(globalConfigs)
      .where(eq(globalConfigs.key, 'hero_banners'))
      .limit(1)
      .catch(() => []);

    if (jsonConfig?.value) {
      try {
        const parsed = JSON.parse(jsonConfig.value);
        if (Array.isArray(parsed)) {
          const activeUrls = parsed.filter((b) => b.isActive).map((b) => b.url);
          if (activeUrls.length > 0) {
            return NextResponse.json({
              success: true,
              bannerUrl: activeUrls[0],
              banners: activeUrls,
            });
          }
        }
      } catch (e) {}
    }

    // 3. Fallback to single hero_banner_url config
    const [config] = await db
      .select()
      .from(globalConfigs)
      .where(eq(globalConfigs.key, 'hero_banner_url'))
      .limit(1)
      .catch(() => []);

    const singleUrl = config?.value || null;
    return NextResponse.json({
      success: true,
      bannerUrl: singleUrl,
      banners: singleUrl ? [singleUrl] : [],
    });
  } catch (error: any) {
    console.error('Failed to fetch banner config:', error);
    return NextResponse.json(
      { success: false, bannerUrl: null, banners: [] },
      { status: 500 }
    );
  }
}
