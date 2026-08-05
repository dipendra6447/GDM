/**
 * Seed Job Categories, Employers, and Jobs with Industry Standard Data
 *
 * Run via: npx tsx src/db/seed-jobs-and-categories.ts
 */

import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import slugify from 'slugify';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { jobCategories } from './schema/category.schema';
import { users, userRoles } from './schema/auth.schema';
import { employerProfiles } from './schema/profile.schema';
import { jobs } from './schema/jobs.schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// ═══════════════════════════════════════════════════════════════════════════════
// 1. INDUSTRY STANDARD JOB CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════
const CATEGORIES = [
  {
    name: 'Technology & Software',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Healthcare & Medicine',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Finance & Banking',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Marketing & Communications',
    imageUrl: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Design & Creative',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sales & Business Development',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Engineering & Construction',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Human Resources & Recruiting',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Education & Academia',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Customer Support & Success',
    imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&auto=format&fit=crop&q=80',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 2. PROPER EMPLOYER ACCOUNTS & PROFILES
// ═══════════════════════════════════════════════════════════════════════════════
const EMPLOYERS = [
  {
    email: 'careers@technova.com',
    companyName: 'TechNova Solutions',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    industry: 'Technology & Software',
    companySize: '201-500',
    foundedYear: 2016,
    about: 'TechNova Solutions is an enterprise software consulting and digital transformation firm delivering cloud-native applications, AI solutions, and high-scalability platforms.',
    headquarters: 'San Francisco, CA',
    websiteUrl: 'https://technovasolutions.com',
    hrName: 'Sarah Jenkins',
    hrEmail: 's.jenkins@technova.com',
  },
  {
    email: 'hiring@apexglobal.com',
    companyName: 'Apex Global Financial',
    logoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&auto=format&fit=crop&q=80',
    industry: 'Finance & Banking',
    companySize: '500+',
    foundedYear: 2010,
    about: 'Apex Global is a premier fintech and investment advisory group empowering institutional clients and high-growth ventures worldwide.',
    headquarters: 'New York, NY',
    websiteUrl: 'https://apexglobalfinancial.com',
    hrName: 'Marcus Vance',
    hrEmail: 'm.vance@apexglobal.com',
  },
  {
    email: 'talent@brightmedia.com',
    companyName: 'BrightMedia Creative',
    logoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200&auto=format&fit=crop&q=80',
    industry: 'Design & Creative',
    companySize: '51-200',
    foundedYear: 2018,
    about: 'BrightMedia is an award-winning digital design, branding, and interactive media agency shaping modern brand identities.',
    headquarters: 'Austin, TX',
    websiteUrl: 'https://brightmediacreative.com',
    hrName: 'Elena Rostova',
    hrEmail: 'elena@brightmedia.com',
  },
  {
    email: 'recruitment@healthplus.org',
    companyName: 'HealthPlus Systems',
    logoUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&auto=format&fit=crop&q=80',
    industry: 'Healthcare & Medicine',
    companySize: '500+',
    foundedYear: 2008,
    about: 'HealthPlus Systems operates modern healthcare clinics and telehealth platforms focused on patient-centered digital health innovations.',
    headquarters: 'Boston, MA',
    websiteUrl: 'https://healthplussystems.org',
    hrName: 'Dr. David Miller',
    hrEmail: 'd.miller@healthplus.org',
  },
  {
    email: 'jobs@cloudscale.io',
    companyName: 'CloudScale Systems',
    logoUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=200&auto=format&fit=crop&q=80',
    industry: 'Technology & Software',
    companySize: '11-50',
    foundedYear: 2021,
    about: 'CloudScale Systems builds next-generation Kubernetes automation tools and multi-cloud infrastructure monitoring suites.',
    headquarters: 'Seattle, WA',
    websiteUrl: 'https://cloudscale.io',
    hrName: 'Jessica Wong',
    hrEmail: 'jwong@cloudscale.io',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 3. INDUSTRY STANDARD JOBS
// ═══════════════════════════════════════════════════════════════════════════════
const INITIAL_JOBS = [
  {
    employerEmail: 'careers@technova.com',
    companyName: 'TechNova Solutions',
    title: 'Senior Full Stack Engineer (React & Node.js)',
    description: `We are looking for a Senior Full Stack Engineer to lead the architecture and development of our flagship cloud analytics dashboard.

Key Responsibilities:
• Architect scalable microservices in Node.js and Next.js.
• Collaborate with product managers and designers to deliver seamless user experiences.
• Optimize application performance and database queries.
• Mentor junior engineers and conduct rigorous code reviews.

Qualifications:
• 5+ years of experience with TypeScript, React, and Node.js.
• Hands-on experience with PostgreSQL, Prisma/Drizzle ORM, and Redis caching.
• Solid understanding of CI/CD pipelines, Docker, and AWS services.`,
    location: 'San Francisco, CA',
    salaryRange: '$130,000 - $160,000',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    experience: 'Senior Level',
    skills: 'React, Node.js, TypeScript, PostgreSQL, GraphQL, Docker, AWS',
    category: 'Technology & Software',
    education: "Bachelor's in Computer Science or equivalent experience",
    benefits: 'Health Insurance, 401(k) Matching, Unlimited PTO, Learning Budget',
  },
  {
    employerEmail: 'careers@technova.com',
    companyName: 'TechNova Solutions',
    title: 'DevOps & Cloud Infrastructure Lead',
    description: `Join TechNova as a DevOps Lead to automate infrastructure deployment and ensure 99.99% system availability across multi-cloud environments.

Responsibilities:
• Manage AWS and Kubernetes production clusters.
• Build automated infrastructure as code using Terraform and CloudFormation.
• Implement robust monitoring, alerting, and observability with Prometheus and Datadog.
• Maintain SOC2 compliance and zero-downtime deployment pipelines.`,
    location: 'Remote',
    salaryRange: '$140,000 - $175,000',
    jobType: 'Full-time',
    workMode: 'Remote',
    experience: 'Senior Level',
    skills: 'AWS, Kubernetes, Terraform, Docker, CI/CD, Python, Linux',
    category: 'Technology & Software',
    education: "Bachelor's in Computer Engineering or related field",
    benefits: 'Full Remote Work, Home Office Setup Allowance, Annual Equity',
  },
  {
    employerEmail: 'hiring@apexglobal.com',
    companyName: 'Apex Global Financial',
    title: 'Financial Analyst & Portfolio Associate',
    description: `Apex Global Financial is seeking a detail-oriented Financial Analyst to conduct equity research, financial modeling, and investment risk assessment.

Key Responsibilities:
• Prepare quarterly valuation models and market forecasting reports.
• Perform fundamental analysis on corporate earnings and macroeconomic trends.
• Assist senior portfolio managers in asset allocation strategies.
• Present analytical insights to executive stakeholders.`,
    location: 'New York, NY',
    salaryRange: '$110,000 - $135,000',
    jobType: 'Full-time',
    workMode: 'On-site',
    experience: 'Mid Level',
    skills: 'Financial Modeling, Excel Valuation, Bloomberg Terminal, SQL, Python',
    category: 'Finance & Banking',
    education: "Bachelor's in Finance, Economics, or CFA Level 1+",
    benefits: 'Performance Bonus, Full Health Benefits, Tuition Reimbursement',
  },
  {
    employerEmail: 'talent@brightmedia.com',
    companyName: 'BrightMedia Creative',
    title: 'Senior UI/UX Product Designer',
    description: `BrightMedia is hiring a UI/UX Designer to craft world-class mobile apps and web platforms for global enterprise clients.

What You Will Do:
• Lead user research, design sprints, wireframing, and interactive prototyping in Figma.
• Develop comprehensive design systems and component libraries.
• Validate designs through usability testing and customer feedback.
• Partner closely with frontend developers to ensure pixel-perfect execution.`,
    location: 'Austin, TX',
    salaryRange: '$100,000 - $130,000',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    experience: 'Senior Level',
    skills: 'Figma, UI/UX Design, Prototyping, Design Systems, User Research, Motion Graphics',
    category: 'Design & Creative',
    education: "Bachelor's in Graphic Design, HCI, or equivalent portfolio",
    benefits: 'Flexible Hours, Creative Stipend, Health & Wellness Allowance',
  },
  {
    employerEmail: 'recruitment@healthplus.org',
    companyName: 'HealthPlus Systems',
    title: 'Telehealth Operations & Patient Coordinator',
    description: `HealthPlus Systems is looking for a Telehealth Coordinator to streamline virtual consultations, manage patient scheduling, and ensure HIPAA-compliant care delivery.

Duties:
• Coordinate digital appointments between patients and medical specialists.
• Handle incoming inquiries and manage patient record workflows in EHR software.
• Maintain compliance with healthcare privacy regulations.`,
    location: 'Boston, MA',
    salaryRange: '$65,000 - $80,000',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    experience: 'Mid Level',
    skills: 'EHR Management, Healthcare Administration, Customer Service, HIPAA Compliance',
    category: 'Healthcare & Medicine',
    education: "Bachelor's in Healthcare Administration or Nursing",
    benefits: 'Comprehensive Medical & Dental Coverage, Paid Sick Leave',
  },
  {
    employerEmail: 'jobs@cloudscale.io',
    companyName: 'CloudScale Systems',
    title: 'Backend Systems Engineer (Go & Microservices)',
    description: `CloudScale Systems is scaling its backend infrastructure team. We build high-throughput Distributed Microservices handling millions of API requests daily.

Your Impact:
• Write clean, high-performance Go code for cloud controllers and distributed caching engines.
• Optimize gRPC services and message queues (Kafka / RabbitMQ).
• Debug performance bottlenecks in distributed cloud environments.`,
    location: 'Seattle, WA',
    salaryRange: '$135,000 - $165,000',
    jobType: 'Full-time',
    workMode: 'Remote',
    experience: 'Mid Level',
    skills: 'Go (Golang), gRPC, Kafka, Docker, Kubernetes, PostgreSQL, Distributed Systems',
    category: 'Technology & Software',
    education: "Bachelor's in Computer Science",
    benefits: 'Competitive Salary, Stock Options, Remote Flexible Policy',
  },
  {
    employerEmail: 'talent@brightmedia.com',
    companyName: 'BrightMedia Creative',
    title: 'Growth Marketing & Social Media Strategist',
    description: `Looking for a data-driven Growth Marketer to lead organic and paid acquisition campaigns across LinkedIn, Meta, Google Ads, and Twitter.

Responsibilities:
• Develop viral content strategies and manage brand social media accounts.
• Optimize multi-channel ad spend to drive qualified leads.
• Analyze campaign conversion funnels using Google Analytics 4 and HubSpot.`,
    location: 'Austin, TX',
    salaryRange: '$85,000 - $105,000',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    experience: 'Mid Level',
    skills: 'SEO, Performance Marketing, Google Ads, Content Strategy, Analytics, Copywriting',
    category: 'Marketing & Communications',
    education: "Bachelor's in Marketing, Journalism, or Business",
    benefits: 'Gym Membership, Annual Retreats, Paid Family Leave',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SEED EXECUTION SCRIPT
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('🌱 Starting Job Categories, Employers, and Jobs Database Seeding...\n');

  // 1. Seed Categories
  console.log('📦 Seeding Job Categories...');
  let catInserted = 0;
  for (const cat of CATEGORIES) {
    const [existing] = await db
      .select()
      .from(jobCategories)
      .where(eq(jobCategories.name, cat.name))
      .limit(1);

    if (!existing) {
      await db.insert(jobCategories).values({
        name: cat.name,
        imageUrl: cat.imageUrl,
        isActive: true,
        isDeleted: false,
      });
      console.log(`  ✅ Inserted category: "${cat.name}"`);
      catInserted++;
    } else {
      console.log(`  ℹ️ Category already exists: "${cat.name}"`);
    }
  }

  // 2. Seed Employers & Employer Profiles
  console.log('\n🏢 Seeding Employers & Employer Profiles...');
  const employerIdMap: Record<string, string> = {};

  for (const emp of EMPLOYERS) {
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, emp.email))
      .limit(1);

    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({
          email: emp.email,
          passwordHash: '$2a$10$e8wV4WbF.Wk.jJ1L.zZ6u.wJ5Wn5V6rQZ8Z9zXyWvUuTtSsRrQqP', // Dummy hashed password
          phone: '+1 555 019 2831',
          isEmailVerified: true,
          isPhoneVerified: true,
          isActive: true,
          isDeleted: false,
        })
        .returning();

      user = newUser;
      console.log(`  ✅ Created employer user: "${emp.email}"`);

      // Assign Role 2 (job_poster / employer)
      await db.insert(userRoles).values({
        userId: user.id,
        roleId: 2,
      }).onConflictDoNothing();
    } else {
      console.log(`  ℹ️ Employer user already exists: "${emp.email}"`);
    }

    employerIdMap[emp.email] = user.id;

    // Check or create Employer Profile
    const [profile] = await db
      .select()
      .from(employerProfiles)
      .where(eq(employerProfiles.userId, user.id))
      .limit(1);

    if (!profile) {
      await db.insert(employerProfiles).values({
        userId: user.id,
        companyName: emp.companyName,
        logoUrl: emp.logoUrl,
        industry: emp.industry,
        companySize: emp.companySize,
        foundedYear: emp.foundedYear,
        about: emp.about,
        headquarters: emp.headquarters,
        websiteUrl: emp.websiteUrl,
        hrName: emp.hrName,
        hrEmail: emp.hrEmail,
        profileCompletion: 95,
      });
      console.log(`  ✅ Created employer profile for: "${emp.companyName}"`);
    } else {
      console.log(`  ℹ️ Employer profile already exists for: "${emp.companyName}"`);
    }
  }

  // 3. Seed Jobs
  console.log('\n💼 Seeding Jobs...');
  let jobsInserted = 0;

  for (const item of INITIAL_JOBS) {
    const employerId = employerIdMap[item.employerEmail];
    if (!employerId) {
      console.warn(`  ⚠️ Employer ID not found for email: ${item.employerEmail}`);
      continue;
    }

    const baseSlug = slugify(item.title, { lower: true, strict: true });
    const uniqueSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    await db.insert(jobs).values({
      employerId,
      title: item.title,
      slug,
      description: item.description,
      companyName: item.companyName,
      location: item.location,
      salaryRange: item.salaryRange,
      jobType: item.jobType,
      workMode: item.workMode,
      experience: item.experience,
      skills: item.skills,
      category: item.category,
      education: item.education,
      benefits: item.benefits,
      isActive: true,
      isDeleted: false,
    });

    console.log(`  ✅ Posted job: "${item.title}" (${item.companyName})`);
    jobsInserted++;
  }

  console.log(`\n🎉 Seeding complete! Added ${catInserted} categories, ${EMPLOYERS.length} employers, and ${jobsInserted} jobs.\n`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
