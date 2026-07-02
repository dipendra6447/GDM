"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './Login.css';

// ─── Types ────────────────────────────────────────────────────────────────────
type UserRole = 'job_seeker' | 'job_poster' | 'business_promoter';

interface ProfileFields {
  // Job Seeker
  fullName?: string;
  phone?: string;
  location?: string;
  currentJobTitle?: string;
  totalExperienceYears?: number;
  skills?: string;
  // Employer
  companyName?: string;
  industry?: string;
  companySize?: string;
  headquarters?: string;
  hrName?: string;
  hrEmail?: string;
  hrPhone?: string;
  // Business Promoter
  businessName?: string;
  businessCategory?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  gstNumber?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPasswordStrength(pw: string): { level: 'weak' | 'medium' | 'strong'; bars: number } {
  if (pw.length < 8) return { level: 'weak', bars: 1 };
  let score = 0;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  if (score <= 2) return { level: 'weak', bars: 1 };
  if (score <= 3) return { level: 'medium', bars: 2 };
  return { level: 'strong', bars: 3 };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('job_seeker');
  const [profile, setProfile] = useState<ProfileFields>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const formRef = useRef<HTMLDivElement>(null);
  const leftSideRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // ── Entrance animation ────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(leftSideRef.current, { x: -50, opacity: 0, duration: 1, ease: 'power3.out' });
      gsap.from(formRef.current, { y: 30, opacity: 0, duration: 0.8, delay: 0.3, ease: 'power3.out' });
    });
    return () => ctx.revert();
  }, []);

  // ── Animate profile section when role changes ─────────────────────────────
  useEffect(() => {
    if (!isLogin && profileRef.current) {
      gsap.fromTo(profileRef.current,
        { opacity: 0, y: 15, height: 0 },
        { opacity: 1, y: 0, height: 'auto', duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [selectedRole, isLogin]);

  // ── Toggle login ↔ signup ─────────────────────────────────────────────────
  const handleToggle = useCallback(() => {
    gsap.to(formRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.2,
      onComplete: () => {
        setIsLogin(prev => !prev);
        setError('');
        setSuccessMsg('');
        setProfile({});
        gsap.to(formRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
      }
    });
  }, []);

  // ── Profile field updater ─────────────────────────────────────────────────
  const updateProfile = useCallback((field: keyof ProfileFields, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  // ── Form submission ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    // Confirm password check for signup
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body: Record<string, unknown> = { email, password };

    if (!isLogin) {
      body.role = selectedRole;
      // Only include non-empty profile fields
      const cleanProfile: Record<string, unknown> = {};
      Object.entries(profile).forEach(([k, v]) => {
        if (v !== undefined && v !== '') cleanProfile[k] = v;
      });
      if (Object.keys(cleanProfile).length > 0) {
        body.profile = cleanProfile;
      }
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      setSuccessMsg(isLogin ? 'Welcome back! Redirecting...' : 'Account created! Redirecting...');
      setTimeout(() => { router.push('/'); }, 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Password strength ─────────────────────────────────────────────────────
  const strength = getPasswordStrength(password);

  return (
    <div className="auth-page-wrapper">
      {/* Background glow effects */}
      <div className="auth-glow-circle circle-1"></div>
      <div className="auth-glow-circle circle-2"></div>

      {/* Left Branding Side */}
      <div className="auth-split-left" ref={leftSideRef}>
        <div className="auth-brand-text">
          <h1 className="auth-brand-title">
            Unlock Your Next <br /> Career Move.
          </h1>
          <p className="auth-brand-subtitle">
            Join thousands of professionals finding their dream roles at top companies worldwide. Premium roles, exclusive insights, zero noise.
          </p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="auth-split-right">
        <div className="auth-form-container" ref={formRef}>
          <div className="auth-form-header">
            <h2 className="auth-form-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="auth-form-subtitle">
              {isLogin
                ? 'Sign in to access your dashboard'
                : 'Choose your role and get started with JobNest'}
            </p>
          </div>

          {error && <div className="auth-error-msg">{error}</div>}
          {successMsg && <div className="auth-success-msg">{successMsg}</div>}

          {/* GOOGLE OAUTH BUTTON */}
          <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/google`} className="auth-social-btn">
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <div className="auth-divider">or continue with email</div>

          <form onSubmit={handleSubmit}>
            {/* ── Role Selector (signup only) ──────────────────────────────── */}
            {!isLogin && (
              <div className="role-selector">
                <span className="role-selector-label">I am a</span>
                <div className="role-cards">
                  <RoleCard
                    role="job_seeker"
                    icon="🔍"
                    label="Job Seeker"
                    selected={selectedRole}
                    onSelect={setSelectedRole}
                  />
                  <RoleCard
                    role="job_poster"
                    icon="🏢"
                    label="Employer"
                    selected={selectedRole}
                    onSelect={setSelectedRole}
                  />
                  <RoleCard
                    role="business_promoter"
                    icon="📢"
                    label="Business Promoter"
                    selected={selectedRole}
                    onSelect={setSelectedRole}
                  />
                </div>
              </div>
            )}

            {/* ── Email & Password ─────────────────────────────────────────── */}
            <div className="auth-input-group">
              <label className="auth-label" htmlFor="auth-email">Email Address</label>
              <input
                id="auth-email"
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-group">
              <label className="auth-label" htmlFor="auth-password">Password</label>
              <div className="auth-password-wrapper">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button 
                  type="button" 
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                </button>
              </div>
              {/* Password strength indicator (signup only) */}
              {!isLogin && password.length > 0 && (
                <>
                  <div className="password-strength">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`password-strength-bar ${i <= strength.bars ? `filled ${strength.level}` : ''}`} />
                    ))}
                  </div>
                  <div className={`password-strength-text ${strength.level}`}>
                    {strength.level === 'weak' && 'Weak password'}
                    {strength.level === 'medium' && 'Could be stronger'}
                    {strength.level === 'strong' && 'Strong password'}
                  </div>
                </>
              )}
            </div>

            {!isLogin && (
              <div className="auth-input-group">
                <label className="auth-label" htmlFor="auth-confirm-password">Confirm Password</label>
                <div className="auth-password-wrapper">
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    className="auth-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button 
                    type="button" 
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>
            )}

            {/* ── Role-Specific Profile Fields (signup only) ───────────────── */}
            {!isLogin && (
              <div className="profile-section" ref={profileRef}>
                {selectedRole === 'job_seeker' && (
                  <JobSeekerFields profile={profile} updateProfile={updateProfile} />
                )}
                {selectedRole === 'job_poster' && (
                  <EmployerFields profile={profile} updateProfile={updateProfile} />
                )}
                {selectedRole === 'business_promoter' && (
                  <BusinessPromoterFields profile={profile} updateProfile={updateProfile} />
                )}
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="auth-switch-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button type="button" className="auth-switch-link" onClick={handleToggle}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function RoleCard({ role, icon, label, selected, onSelect }: {
  role: UserRole;
  icon: string;
  label: string;
  selected: UserRole;
  onSelect: (r: UserRole) => void;
}) {
  const isActive = selected === role;
  return (
    <label className={`role-card ${isActive ? 'active' : ''}`}>
      <input
        type="radio"
        name="user-role"
        value={role}
        checked={isActive}
        onChange={() => onSelect(role)}
      />
      <div className="role-card-check">
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2 6 5 9 10 3" />
        </svg>
      </div>
      <span className="role-card-icon">{icon}</span>
      <span className="role-card-name">{label}</span>
    </label>
  );
}

// ─── Profile Field Props ──────────────────────────────────────────────────────
interface FieldProps {
  profile: ProfileFields;
  updateProfile: (field: keyof ProfileFields, value: string | number) => void;
}

function JobSeekerFields({ profile, updateProfile }: FieldProps) {
  return (
    <>
      <div className="profile-section-header">
        <div className="profile-section-icon seeker">🔍</div>
        <div>
          <h4 className="profile-section-title">Job Seeker Profile</h4>
          <p className="profile-section-subtitle">Help employers find you faster</p>
        </div>
      </div>
      <div className="profile-fields-grid">
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="js-fullName">Full Name</label>
          <input id="js-fullName" type="text" className="auth-input" placeholder="John Doe"
            value={profile.fullName || ''} onChange={e => updateProfile('fullName', e.target.value)} />
        </div>
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="js-phone">Phone</label>
          <PhoneInput
            country={'in'}
            value={profile.phone || ''}
            onChange={phone => updateProfile('phone', phone)}
            inputClass="auth-input phone-input"
            buttonClass="phone-input-button"
            containerClass="phone-input-container"
          />
        </div>
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="js-location">Location</label>
          <input id="js-location" type="text" className="auth-input" placeholder="Mumbai, India"
            value={profile.location || ''} onChange={e => updateProfile('location', e.target.value)} />
        </div>
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="js-jobTitle">Current Job Title</label>
          <input id="js-jobTitle" type="text" className="auth-input" placeholder="Software Engineer"
            value={profile.currentJobTitle || ''} onChange={e => updateProfile('currentJobTitle', e.target.value)} />
        </div>
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="js-experience">Experience (years)</label>
          <input id="js-experience" type="number" className="auth-input" placeholder="3" min="0" max="60"
            value={profile.totalExperienceYears ?? ''} onChange={e => updateProfile('totalExperienceYears', parseInt(e.target.value) || 0)} />
        </div>
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="js-skills">Key Skills</label>
          <input id="js-skills" type="text" className="auth-input" placeholder="React, Node.js, TypeScript"
            value={profile.skills || ''} onChange={e => updateProfile('skills', e.target.value)} />
        </div>
      </div>
    </>
  );
}

function EmployerFields({ profile, updateProfile }: FieldProps) {
  return (
    <>
      <div className="profile-section-header">
        <div className="profile-section-icon employer">🏢</div>
        <div>
          <h4 className="profile-section-title">Employer Profile</h4>
          <p className="profile-section-subtitle">Tell candidates about your company</p>
        </div>
      </div>
      <div className="profile-fields-grid">
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="emp-companyName">Company Name</label>
          <input id="emp-companyName" type="text" className="auth-input" placeholder="Acme Corp"
            value={profile.companyName || ''} onChange={e => updateProfile('companyName', e.target.value)} />
        </div>
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="emp-industry">Industry</label>
          <input id="emp-industry" type="text" className="auth-input" placeholder="Technology"
            value={profile.industry || ''} onChange={e => updateProfile('industry', e.target.value)} />
        </div>
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="emp-companySize">Company Size</label>
          <select id="emp-companySize" className="auth-select"
            value={profile.companySize || ''} onChange={e => updateProfile('companySize', e.target.value)}>
            <option value="">Select size</option>
            <option value="1-10">1–10 employees</option>
            <option value="11-50">11–50 employees</option>
            <option value="51-200">51–200 employees</option>
            <option value="201-500">201–500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
        </div>
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="emp-headquarters">Headquarters</label>
          <input id="emp-headquarters" type="text" className="auth-input" placeholder="Bangalore, India"
            value={profile.headquarters || ''} onChange={e => updateProfile('headquarters', e.target.value)} />
        </div>
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="emp-hrName">HR Contact Name</label>
          <input id="emp-hrName" type="text" className="auth-input" placeholder="Jane Smith"
            value={profile.hrName || ''} onChange={e => updateProfile('hrName', e.target.value)} />
        </div>
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="emp-hrEmail">HR Email</label>
          <input id="emp-hrEmail" type="email" className="auth-input" placeholder="hr@acme.com"
            value={profile.hrEmail || ''} onChange={e => updateProfile('hrEmail', e.target.value)} />
        </div>
        <div className="auth-input-group full-width">
          <label className="auth-label" htmlFor="emp-hrPhone">HR Phone</label>
          <PhoneInput
            country={'in'}
            value={profile.hrPhone || ''}
            onChange={phone => updateProfile('hrPhone', phone)}
            inputClass="auth-input phone-input"
            buttonClass="phone-input-button"
            containerClass="phone-input-container"
          />
        </div>
      </div>
    </>
  );
}

function BusinessPromoterFields({ profile, updateProfile }: FieldProps) {
  return (
    <>
      <div className="profile-section-header">
        <div className="profile-section-icon promoter">📢</div>
        <div>
          <h4 className="profile-section-title">Business Promoter Profile</h4>
          <p className="profile-section-subtitle">Set up your business for promotion</p>
        </div>
      </div>
      <div className="profile-fields-grid">
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="bp-businessName">Business Name</label>
          <input id="bp-businessName" type="text" className="auth-input" placeholder="My Business LLC"
            value={profile.businessName || ''} onChange={e => updateProfile('businessName', e.target.value)} />
        </div>
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="bp-category">Business Category</label>
          <input id="bp-category" type="text" className="auth-input" placeholder="Education, Retail, etc."
            value={profile.businessCategory || ''} onChange={e => updateProfile('businessCategory', e.target.value)} />
        </div>
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="bp-contactPhone">Contact Phone</label>
          <PhoneInput
            country={'in'}
            value={profile.contactPhone || ''}
            onChange={phone => updateProfile('contactPhone', phone)}
            inputClass="auth-input phone-input"
            buttonClass="phone-input-button"
            containerClass="phone-input-container"
          />
        </div>
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="bp-contactEmail">Contact Email</label>
          <input id="bp-contactEmail" type="email" className="auth-input" placeholder="contact@mybiz.com"
            value={profile.contactEmail || ''} onChange={e => updateProfile('contactEmail', e.target.value)} />
        </div>
        <div className="auth-input-group full-width">
          <label className="auth-label" htmlFor="bp-address">Business Address</label>
          <input id="bp-address" type="text" className="auth-input" placeholder="123 Main St, City"
            value={profile.address || ''} onChange={e => updateProfile('address', e.target.value)} />
        </div>
        <div className="auth-input-group full-width">
          <label className="auth-label" htmlFor="bp-gst">GST Number (optional)</label>
          <input id="bp-gst" type="text" className="auth-input" placeholder="22AAAAA0000A1Z5"
            value={profile.gstNumber || ''} onChange={e => updateProfile('gstNumber', e.target.value)} />
        </div>
      </div>
    </>
  );
}
