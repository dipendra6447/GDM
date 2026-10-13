"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface DashboardProfileHeroProps {
  role?: 1 | 2 | 3;
  user?: any;
  bannerImage?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  customTabs?: Array<{ id: string; label: string; icon?: string }>;
}

const roleBanners: Record<number, string> = {
  1: '/images/banner_jobseeker.jpg',
  2: '/images/banner_employer.jpg',
  3: '/images/banner_business.jpg',
};

export default function DashboardProfileHero({
  role = 1,
  user,
  bannerImage,
  activeTab = 'overview',
  onTabChange,
  customTabs,
}: DashboardProfileHeroProps) {
  const targetCover = bannerImage || roleBanners[role] || '/images/dashboard_cover_sunset.jpg';
  const [coverPhoto, setCoverPhoto] = useState(targetCover);
  const [hasCustomUpload, setHasCustomUpload] = useState(false);
  const [avatarPhoto, setAvatarPhoto] = useState(
    user?.avatarUrl || '/images/dashboard_user_michael.jpg'
  );
  const [copiedShare, setCopiedShare] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hasCustomUpload) {
      setCoverPhoto(bannerImage || roleBanners[role] || '/images/dashboard_cover_sunset.jpg');
    }
  }, [role, bannerImage, hasCustomUpload]);

  const isEmployer = role === 2;
  const isBusiness = role === 3;

  const displayName = isEmployer
    ? user?.name || 'Michael Sargent'
    : isBusiness
    ? user?.name || 'Michael Sargent'
    : user?.name || 'Michael Sargent';

  const headline = isEmployer
    ? 'Hiring Manager | Talent Acquisition | Tech Solutions Inc. | Building Great Teams'
    : isBusiness
    ? 'Business Owner | Allen Auto Repair | Premier Automotive Services & Community Growth'
    : 'Entrepreneur | Web Developer | Business Growth | Connecting People to Opportunity';

  const bio = isEmployer
    ? 'Driving talent acquisition, technical recruitment, and team expansion across GoDiscoverMe. Connecting top developers and managers with high-impact careers.'
    : isBusiness
    ? 'Delivering high-quality automotive repair, reliable customer service, and community-driven business solutions for over 10 years in Dayton, OH.'
    : 'Passionate about creating solutions that help people, businesses, and communities grow. Building GoDiscoverMe to make opportunity more accessible for everyone.';

  const statusLabel = isEmployer
    ? 'Actively Hiring'
    : isBusiness
    ? 'Verified Business'
    : 'Open to Opportunities';

  const tags = isEmployer
    ? ['Software Engineering', 'Product Management', 'Technical Recruiting', 'Team Leadership', 'Hiring Strategy']
    : isBusiness
    ? ['Auto Repair', 'Brake Service', 'Engine Diagnostics', 'Oil Change', 'Customer Care']
    : ['Web Development', 'Business Strategy', 'Project Management', 'Marketing', 'Networking'];

  const addTagLabel = isEmployer ? '+ Add Requirement' : isBusiness ? '+ Add Service' : '+ Add Skill';

  // Default tabs per role if customTabs not provided
  const tabs = customTabs || (
    isEmployer
      ? [
          { id: 'overview', label: 'Overview', icon: 'bi-grid-fill' },
          { id: 'jobs', label: 'Manage Jobs', icon: 'bi-briefcase-fill' },
          { id: 'post', label: 'Post a Job', icon: 'bi-plus-circle-fill' },
          { id: 'candidates', label: 'Candidates', icon: 'bi-people-fill' },
          { id: 'applications', label: 'Applications', icon: 'bi-file-earmark-text-fill' },
          { id: 'subscription', label: 'Subscription', icon: 'bi-credit-card-fill' },
          { id: 'activity', label: 'Activity', icon: 'bi-activity' },
        ]
      : isBusiness
      ? [
          { id: 'overview', label: 'Overview', icon: 'bi-grid-fill' },
          { id: 'campaigns', label: 'My Campaigns', icon: 'bi-megaphone-fill' },
          { id: 'post', label: 'Create Ad', icon: 'bi-plus-circle-fill' },
          { id: 'analytics', label: 'Analytics', icon: 'bi-graph-up' },
          { id: 'services', label: 'Services', icon: 'bi-tools' },
          { id: 'collage', label: 'Collage Maker', icon: 'bi-images' },
          { id: 'subscription', label: 'Subscription', icon: 'bi-credit-card-fill' },
        ]
      : [
          { id: 'overview', label: 'Overview', icon: 'bi-sparkles' },
          { id: 'experience', label: 'Experience', icon: 'bi-briefcase' },
          { id: 'skills', label: 'Skills', icon: 'bi-award' },
          { id: 'services', label: 'Services', icon: 'bi-tools' },
          { id: 'portfolio', label: 'Portfolio', icon: 'bi-folder2-open' },
          { id: 'posts', label: 'Posts', icon: 'bi-chat-square-quote' },
          { id: 'jobs', label: 'Jobs', icon: 'bi-briefcase' },
          { id: 'saved', label: 'Saved', icon: 'bi-bookmark' },
          { id: 'activity', label: 'Activity', icon: 'bi-activity' },
        ]
  );

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setCoverPhoto(url);
      setHasCustomUpload(true);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setAvatarPhoto(url);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="dash-hero-container">
      {/* 1. Panoramic Role Banner */}
      <div className="dash-hero-card">
        <div className="dash-cover-container">
          <Image
            src={coverPhoto}
            alt={
              isEmployer
                ? 'Corporate Headquarters Banner'
                : isBusiness
                ? 'Commercial Business District Banner'
                : 'Job Seeker City Skyline Banner'
            }
            fill
            priority
            className="dash-cover-img"
            onError={() => {
              if (coverPhoto !== '/images/dashboard_cover_sunset.jpg') {
                setCoverPhoto('/images/dashboard_cover_sunset.jpg');
              }
            }}
          />
          <button
            type="button"
            className="dash-edit-cover-btn"
            onClick={() => coverInputRef.current?.click()}
            id="dash-edit-cover-btn"
          >
            <i className="bi bi-camera-fill" />
            <span>Edit Cover Photo</span>
          </button>
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>

        {/* 2. Profile Details Bar */}
        <div className="dash-profile-meta-bar">
          <div className="dash-avatar-actions-row">
            {/* Overlapping Avatar */}
            <div className="dash-avatar-wrapper">
              <Image
                src={avatarPhoto}
                alt={displayName}
                width={100}
                height={100}
                priority
                className="dash-avatar-img"
              />
              <button
                type="button"
                className="dash-avatar-camera-btn"
                onClick={() => avatarInputRef.current?.click()}
                title="Change Avatar"
                aria-label="Change profile photo"
                id="dash-change-avatar-btn"
              >
                <i className="bi bi-camera-fill" />
              </button>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>

            {/* Action Buttons: Edit Profile, Share, More Options */}
            <div className="dash-profile-actions">
              <Link
                href={`/profile?tab=${role}`}
                className="dash-btn-primary"
                id="dash-edit-profile-btn"
              >
                <i className="bi bi-pencil-square" />
                <span>Edit Profile</span>
              </Link>

              <button
                type="button"
                className="dash-btn-icon-glass"
                onClick={handleShare}
                title={copiedShare ? 'Copied Link!' : 'Share Profile'}
                aria-label="Share profile"
                id="dash-share-profile-btn"
              >
                <i className={copiedShare ? 'bi bi-check-lg text-success' : 'bi bi-share'} />
              </button>

              <button
                type="button"
                className="dash-btn-icon-glass"
                title="More Options"
                aria-label="More options"
                id="dash-more-options-btn"
              >
                <i className="bi bi-three-dots" />
              </button>
            </div>
          </div>

          {/* Name & Verified Badge */}
          <div className="dash-name-row">
            <h2 className="dash-name-title">{displayName}</h2>
            <i className="bi bi-patch-check-fill dash-badge-verified" title="Verified Member" />
          </div>

          {/* Location & Status */}
          <div className="dash-status-row">
            <span><i className="bi bi-geo-alt-fill text-muted me-1" />Dayton, OH</span>
            <span>•</span>
            <span className="d-inline-flex align-items-center gap-1">
              <span className="status-dot-green" />
              <span>{statusLabel}</span>
            </span>
          </div>

          {/* Headline */}
          <p className="dash-headline-text">{headline}</p>

          {/* Bio */}
          <p className="dash-bio-text">{bio}</p>

          {/* Skill Tag Pills */}
          <div className="dash-tags-row">
            {tags.map((tag) => (
              <span key={tag} className="dash-tag-pill">
                {tag}
              </span>
            ))}
            <Link href={`/profile?tab=${role}`} className="dash-tag-pill add-btn">
              {addTagLabel}
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Navigation Tabs matching mockup */}
      <div className="dash-nav-strip" role="tablist" aria-label="Profile navigation">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`dash-nav-tab ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange && onTabChange(tab.id)}
              id={`dash-tab-${tab.id}`}
            >
              {tab.icon && <i className={`bi ${tab.icon} me-1`} />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

