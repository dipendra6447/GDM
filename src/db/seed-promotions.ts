/**
 * Seed Business Promotions with Industry Standard Data
 *
 * Run via: npx tsx src/db/seed-promotions.ts
 */

import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, or } from 'drizzle-orm';
import { users, userRoles } from './schema/auth.schema';
import { businessPromoterProfiles } from './schema/profile.schema';
import { businessPromotions } from './schema/promotion.schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// ═══════════════════════════════════════════════════════════════════════════════
// INDUSTRY STANDARD PROMOTED BUSINESSES DATA
// ═══════════════════════════════════════════════════════════════════════════════
const PROMOTED_PROMOTERS = [
  {
    email: 'contact@technovagroup.com',
    businessName: 'TechNova Enterprise Solutions',
    category: 'IT Services & Digital Transformation',
    about: 'End-to-end cloud migration, custom enterprise software development, and AI-driven workflow automation for scaling businesses.',
    purpose: 'Transform Your Business With Next-Gen Technology Solutions',
    businessDescription: 'TechNova helps enterprises build modern cloud architecture, streamline IT operations, and deploy custom software solutions. Partner with 500+ successful digital leaders.',
    offerTag: '🔥 Free 1-on-1 Digital Architecture Audit',
    ctaLabel: 'Book Free Session',
    businessContactDetails: '/contact?service=it-consulting',
    bannerUrl: [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&auto=format&fit=crop&q=80',
    ].join(','),
  },
  {
    email: 'info@fitpulsewellness.com',
    businessName: 'FitPulse Corporate Wellness',
    category: 'Health, Fitness & Executive Wellness',
    about: 'State-of-the-art corporate wellness programs, executive fitness coaching, and personalized nutrition plans tailored for working professionals.',
    purpose: 'Elevate Team Energy, Productivity & Physical Health',
    businessDescription: 'FitPulse offers elite corporate gym memberships, online wellness workshops, and executive fitness plans designed to boost energy, mental focus, and team productivity.',
    offerTag: '💪 30-Day Free Corporate Wellness Pass',
    ctaLabel: 'Claim Pass',
    businessContactDetails: '/contact?service=wellness',
    bannerUrl: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&auto=format&fit=crop&q=80',
    ].join(','),
  },
  {
    email: 'hello@pixelcraftstudios.com',
    businessName: 'PixelCraft Creative Studio',
    category: 'Branding, UI/UX & Web Design',
    about: 'Bespoke brand identities, mobile app UI/UX design, and conversion-optimized web designs for ambitious startups and enterprise brands.',
    purpose: 'Build Beautiful Product Experiences That Convert',
    businessDescription: 'PixelCraft crafts high-impact visual identities, intuitive product interfaces, and interactive web experiences. Over 120 global awards won for excellence in design.',
    offerTag: '⚡ Free Brand & UX Strategy Session',
    ctaLabel: 'View Portfolio',
    businessContactDetails: '/contact?service=branding',
    bannerUrl: [
      'https://images.unsplash.com/photo-1542744094-3a31b272c490?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&auto=format&fit=crop&q=80',
    ].join(','),
  },
  {
    email: 'sales@apexmarketingsolutions.com',
    businessName: 'Apex Growth Marketing',
    category: 'Performance Marketing & Lead Generation',
    about: 'Data-driven performance marketing campaigns, search engine optimization (SEO), and high-ROI multi-channel lead generation.',
    purpose: 'Scale Customer Acquisition & Double Your Revenue',
    businessDescription: 'Apex Growth Marketing accelerates customer acquisition using advanced analytics, multi-channel PPC, and conversion funnel optimization.',
    offerTag: '📈 Free $500 Ad Audit & Competitor Breakdown',
    ctaLabel: 'Get Audit',
    businessContactDetails: '/contact?service=marketing',
    bannerUrl: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=400&auto=format&fit=crop&q=80',
    ].join(','),
  },
];

async function seedPromotions() {
  console.log('🌱 Seeding Industry Standard Promoted Businesses...\n');

  // Deactivate any existing dummy test promotions
  await db
    .update(businessPromotions)
    .set({ status: 'draft' })
    .where(
      or(
        eq(businessPromotions.businessName, 'test bussniess'),
        eq(businessPromotions.businessName, 'Startup Launchpad Service'),
        eq(businessPromotions.category, 'TEST BUSSNIESS CATEGORY')
      )
    );

  let insertedCount = 0;

  for (const item of PROMOTED_PROMOTERS) {
    // 1. Check or create User
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, item.email))
      .limit(1);

    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({
          email: item.email,
          passwordHash: '$2a$10$e8wV4WbF.Wk.jJ1L.zZ6u.wJ5Wn5V6rQZ8Z9zXyWvUuTtSsRrQqP',
          phone: '+1 555 019 9988',
          isEmailVerified: true,
          isPhoneVerified: true,
          isActive: true,
          isDeleted: false,
        })
        .returning();

      user = newUser;
      console.log(`  ✅ Created Business Promoter User: "${item.email}"`);

      // Assign Role 3 (business_promoter)
      await db.insert(userRoles).values({
        userId: user.id,
        roleId: 3,
      }).onConflictDoNothing();
    }

    // 2. Check or create Business Promoter Profile
    const [profile] = await db
      .select()
      .from(businessPromoterProfiles)
      .where(eq(businessPromoterProfiles.userId, user.id))
      .limit(1);

    if (!profile) {
      await db.insert(businessPromoterProfiles).values({
        userId: user.id,
        businessName: item.businessName,
        businessCategory: item.category,
        about: item.about,
        logoUrl: item.bannerUrl.split(',')[0],
        purpose: item.purpose,
        contactEmail: item.email,
        contactPhone: '+1 555 019 9988',
        profileCompletion: 90,
      });
      console.log(`  ✅ Created Business Promoter Profile: "${item.businessName}"`);
    }

    // 3. Check or create Active Business Promotion
    const [existingPromo] = await db
      .select()
      .from(businessPromotions)
      .where(eq(businessPromotions.businessName, item.businessName))
      .limit(1);

    if (existingPromo) {
      await db
        .update(businessPromotions)
        .set({
          category: item.category,
          purpose: item.purpose,
          businessDescription: item.businessDescription,
          offerTag: item.offerTag,
          ctaLabel: item.ctaLabel,
          businessContactDetails: item.businessContactDetails,
          bannerUrl: item.bannerUrl,
          status: 'active',
        })
        .where(eq(businessPromotions.id, existingPromo.id));
      console.log(`  ✏️ Updated Active Business Promotion: "${item.businessName}"`);
    } else {
      await db.insert(businessPromotions).values({
        userId: user.id,
        businessName: item.businessName,
        category: item.category,
        purpose: item.purpose,
        businessDescription: item.businessDescription,
        offerTag: item.offerTag,
        ctaLabel: item.ctaLabel,
        businessContactDetails: item.businessContactDetails,
        bannerUrl: item.bannerUrl,
        status: 'active',
      });
      console.log(`  ✅ Created Active Business Promotion: "${item.businessName}"`);
    }

    insertedCount++;
  }

  console.log(`\n🎉 Promoted Businesses Seed complete! ${insertedCount} active promotions seeded.\n`);
}

seedPromotions()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
