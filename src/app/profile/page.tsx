"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import JobSeekerProfileForm from '../../components/Profile/JobSeekerProfileForm';
import EmployerProfileForm from '../../components/Profile/EmployerProfileForm';
import BusinessPromoterProfileForm from '../../components/Profile/BusinessPromoterProfileForm';
import ProfileRoleTabs from '../../components/Profile/ProfileRoleTabs';
import ProfileSettings from '../../components/Profile/ProfileSettings';
import AvatarUpload from '../../components/AvatarUpload/AvatarUpload';
import './Profile.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ROLE_LABELS: Record<number, string> = { 1: 'Job Seeker', 2: 'Employer', 3: 'Business Promoter' };
const ROLE_BADGE:  Record<number, string> = { 1: 'role-badge-seeker', 2: 'role-badge-employer', 3: 'role-badge-promoter' };
const ROLE_ICONS:  Record<number, string> = { 1: 'bi-person-badge', 2: 'bi-building', 3: 'bi-megaphone' };

// ── Section Nav Config Per Role ───────────────────────────────────────────
type SectionDef = { id: string; label: string; icon: string };

const SECTIONS_BY_ROLE: Record<number, SectionDef[]> = {
  1: [
    { id: 'personal',   label: 'Personal Info',     icon: 'bi-person' },
    { id: 'experience', label: 'Work Experience',   icon: 'bi-briefcase' },
    { id: 'education',  label: 'Academic',          icon: 'bi-mortarboard' },
    { id: 'certifications', label: 'Certifications', icon: 'bi-patch-check' },
    { id: 'resume',     label: 'Resume & Links',     icon: 'bi-file-earmark-text' },
  ],
  2: [
    { id: 'company-info', label: 'Company Info',     icon: 'bi-building' },
    { id: 'hr-contact',   label: 'HR Contact',       icon: 'bi-person-badge' },
    { id: 'company-links',label: 'Social & Links',   icon: 'bi-link-45deg' },
  ],
  3: [
    { id: 'business-info',   label: 'Business Info',    icon: 'bi-shop' },
    { id: 'contact-details', label: 'Contact Details',  icon: 'bi-telephone' },
    { id: 'social-links',    label: 'Links & Socials',  icon: 'bi-link-45deg' },
  ]
};

// Common settings section always at the bottom
const SETTINGS_SECTION: SectionDef = { id: 'settings', label: 'Settings', icon: 'bi-gear' };

// ── Scroll-spy hook ────────────────────────────────────────────────────────
function useScrollSpy(ids: readonly string[]): string {
  const [activeId, setActiveId] = useState<string>(ids[0] || '');

  // Reset active ID when the available sections change (e.g. role switch)
  useEffect(() => {
    if (ids.length > 0) setActiveId(ids[0]);
  }, [ids]);

  useEffect(() => {
    const handleScroll = () => {
      if (ids.length === 0) return;

      // If the user has scrolled to (or very near) the bottom of the page,
      // activate the last section — covers cases where the final section
      // is too short to ever cross the normal 180px threshold.
      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
      if (scrolledToBottom) {
        setActiveId(ids[ids.length - 1]);
        return;
      }

      let currentActiveId = ids[0];

      for (const id of ids) {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Threshold of 180px accounts for the 80px navbar + padding.
          // The last element in the DOM order that has passed this threshold becomes active.
          if (rect.top <= 180) {
            currentActiveId = id;
          }
        }
      }

      setActiveId(currentActiveId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to set initial state
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [ids]);

  return activeId;
}


// ── Sidebar Nav ────────────────────────────────────────────────────────────
interface SidebarNavProps {
  sections: SectionDef[];
  activeId: string;
  onNavClick: (id: string) => void;
}

function SidebarNav({ sections, activeId, onNavClick }: SidebarNavProps) {
  // Combine role sections with settings
  const allSections = [...sections, SETTINGS_SECTION];
  
  return (
    <nav className="profile-sidebar-nav" aria-label="Profile sections">
      {allSections.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          className={`profile-sidebar-nav-item${activeId === id ? ' active' : ''}${id === 'settings' ? ' mt-3' : ''}`}
          onClick={() => onNavClick(id)}
          aria-current={activeId === id ? 'location' : undefined}
        >
          <i className={`bi ${icon}`} aria-hidden="true" />
          {label}
          {activeId === id && <span className="profile-sidebar-nav-pip" aria-hidden="true" />}
        </button>
      ))}
    </nav>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, isLoading, isLoggedIn, refetch } = useAuth();
  
  // profileDataMap maps roleId -> profileData (allows keeping data for all roles)
  const [profileDataMap, setProfileDataMap] = useState<Record<number, any>>({});
  const [fetching, setFetching] = useState(true);
  
  // State for active role tab (default to first role)
  const [activeRole, setActiveRole] = useState<number>(0);
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Initialize activeRole once user is loaded
  useEffect(() => {
    if (user && user.roles && user.roles.length > 0 && activeRole === 0) {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam) {
          const requestedRole = parseInt(tabParam, 10);
          if (user.roles.includes(requestedRole)) {
            setActiveRole(requestedRole);
            return;
          }
        }
      }
      setActiveRole(user.roles[0]);
    }
  }, [user, activeRole]);

  // Derivations for current role view
  const currentSections = SECTIONS_BY_ROLE[activeRole] || [];
  const sectionIds = [...currentSections.map(s => s.id), SETTINGS_SECTION.id];
  const activeSectionId = useScrollSpy(sectionIds);
  const currentProfileData = profileDataMap[activeRole];

  // ── Fetch ALL profiles for the user's roles ─────────────────────────────
  // Memoize roles as a string to prevent double-fetching when user object reference changes
  const userRolesStr = user?.roles?.join(',') || '';
  
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    
    if (!userRolesStr) return;

    const fetchAllProfiles = async () => {
      try {
        const token = localStorage.getItem('token');
        const roleIdsToFetch = userRolesStr.split(',').map(Number);
        
        const fetchPromises = roleIdsToFetch.map(async (roleId) => {
          const endpoint = 
            roleId === 1 ? '/api/profiles/job-seeker' :
            roleId === 2 ? '/api/profiles/employer' :
            '/api/profiles/business-promoter';
            
          const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (res.ok) {
            const data = await res.json();
            return { roleId, data: data.data };
          }
          return null;
        });

        const results = await Promise.all(fetchPromises);
        
        const newMap: Record<number, any> = {};
        results.forEach(res => {
          if (res) newMap[res.roleId] = res.data;
        });
        
        setProfileDataMap(newMap);
      } catch (err) {
        console.error('Failed to fetch profile data', err);
      } finally {
        setFetching(false);
      }
    };

    fetchAllProfiles();
  }, [userRolesStr, isLoggedIn, isLoading]);

  // ── Avatar upload (tied to active role endpoint) ───────────────────────
  const handleAvatarCrop = async (blob: Blob) => {
    if (!activeRole) return;
    setAvatarPreview(URL.createObjectURL(blob));
    setAvatarUploading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint =
        activeRole === 1 ? '/api/profiles/job-seeker' :
        activeRole === 2 ? '/api/profiles/employer' :
        '/api/profiles/business-promoter';

      const fd = new FormData();
      fd.append('avatar', blob, 'avatar.jpg');

      await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      // Refresh user auth to get updated avatarUrl + completions
      await refetch();
      
      // We don't re-fetch the profile data here directly, though we could
      // refetch is good enough to update the sidebar avatar.
    } catch (e) {
      console.error('Avatar upload failed', e);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleNavClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  if (isLoading || fetching || !activeRole) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-loading-screen">
            <div className="profile-loading-spinner" />
            <p className="profile-loading-text">Loading your profile…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Use the active role's completion if available, fallback to 0
  const completion = user.profileCompletions?.[activeRole.toString()] ?? currentProfileData?.profileCompletion ?? 0;
  
  // Use avatar from auth user first (since it updates via refetch), fallback to role specific
  const avatarSrc = avatarPreview || (user.avatarUrl ? `${API_BASE}${user.avatarUrl}` : undefined) || (currentProfileData?.avatarUrl ? `${API_BASE}${currentProfileData.avatarUrl}` : undefined);

  return (
    <div className="profile-page">
      <div className="profile-page-inner">
        <div className="container">

          {/* ── Page Header ── */}
          <div className="profile-page-header">
            <div className="profile-breadcrumb">
              <Link href="/">Home</Link>
              <i className="bi bi-chevron-right" />
              <span>My Profile</span>
            </div>
            <h1 className="profile-page-title">My Profile</h1>
            <p className="profile-page-subtitle mb-0">Manage your personal info and keep everything up to date.</p>
          </div>

          {/* ── Role Switcher (full-width strip, only for multi-role users) ── */}
          <ProfileRoleTabs 
            roles={user.roles} 
            activeRole={activeRole} 
            onSwitch={(role) => setActiveRole(role)} 
          />

          {/* ── Two-Column Layout ── */}
          <div className="profile-layout">

            {/* ── LEFT: Sidebar ── */}
            <aside className="profile-sidebar-card">

              {/* Avatar + Identity */}
              <div className="profile-sidebar-avatar-section">
                <AvatarUpload currentAvatarUrl={avatarSrc} onCropComplete={handleAvatarCrop} />
                {avatarUploading && (
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
                    <i className="bi bi-arrow-repeat me-1" style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                    Uploading…
                  </p>
                )}
                <p className="profile-sidebar-name">
                  {currentProfileData?.firstName
                    ? [currentProfileData.title, currentProfileData.firstName, currentProfileData.middleName, currentProfileData.lastName].filter(Boolean).join(' ')
                    : currentProfileData?.companyName || currentProfileData?.businessName || user.email.split('@')[0]}
                </p>
                <p className="profile-sidebar-email">{user.email}</p>
                <span className={`profile-sidebar-role-badge ${ROLE_BADGE[activeRole]}`}>
                  <i className={`bi ${ROLE_ICONS[activeRole]}`} />
                  {ROLE_LABELS[activeRole]}
                </span>
              </div>

              {/* Profile Completion (specific to active role tab) */}
              <div className="profile-completion-block">
                <div className="profile-completion-header">
                  <span className="profile-completion-label">
                    {ROLE_LABELS[activeRole]} Profile Strength
                  </span>
                  <span className="profile-completion-pct">{completion}%</span>
                </div>
                <div className="profile-completion-track">
                  <div 
                    className="profile-completion-fill" 
                    style={{ 
                      width: `${completion}%`,
                      background: completion < 50 ? '#ef4444' : completion < 80 ? '#f59e0b' : '#10b981'
                    }} 
                  />
                </div>
                {completion < 100 && (
                  <p className="profile-completion-tip">Fill in the remaining fields to reach 100%</p>
                )}
              </div>

              {/* Scroll-spy Sidebar Nav */}
              <SidebarNav sections={currentSections} activeId={activeSectionId} onNavClick={handleNavClick} />
            </aside>

            {/* ── RIGHT: Form / Main Area ── */}
            <main className="profile-main-card">
              <div className="profile-main-card-header">
                <h2 className="profile-main-card-title">
                  <i className={`bi ${ROLE_ICONS[activeRole]}`} />
                  {ROLE_LABELS[activeRole]} Profile
                </h2>
              </div>
              <div className="profile-main-card-body">
                {activeRole === 1 && <JobSeekerProfileForm initialData={currentProfileData} roleId={1} />}
                {activeRole === 2 && <EmployerProfileForm initialData={currentProfileData} roleId={2} />}
                {activeRole === 3 && <BusinessPromoterProfileForm initialData={currentProfileData} roleId={3} />}
                
                {/* Global Settings Panel (always at bottom) */}
                <ProfileSettings />
              </div>
            </main>

          </div>
        </div>
      </div>
    </div>
  );
}
