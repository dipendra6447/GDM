// ─── Role Constants ────────────────────────────────────────────────────────────
export const ROLES = {
  JOB_SEEKER: 1,
  JOB_POSTER: 2,
  BUSINESS_PROMOTER: 3,
  SUPER_USER: 4,
} as const;

// ─── Cookie Options ────────────────────────────────────────────────────────────
const isProd = process.env.NODE_ENV === 'production';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ('none' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};
