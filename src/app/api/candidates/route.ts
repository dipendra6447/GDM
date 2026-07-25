import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { jobSeekerProfiles, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

interface CandidateCard {
  id: string;
  name: string;
  avatar: string;
  avatarUrl?: string | null;
  role: string;
  experience: string;
  location: string;
  salary: string;
  skills: string[];
  category: string;
  verified: boolean;
  resumeUrl?: string | null;
}

const SEED_CANDIDATES: CandidateCard[] = [
  {
    id: "seed-1",
    name: "Alex Rivera",
    avatar: "AR",
    role: "Senior Full-Stack Engineer",
    experience: "7+ Years Exp",
    location: "Remote / San Francisco",
    salary: "$140,000 / yr",
    skills: ["React", "Node.js", "TypeScript", "GraphQL", "AWS"],
    category: "engineering",
    verified: true
  },
  {
    id: "seed-2",
    name: "Sophia Chen",
    avatar: "SC",
    role: "Lead UI/UX Product Designer",
    experience: "6+ Years Exp",
    location: "New York, NY",
    salary: "$125,000 / yr",
    skills: ["Figma", "Design System", "User Research", "Prototyping"],
    category: "design",
    verified: true
  },
  {
    id: "seed-3",
    name: "Marcus Vance",
    avatar: "MV",
    role: "DevOps & Cloud Architect",
    experience: "8+ Years Exp",
    location: "Remote / Austin, TX",
    salary: "$150,000 / yr",
    skills: ["Kubernetes", "Docker", "Terraform", "AWS", "CI/CD"],
    category: "engineering",
    verified: true
  },
  {
    id: "seed-4",
    name: "Elena Rostova",
    avatar: "ER",
    role: "Senior Data Scientist & AI Lead",
    experience: "5+ Years Exp",
    location: "Chicago, IL",
    salary: "$135,000 / yr",
    skills: ["Python", "PyTorch", "LLMs", "Pandas", "Scikit-Learn"],
    category: "data",
    verified: true
  },
  {
    id: "seed-5",
    name: "David Kim",
    avatar: "DK",
    role: "Growth Product Manager",
    experience: "6+ Years Exp",
    location: "Seattle, WA",
    salary: "$130,000 / yr",
    skills: ["Product Strategy", "Agile", "SQL", "Mixpanel", "A/B Testing"],
    category: "product",
    verified: true
  },
  {
    id: "seed-6",
    name: "Jessica Taylor",
    avatar: "JT",
    role: "Lead Frontend Developer",
    experience: "5+ Years Exp",
    location: "Remote / Boston",
    salary: "$120,000 / yr",
    skills: ["Next.js", "Vue.js", "Tailwind CSS", "Redux", "Jest"],
    category: "engineering",
    verified: true
  }
];

function getInitials(name: string): string {
  if (!name) return 'CN';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function inferCategory(role: string, skills: string[]): string {
  const text = (role + ' ' + skills.join(' ')).toLowerCase();
  if (text.includes('design') || text.includes('ux') || text.includes('ui') || text.includes('figma')) return 'design';
  if (text.includes('data') || text.includes('ai') || text.includes('machine learning') || text.includes('python') || text.includes('pytorch')) return 'data';
  if (text.includes('product') || text.includes('pm') || text.includes('scrum') || text.includes('agile')) return 'product';
  return 'engineering';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'all';
    const search = searchParams.get('search') || '';

    let dbCandidates: CandidateCard[] = [];

    try {
      const profiles = await db
        .select({
          profile: jobSeekerProfiles,
          user: users,
        })
        .from(jobSeekerProfiles)
        .leftJoin(users, eq(jobSeekerProfiles.userId, users.id))
        .orderBy(desc(jobSeekerProfiles.updatedAt))
        .limit(20);

      dbCandidates = profiles.map(({ profile, user }) => {
        const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || user?.email?.split('@')[0] || 'Candidate';
        const role = profile.experience?.[0]?.jobTitle || profile.summary?.slice(0, 40) || 'Software Professional';
        const skillsList = profile.skills
          ? profile.skills.split(',').map(s => s.trim()).filter(Boolean)
          : ['JavaScript', 'React', 'Problem Solving'];
        
        const loc = profile.address?.city
          ? `${profile.address.city}, ${profile.address.state || profile.address.country || ''}`
          : 'Remote';

        const cat = inferCategory(role, skillsList);

        return {
          id: profile.userId,
          name: fullName,
          avatar: getInitials(fullName),
          avatarUrl: profile.avatarUrl || user?.avatarUrl,
          role,
          experience: `${profile.totalExperienceYears || 3}+ Years Exp`,
          location: loc,
          salary: profile.expectedSalary || '$100,000 / yr',
          skills: skillsList.slice(0, 5),
          category: cat,
          verified: (profile.profileCompletion || 0) >= 60,
          resumeUrl: profile.resumeUrl,
        };
      });
    } catch (dbErr) {
      console.warn('⚠️ Could not fetch candidates from DB, using fallback dynamic pool:', dbErr);
    }

    // Merge database candidates with seed candidates
    let allCandidates = [...dbCandidates];
    
    // Add seeds that don't duplicate DB candidates
    SEED_CANDIDATES.forEach(seed => {
      if (!allCandidates.some(c => c.name.toLowerCase() === seed.name.toLowerCase())) {
        allCandidates.push(seed);
      }
    });

    // Apply category filter
    if (category && category !== 'all') {
      allCandidates = allCandidates.filter(c => c.category === category.toLowerCase());
    }

    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      allCandidates = allCandidates.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.skills.some(s => s.toLowerCase().includes(q)) ||
        c.location.toLowerCase().includes(q)
      );
    }

    return NextResponse.json(
      {
        success: true,
        count: allCandidates.length,
        data: allCandidates,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    console.error('❌ GET /api/candidates error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch candidates' }, { status: 500 });
  }
}
