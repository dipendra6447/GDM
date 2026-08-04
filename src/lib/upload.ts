import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UploadedFile {
  fieldname: string;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
}

// ─── Upload Config ────────────────────────────────────────────────────────────
const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

const ALLOWED_MIMETYPES: Record<string, string[]> = {
  resume: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  avatar: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  logo: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  banner: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  banner1: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  banner2: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  banner3: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
};

// ─── Ensure Directories ──────────────────────────────────────────────────────
async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// ─── Get Subdirectory by Field Name ──────────────────────────────────────────
function getSubdir(fieldname: string): string {
  if (fieldname === 'resume' || fieldname.startsWith('cert_file_')) return 'resumes';
  if (fieldname === 'avatar' || fieldname === 'logo') return 'avatars';
  if (fieldname.startsWith('banner')) return 'promotions';
  if (fieldname === 'image') return 'categories';
  return 'misc';
}

// ─── Parse FormData and Save Files ───────────────────────────────────────────
/**
 * Parses a Next.js request's FormData, saves any files to disk,
 * and returns both the text fields and uploaded file metadata.
 */
export async function parseFormData(req: NextRequest): Promise<{
  fields: Record<string, string>;
  files: UploadedFile[];
}> {
  const formData = await req.formData();
  const fields: Record<string, string> = {};
  const files: UploadedFile[] = [];

  for (const [key, value] of Array.from(formData.entries())) {
    if (typeof value === 'string') {
      fields[key] = value;
    } else if (value instanceof File) {
      // Ignore empty file inputs submitted by browser forms
      if (!value.size || value.size === 0 || !value.name || value.name === 'undefined') {
        continue;
      }

      // Validate file size
      if (value.size > MAX_FILE_SIZE) {
        throw new Error(`File ${key} exceeds the 10MB limit`);
      }

      // Validate mimetype
      const allowedTypes = ALLOWED_MIMETYPES[key] || Object.values(ALLOWED_MIMETYPES).flat();
      if (value.type && !allowedTypes.includes(value.type)) {
        throw new Error(`Invalid file type for ${key}: ${value.type}`);
      }

      const subdir = getSubdir(key);
      const uploadPath = path.join(UPLOAD_DIR, subdir);
      await ensureDir(uploadPath);

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(value.name) || '.png';
      const filename = `${key}-${uniqueSuffix}${ext}`;
      const filepath = path.join(uploadPath, filename);

      // Write the file to disk
      const buffer = Buffer.from(await value.arrayBuffer());
      await fs.writeFile(filepath, buffer);

      files.push({
        fieldname: key,
        filename,
        filepath: `/uploads/${subdir}/${filename}`,
        mimetype: value.type || 'image/png',
        size: value.size,
      });
    }
  }

  return { fields, files };
}
