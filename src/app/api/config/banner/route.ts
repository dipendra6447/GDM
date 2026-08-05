import { NextResponse } from 'next/server';
import { db } from '@/db';
import { globalConfigs } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/config/banner - Public endpoint to fetch active hero banner URL
export async function GET() {
  try {
    const [config] = await db
      .select()
      .from(globalConfigs)
      .where(eq(globalConfigs.key, 'hero_banner_url'))
      .limit(1);

    return NextResponse.json({
      success: true,
      bannerUrl: config?.value || null,
    });
  } catch (error: any) {
    console.error('Failed to fetch banner config:', error);
    return NextResponse.json(
      { success: false, bannerUrl: null },
      { status: 500 }
    );
  }
}
