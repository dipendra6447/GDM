/**
 * Seed Subscription Plans — Phase 1 Only
 * 
 * Run: npx tsx src/db/seed-subscription-plans.ts
 * 
 * Seeds all P1 subscription plans from the feature spreadsheet:
 * - Job Seeker: Free (Basic), Plus, Premium
 * - Employer: Free (Basic), Plus, Premium
 * - Business Promoter: Basic, Plus, Premium
 */

import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and } from 'drizzle-orm';
import { subscriptionPlans } from './schema/subscription.schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// ═══════════════════════════════════════════════════════════════════════════════
// JOB SEEKER PLANS (P1 Features Only)
// ═══════════════════════════════════════════════════════════════════════════════

const JOB_SEEKER_PLANS = [
  {
    name: 'Free',
    tier: 'free',
    roleTarget: 'job_seeker',
    dailyPrice: 0,
    weeklyPrice: 0,
    monthlyPrice: 0,
    isPopular: false,
    isBestValue: false,
    features: [
      'Create Profile',
      'Upload Resume',
      'Browse Jobs',
      'Save Up To 20 Jobs',
      'First 10 Job Applications Free',
      'Basic Job Alerts',
      'Limited Company Reviews',
      'Career Blog Access',
      'Basic Application Tracker',
      'Basic Interview Preparation',
      'Standard Resume Visibility',
      'Standard Recruiter Visibility',
    ],
    limits: {
      jobApplications: 10,
      savedJobs: 20,
      jobAlerts: 'basic',
      companyReviews: 'limited',
      applicationTracker: 'basic',
      interviewPrep: 'basic',
      resumeVisibility: 'standard',
      recruiterVisibility: 'standard',
      salaryInsights: false,
      earlyAccessJobs: false,
      downloadCertificates: false,
    },
  },
  {
    name: 'Plus',
    tier: 'plus',
    roleTarget: 'job_seeker',
    dailyPrice: 29,
    weeklyPrice: 99,
    monthlyPrice: 299,
    isPopular: false,
    isBestValue: false,
    features: [
      'Everything in Free',
      'Unlimited Job Applications',
      'Unlimited Saved Jobs',
      'Full Company Reviews',
      'One-Click Apply',
      'Advanced Application Tracker',
      'Advanced Salary Insights',
      'AI Mock Interviews',
      'Featured Resume Visibility',
      'High Recruiter Profile Visibility',
      '24-Hour Early Access to New Jobs',
      'Download Certificates',
    ],
    limits: {
      jobApplications: 'unlimited',
      savedJobs: 'unlimited',
      jobAlerts: 'full',
      companyReviews: 'full',
      oneClickApply: true,
      applicationTracker: 'advanced',
      salaryInsights: 'advanced',
      interviewPrep: 'ai_mock',
      resumeVisibility: 'featured',
      recruiterVisibility: 'high',
      earlyAccessJobs: true,
      downloadCertificates: true,
    },
  },
  {
    name: 'Premium',
    tier: 'premium',
    roleTarget: 'job_seeker',
    dailyPrice: 59,
    weeklyPrice: 199,
    monthlyPrice: 599,
    isPopular: true,
    isBestValue: true,
    features: [
      'Everything in Plus',
      'AI Personalized Job Alerts',
      'Unlimited Applications',
      'Advanced + Insights Application Tracker',
      'Priority Featured Resume Visibility',
      'Highest Priority Recruiter Visibility',
      '24-Hour Early Access to New Jobs',
      'Download Certificates',
      'Dedicated Priority Support',
    ],
    limits: {
      jobApplications: 'unlimited',
      savedJobs: 'unlimited',
      jobAlerts: 'ai_personalized',
      companyReviews: 'full',
      oneClickApply: true,
      applicationTracker: 'advanced_insights',
      salaryInsights: 'advanced',
      interviewPrep: 'ai_mock',
      resumeVisibility: 'priority_featured',
      recruiterVisibility: 'highest_priority',
      earlyAccessJobs: true,
      downloadCertificates: true,
      prioritySupport: true,
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// EMPLOYER PLANS (P1 Features Only)
// ═══════════════════════════════════════════════════════════════════════════════

const EMPLOYER_PLANS = [
  {
    name: 'Free',
    tier: 'free',
    roleTarget: 'job_poster',
    dailyPrice: 0,
    weeklyPrice: 0,
    monthlyPrice: 0,
    isPopular: false,
    isBestValue: false,
    features: [
      'Business Profile',
      'Company Logo & Cover Image',
      'Basic Company Page',
      '3 Active Job Posts',
      'Basic Candidate Search',
      '10/month Resume Downloads',
      'Limited Skill-Based Candidate Search',
      'Search by Location',
      'Search by Experience',
      'Search by Education',
      '20/month Invite Candidates',
      'Basic Applicant Tracking System',
      'Manual Resume Shortlisting',
      'Limited Video Interview Integration',
      'Notes & Candidate Ratings',
      'Basic Candidate Pipeline',
      'Email Notifications',
      'Basic Analytics Dashboard',
    ],
    limits: {
      jobPosts: 3,
      featuredJobPosts: 0,
      candidateSearch: 'basic',
      resumeDownloads: 10,
      skillBasedSearch: 'limited',
      searchByLocation: true,
      searchByExperience: true,
      searchByEducation: true,
      inviteCandidates: 20,
      applicantTracking: 'basic',
      resumeShortlisting: 'manual',
      interviewScheduling: false,
      videoInterview: 'limited',
      candidateRatings: true,
      candidatePipeline: 'basic',
      emailNotifications: true,
      smsNotifications: false,
      analyticsDashboard: 'basic',
      recruiterBadge: false,
      searchByAvailability: false,
      aiCandidateMatching: false,
    },
  },
  {
    name: 'Plus',
    tier: 'plus',
    roleTarget: 'job_poster',
    dailyPrice: 49,
    weeklyPrice: 199,
    monthlyPrice: 599,
    isPopular: false,
    isBestValue: false,
    features: [
      'Everything in Free',
      'Enhanced Company Page',
      '25 Active Job Posts',
      '3/month Featured Job Posts',
      'Advanced Candidate Search',
      '100/month Resume Downloads',
      'AI Powered Skill-Based Search',
      'Search by Location',
      'Search by Experience',
      'Limited Search by Education',
      '250/month Invite Candidates',
      'Advanced Applicant Tracking System',
      'AI Assisted Resume Shortlisting',
      'Interview Scheduling',
      'Unlimited Video Interview Integration',
      'Notes & Candidate Ratings',
      'Advanced Candidate Pipeline',
      'Email Notifications',
      'SMS Notifications',
      'Advanced Analytics Dashboard',
    ],
    limits: {
      jobPosts: 25,
      featuredJobPosts: 3,
      candidateSearch: 'advanced',
      resumeDownloads: 100,
      skillBasedSearch: 'ai_powered',
      searchByLocation: true,
      searchByExperience: true,
      searchByEducation: 'limited',
      inviteCandidates: 250,
      applicantTracking: 'advanced',
      resumeShortlisting: 'ai_assisted',
      interviewScheduling: true,
      videoInterview: 'unlimited',
      candidateRatings: true,
      candidatePipeline: 'advanced',
      emailNotifications: true,
      smsNotifications: true,
      analyticsDashboard: 'advanced',
      recruiterBadge: false,
      searchByAvailability: true,
      aiCandidateMatching: 'basic',
    },
  },
  {
    name: 'Premium',
    tier: 'premium',
    roleTarget: 'job_poster',
    dailyPrice: 99,
    weeklyPrice: 399,
    monthlyPrice: 1199,
    isPopular: true,
    isBestValue: true,
    features: [
      'Everything in Plus',
      'Premium Branding Company Page',
      'Unlimited Active Job Posts',
      'Unlimited Featured Job Posts',
      'Unlimited Candidate Search',
      'Unlimited Resume Downloads',
      'AI Powered Skill-Based Search',
      'Search by Location',
      'Search by Experience',
      'Unlimited Search by Education',
      'Unlimited Invite Candidates',
      'Enterprise Applicant Tracking',
      'AI + Ranking Resume Shortlisting',
      'Interview Scheduling',
      'Unlimited Video Interview Integration',
      'Notes & Candidate Ratings',
      'Custom Stages Candidate Pipeline',
      'Email Notifications',
      'SMS Notifications',
      'Executive Analytics Dashboard',
      'Premium Verified Recruiter Badge',
      'Search by Availability',
      'Advanced AI Candidate Matching',
    ],
    limits: {
      jobPosts: 'unlimited',
      featuredJobPosts: 'unlimited',
      candidateSearch: 'unlimited',
      resumeDownloads: 'unlimited',
      skillBasedSearch: 'ai_powered',
      searchByLocation: true,
      searchByExperience: true,
      searchByEducation: 'unlimited',
      inviteCandidates: 'unlimited',
      applicantTracking: 'enterprise',
      resumeShortlisting: 'ai_ranking',
      interviewScheduling: true,
      videoInterview: 'unlimited',
      candidateRatings: true,
      candidatePipeline: 'custom_stages',
      emailNotifications: true,
      smsNotifications: true,
      analyticsDashboard: 'executive',
      recruiterBadge: 'premium_verified',
      searchByAvailability: true,
      aiCandidateMatching: 'advanced',
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// BUSINESS PROMOTER PLANS (P1 Features Only)
// ═══════════════════════════════════════════════════════════════════════════════

const BUSINESS_PROMOTER_PLANS = [
  {
    name: 'Basic',
    tier: 'basic',
    roleTarget: 'business_promoter',
    dailyPrice: 99,
    weeklyPrice: 499,
    monthlyPrice: 1299,
    isPopular: false,
    isBestValue: false,
    features: [
      'Business Profile',
      'Business Listing',
      'Business Logo',
      'Cover Banner',
      'Business Description',
      'Contact Details',
      'Website Link',
      'Social Media Links',
      'Business Hours',
      '5 Photo Gallery Images',
      '10 Product/Service Listings',
      'Profile Views',
      'Click Analytics',
      'Customer Enquiries',
      '1 Business Category',
      '1 Business Location',
      '1 Team Member',
    ],
    limits: {
      photoGallery: 5,
      productListings: 10,
      businessCategories: 1,
      businessLocations: 1,
      teamMembers: 1,
      coverBanner: 'standard',
      profileViews: true,
      clickAnalytics: true,
      customerEnquiries: true,
      couponsOffers: false,
      eventPromotions: false,
      emailPromotions: false,
    },
  },
  {
    name: 'Plus',
    tier: 'plus',
    roleTarget: 'business_promoter',
    dailyPrice: 199,
    weeklyPrice: 799,
    monthlyPrice: 2499,
    isPopular: true,
    isBestValue: false,
    features: [
      'Everything in Basic',
      'HD Banner',
      '25 Photo Gallery Images',
      '100 Product/Service Listings',
      '5 Business Categories',
      '5 Business Locations',
      'Coupons & Offers',
      'Event Promotions',
      'Monthly Email Promotions',
      '5 Team Members',
    ],
    limits: {
      photoGallery: 25,
      productListings: 100,
      businessCategories: 5,
      businessLocations: 5,
      teamMembers: 5,
      coverBanner: 'hd',
      profileViews: true,
      clickAnalytics: true,
      customerEnquiries: true,
      couponsOffers: true,
      eventPromotions: true,
      emailPromotions: 'monthly',
    },
  },
  {
    name: 'Premium',
    tier: 'premium',
    roleTarget: 'business_promoter',
    dailyPrice: 349,
    weeklyPrice: 1299,
    monthlyPrice: 3999,
    isPopular: false,
    isBestValue: true,
    features: [
      'Everything in Plus',
      'Premium HD Banner',
      'Unlimited Photo Gallery',
      'Unlimited Product/Service Listings',
      'Unlimited Business Categories',
      'Unlimited Business Locations',
      'Unlimited Coupons & Offers',
      'Unlimited Event Promotions',
      'Unlimited Email Promotions',
      'Unlimited Team Members',
    ],
    limits: {
      photoGallery: 'unlimited',
      productListings: 'unlimited',
      businessCategories: 'unlimited',
      businessLocations: 'unlimited',
      teamMembers: 'unlimited',
      coverBanner: 'premium_hd',
      profileViews: true,
      clickAnalytics: true,
      customerEnquiries: true,
      couponsOffers: true,
      eventPromotions: true,
      emailPromotions: 'unlimited',
    },
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SEED EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

async function seed() {
  console.log('🌱 Seeding subscription plans (P1 only)...\n');

  const allPlans = [
    ...JOB_SEEKER_PLANS,
    ...EMPLOYER_PLANS,
    ...BUSINESS_PROMOTER_PLANS,
  ];

  let created = 0;
  let updated = 0;

  for (const plan of allPlans) {
    // Check if a plan with same tier + roleTarget already exists
    const [existing] = await db
      .select()
      .from(subscriptionPlans)
      .where(
        and(
          eq(subscriptionPlans.tier, plan.tier),
          eq(subscriptionPlans.roleTarget, plan.roleTarget)
        )
      )
      .limit(1);

    if (existing) {
      // Update existing plan
      await db
        .update(subscriptionPlans)
        .set({
          name: plan.name,
          dailyPrice: plan.dailyPrice,
          weeklyPrice: plan.weeklyPrice,
          monthlyPrice: plan.monthlyPrice,
          features: plan.features,
          limits: plan.limits,
          isPopular: plan.isPopular,
          isBestValue: plan.isBestValue,
          isActive: true,
          isDeleted: false,
          updatedAt: new Date(),
        })
        .where(eq(subscriptionPlans.id, existing.id));
      console.log(`  ✏️  Updated: ${plan.roleTarget} — ${plan.name} (${plan.tier})`);
      updated++;
    } else {
      // Insert new plan
      await db.insert(subscriptionPlans).values({
        name: plan.name,
        tier: plan.tier,
        roleTarget: plan.roleTarget,
        dailyPrice: plan.dailyPrice,
        weeklyPrice: plan.weeklyPrice,
        monthlyPrice: plan.monthlyPrice,
        features: plan.features,
        limits: plan.limits,
        isPopular: plan.isPopular,
        isBestValue: plan.isBestValue,
        isActive: true,
      });
      console.log(`  ✅ Created: ${plan.roleTarget} — ${plan.name} (${plan.tier})`);
      created++;
    }
  }

  console.log(`\n🎉 Seed complete: ${created} created, ${updated} updated (${allPlans.length} total plans)\n`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
