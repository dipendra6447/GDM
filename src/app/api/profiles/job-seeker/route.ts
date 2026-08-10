import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { jobSeekerProfiles, users } from '@/db/schema';
import { requireAuth, getAuthFromRequest } from '@/lib/auth';
import { parseFormData } from '@/lib/upload';

// GET /api/profiles/job-seeker
export async function GET(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;
    const [profile] = await db.select().from(jobSeekerProfiles).where(eq(jobSeekerProfiles.userId, userId)).limit(1);

    if (!profile) {
      return NextResponse.json({ success: false, message: 'Profile not found. Please create one.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT /api/profiles/job-seeker (upsert — create or update)
export async function PUT(req: NextRequest) {
  try {
    const authPayload = await requireAuth(req);
    const userId = authPayload.userId;

    const { fields, files } = await parseFormData(req);
    const updateData: any = { ...fields };

    // Handle file uploads
    const resumeFile = files.find(f => f.fieldname === 'resume');
    if (resumeFile) updateData.resumeUrl = resumeFile.filepath;
    const avatarFile = files.find(f => f.fieldname === 'avatar');
    if (avatarFile) updateData.avatarUrl = avatarFile.filepath;

    // Parse JSON objects/arrays if they are strings (from form-data)
    if (typeof updateData.address === 'string') {
      try { updateData.address = JSON.parse(updateData.address); } catch {}
    }
    if (typeof updateData.experience === 'string') {
      try { updateData.experience = JSON.parse(updateData.experience); } catch {}
    }
    if (typeof updateData.education === 'string') {
      try { updateData.education = JSON.parse(updateData.education); } catch {}
    }
    if (typeof updateData.certifications === 'string') {
      try { updateData.certifications = JSON.parse(updateData.certifications); } catch {}
    }
    if (typeof updateData.resumes === 'string') {
      try { updateData.resumes = JSON.parse(updateData.resumes); } catch {}
    }

    if (!Array.isArray(updateData.resumes)) {
      updateData.resumes = [];
    }

    // Handle up to 3 resume files upload
    [0, 1, 2].forEach((index) => {
      const resFile = files.find(f => f.fieldname === `resume_file_${index}` || (index === 0 && f.fieldname === 'resume'));
      if (resFile) {
        if (!updateData.resumes[index]) {
          updateData.resumes[index] = {
            id: String(Date.now() + index),
            title: (fields as any)[`resume_title_${index}`] || updateData.resumeTitle || `Resume ${index + 1}`,
            fileUrl: resFile.filepath,
            isPrimary: index === 0,
            uploadedAt: new Date().toISOString(),
          };
        } else {
          updateData.resumes[index].fileUrl = resFile.filepath;
          if ((fields as any)[`resume_title_${index}`]) {
            updateData.resumes[index].title = (fields as any)[`resume_title_${index}`];
          }
        }
      }
    });

    // Sync primary resumeUrl and resumeTitle from primary resume if present
    if (updateData.resumes.length > 0) {
      const primaryRes = updateData.resumes.find((r: any) => r.isPrimary) || updateData.resumes[0];
      if (primaryRes && primaryRes.fileUrl) {
        updateData.resumeUrl = primaryRes.fileUrl;
        updateData.resumeTitle = primaryRes.title || 'Primary Resume';
      }
    }

    // Assign uploaded certificate files
    if (Array.isArray(updateData.certifications)) {
      updateData.certifications.forEach((cert: any, index: number) => {
        const certFile = files.find(f => f.fieldname === `cert_file_${index}`);
        if (certFile) cert.fileUrl = certFile.filepath;
      });
    }

    // Clean up temporary form field keys that are not DB columns
    Object.keys(updateData).forEach((key) => {
      if (key.startsWith('resume_title_') || key.startsWith('cert_file_') || key.startsWith('portfolio_image_')) {
        delete updateData[key];
      }
    });

    if (updateData.totalExperienceYears) updateData.totalExperienceYears = parseInt(updateData.totalExperienceYears, 10);

    // Fetch current profile to calculate completion properly
    const [currentProfile] = await db.select().from(jobSeekerProfiles).where(eq(jobSeekerProfiles.userId, userId)).limit(1);
    const mergedProfile = { ...(currentProfile || {}), ...updateData };

    // Calculate profile completion percentage
    const completionFields = [
      'title', 'firstName', 'lastName', 'phone', 'alternatePhone', 'alternateEmail', 'address', 'avatarUrl', 'totalExperienceYears',
      'expectedSalary', 'availability', 'summary', 'skills',
      'resumeUrl', 'linkedinUrl', 'githubUrl', 'portfolioUrl'
    ];

    let filledFields = 0;
    completionFields.forEach(field => {
      if (mergedProfile[field as keyof typeof mergedProfile] !== null &&
          mergedProfile[field as keyof typeof mergedProfile] !== undefined &&
          mergedProfile[field as keyof typeof mergedProfile] !== '') {
        filledFields++;
      }
    });

    if (mergedProfile.experience && Array.isArray(mergedProfile.experience) && mergedProfile.experience.length > 0) filledFields++;
    if (mergedProfile.education && Array.isArray(mergedProfile.education) && mergedProfile.education.length > 0) filledFields++;
    if (mergedProfile.certifications && Array.isArray(mergedProfile.certifications) && mergedProfile.certifications.length > 0) filledFields++;

    const totalWeight = completionFields.length + 3;
    updateData.profileCompletion = Math.round((filledFields / totalWeight) * 100);

    // Sync avatarUrl to users table if present
    if (updateData.avatarUrl) {
      try {
        await db.update(users).set({ avatarUrl: updateData.avatarUrl }).where(eq(users.id, userId));
      } catch (e) {
        console.error('Failed to sync avatar to users table:', e);
      }
    }

    // Upsert
    if (currentProfile) {
      const [updated] = await db.update(jobSeekerProfiles).set({ ...updateData, updatedAt: new Date() }).where(eq(jobSeekerProfiles.userId, userId)).returning();
      return NextResponse.json({ success: true, message: 'Profile updated', data: updated });
    } else {
      const [created] = await db.insert(jobSeekerProfiles).values({ userId, ...updateData }).returning();
      return NextResponse.json({ success: true, message: 'Profile created', data: created }, { status: 201 });
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('❌ Profile error:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to update profile' }, { status: 500 });
  }
}
