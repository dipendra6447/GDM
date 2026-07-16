import { NextRequest, NextResponse } from 'next/server';
import { eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/db';
import { businessPromotions, adAnalytics } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;

    // 1. Fetch promoter's promotions
    const promos = await db
      .select()
      .from(businessPromotions)
      .where(eq(businessPromotions.userId, userId));

    if (promos.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          chartData: [],
          totals: { impressions: 0, clicks: 0, spent: 0, ctr: 0, cpc: 0 }
        }
      });
    }

    const promoIds = promos.map(p => p.id);

    // 2. Fetch daily analytics for these promotions
    const rawMetrics = await db
      .select()
      .from(adAnalytics)
      .where(inArray(adAnalytics.promotionId, promoIds))
      .orderBy(adAnalytics.date);

    // 3. Calculate overall totals
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpent = 0;

    rawMetrics.forEach((m) => {
      totalImpressions += m.impressions;
      totalClicks += m.clicks;
      totalSpent += m.spent;
    });

    const averageCtr = totalImpressions > 0 
      ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)) 
      : 0;

    const averageCpc = totalClicks > 0 
      ? parseFloat((totalSpent / totalClicks).toFixed(2)) 
      : 0;

    // 4. Group metrics by Month (last 6 months format: e.g. "Jan", "Feb")
    const monthlyGroups: Record<string, { impressions: number; clicks: number; spent: number }> = {};
    
    // Initialize last 6 months groups
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mLabel = monthNames[d.getMonth()];
      monthlyGroups[mLabel] = { impressions: 0, clicks: 0, spent: 0 };
    }

    rawMetrics.forEach((m) => {
      const mDate = new Date(m.date);
      const mLabel = monthNames[mDate.getMonth()];
      if (monthlyGroups[mLabel]) {
        monthlyGroups[mLabel].impressions += m.impressions;
        monthlyGroups[mLabel].clicks += m.clicks;
        monthlyGroups[mLabel].spent += m.spent;
      }
    });

    const chartData = Object.entries(monthlyGroups).map(([month, data]) => {
      const ctr = data.impressions > 0 
        ? parseFloat(((data.clicks / data.impressions) * 100).toFixed(2)) 
        : 0;
      const cpc = data.clicks > 0 
        ? parseFloat((data.spent / data.clicks).toFixed(2)) 
        : 0;
      return {
        month,
        impressions: data.impressions,
        clicks: data.clicks,
        spent: data.spent,
        ctr,
        cpc
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        chartData,
        totals: {
          impressions: totalImpressions,
          clicks: totalClicks,
          spent: totalSpent,
          ctr: averageCtr,
          cpc: averageCpc
        }
      }
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ success: false, message: 'Failed to fetch analytics' }, { status: 500 });
  }
}
