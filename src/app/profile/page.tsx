"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar/Navbar';
import JobSeekerProfileForm from '../../components/Profile/JobSeekerProfileForm';
import EmployerProfileForm from '../../components/Profile/EmployerProfileForm';
import BusinessPromoterProfileForm from '../../components/Profile/BusinessPromoterProfileForm';
import ProfileRoleTabs from '../../components/Profile/ProfileRoleTabs';
import ProfileSettings from '../../components/Profile/ProfileSettings';
import AvatarUpload from '../../components/AvatarUpload/AvatarUpload';
import DeleteAccountModal from '../../components/Profile/DeleteAccountModal';
import './Profile.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

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

  useEffect(() => {
    if (ids.length > 0) setActiveId(ids[0]);
  }, [ids]);

  useEffect(() => {
    const handleScroll = () => {
      if (ids.length === 0) return;

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
          if (rect.top <= 180) {
            currentActiveId = id;
          }
        }
      }

      setActiveId(currentActiveId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
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
  const { user, isLoading, isLoggedIn, refetch, activeRole: globalActiveRole, switchRole } = useAuth();
  const router = useRouter();
  
  const [profileDataMap, setProfileDataMap] = useState<Record<number, any>>({});
  const [fetching, setFetching] = useState(true);
  
  const [activeRole, setActiveRole] = useState<number>(0);
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);

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
      setActiveRole(globalActiveRole || user.roles[0]);
    }
  }, [user, activeRole, globalActiveRole]);

  const handleRoleSwitch = (role: number) => {
    setActiveRole(role);
    localStorage.setItem('activeRole', String(role));
    router.push(`/profile?tab=${role}`, { scroll: false });
  };

  const currentSections = SECTIONS_BY_ROLE[activeRole] || [];
  const sectionIds = [...currentSections.map(s => s.id), SETTINGS_SECTION.id];
  const activeSectionId = useScrollSpy(sectionIds);
  const currentProfileData = profileDataMap[activeRole];

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
      await refetch();
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
      <>
        <Navbar variant="minimal" />
        <div className="profile-page">
          <div className="container">
            <div className="profile-loading-screen">
              <div className="profile-loading-spinner" />
              <p className="profile-loading-text">Loading your profile…</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) return null;

  const completion = user.profileCompletions?.[activeRole.toString()] ?? currentProfileData?.profileCompletion ?? 0;
  const avatarSrc = avatarPreview || (user.avatarUrl ? `${API_BASE}${user.avatarUrl}` : undefined) || (currentProfileData?.avatarUrl ? `${API_BASE}${currentProfileData.avatarUrl}` : undefined);
  const homeHref = activeRole === 2 ? '/employer' : activeRole === 3 ? '/dashboard' : '/seeker';

  return (
    <>
      <Navbar variant="minimal" />
      <div className="profile-page">
        <div className="profile-page-inner">
          <div className="container">

            {/* ── Page Header ── */}
            <div className="profile-page-header d-flex justify-content-between align-items-end flex-wrap gap-3">
              <div>
                <div className="profile-breadcrumb">
                  <Link href={homeHref}>Home</Link>
                  <i className="bi bi-chevron-right" />
                  <span>My Profile</span>
                </div>
                <h1 className="profile-page-title">My Profile</h1>
                <p className="profile-page-subtitle mb-0">Manage your personal info and keep everything up to date.</p>
              </div>

              {/* Add / Switch Role Option for Single-Role User */}
              {(!user.roles || user.roles.length <= 1) && (
                <button
                  type="button"
                  className="btn btn-sm d-flex align-items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
                    color: '#000000',
                    fontWeight: 700,
                    padding: '10px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(212,175,55,0.25)',
                    fontSize: '0.875rem'
                  }}
                  onClick={() => setShowAddRoleModal(true)}
                >
                  <i className="bi bi-person-plus-fill fs-6" />
                  <span>Add / Register Another Role</span>
                </button>
              )}
            </div>

            {/* ── Role Switcher (full-width strip, only for multi-role users) ── */}
            {user.roles && user.roles.length > 1 && (
              <ProfileRoleTabs 
                roles={user.roles} 
                activeRole={activeRole} 
                onSwitch={handleRoleSwitch} 
              />
            )}

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

                {/* Profile Completion */}
                <div className="profile-completion-block">
                  <div className="profile-completion-header d-flex justify-content-between align-items-center mb-2">
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

                {/* Danger Zone Link */}
                <div className="mt-4 pt-3 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <button 
                    className="btn btn-link text-danger text-decoration-none p-0" 
                    style={{ fontSize: '0.85rem' }}
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <i className="bi bi-trash3 me-1"></i> Delete Account
                  </button>
                </div>
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
                  
                  {/* Global Settings Panel */}
                  <ProfileSettings />
                </div>
              </main>

            </div>
          </div>
        </div>
        
        {/* Modals */}
        <DeleteAccountModal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
        
        {/* Single-Role User: Role Selection Upgrade Modal */}
        {showAddRoleModal && (
          <div className="role-modal-overlay">
            <div className="role-modal-content" style={{ maxWidth: '520px', borderRadius: '20px', padding: '28px', background: 'var(--color-white)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}>
              <button className="role-modal-close" onClick={() => setShowAddRoleModal(false)} type="button" style={{ color: 'var(--color-text-gray)' }}>
                <i className="bi bi-x-lg" />
              </button>
              
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '56px', height: '56px', background: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37', fontSize: '1.5rem' }}>
                  <i className="bi bi-plus-circle-fill" />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-navy)', margin: '0 0 6px' }}>Add Another Role</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-gray)', margin: 0 }}>Select a role below to sign up and expand your capabilities on JobNest.</p>
              </div>

              <div className="d-flex flex-column gap-3 mb-4">
                {(!user.roles || !user.roles.includes(1)) && (
                  <button
                    type="button"
                    className="btn text-start p-3 border d-flex align-items-center justify-content-between rounded-3"
                    style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-dark)', boxShadow: 'var(--shadow-sm)' }}
                    onClick={() => {
                      setShowAddRoleModal(false);
                      router.push('/register?role=job_seeker');
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 rounded-3 text-white" style={{ background: '#2454FF' }}>
                        <i className="bi bi-person-badge fs-4"></i>
                      </div>
                      <div>
                        <strong className="d-block" style={{ fontSize: '0.95rem', color: 'var(--color-navy)' }}>Job Seeker</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-gray)' }}>Apply for jobs, track applications, upload resume</span>
                      </div>
                    </div>
                    <i className="bi bi-chevron-right text-muted"></i>
                  </button>
                )}

                {(!user.roles || !user.roles.includes(2)) && (
                  <button
                    type="button"
                    className="btn text-start p-3 border d-flex align-items-center justify-content-between rounded-3"
                    style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-dark)', boxShadow: 'var(--shadow-sm)' }}
                    onClick={() => {
                      setShowAddRoleModal(false);
                      router.push('/register?role=job_poster');
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 rounded-3 text-dark" style={{ background: '#D4AF37' }}>
                        <i className="bi bi-building fs-4"></i>
                      </div>
                      <div>
                        <strong className="d-block" style={{ fontSize: '0.95rem', color: 'var(--color-navy)' }}>Employer / Job Poster</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-gray)' }}>Post job openings, manage candidates, recruit talent</span>
                      </div>
                    </div>
                    <i className="bi bi-chevron-right text-muted"></i>
                  </button>
                )}

                {(!user.roles || !user.roles.includes(3)) && (
                  <button
                    type="button"
                    className="btn text-start p-3 border d-flex align-items-center justify-content-between rounded-3"
                    style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-dark)', boxShadow: 'var(--shadow-sm)' }}
                    onClick={() => {
                      setShowAddRoleModal(false);
                      router.push('/register?role=business_promoter');
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="p-2 rounded-3 text-white" style={{ background: '#10b981' }}>
                        <i className="bi bi-megaphone fs-4"></i>
                      </div>
                      <div>
                        <strong className="d-block" style={{ fontSize: '0.95rem', color: 'var(--color-navy)' }}>Business Promoter</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-gray)' }}>Promote services, feature products, run ad campaigns</span>
                      </div>
                    </div>
                    <i className="bi bi-chevron-right text-muted"></i>
                  </button>
                )}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-link text-muted text-decoration-none"
                  onClick={() => setShowAddRoleModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
