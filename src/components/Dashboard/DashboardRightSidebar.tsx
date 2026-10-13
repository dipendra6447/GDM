"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface DashboardRightSidebarProps {
  role?: 1 | 2 | 3; // 1 = Job Seeker, 2 = Employer, 3 = Business Promoter
}

const defaultBars = [
  35, 55, 42, 68, 75, 48, 85, 92, 60, 78,
  88, 100, 72, 64, 82, 95, 86, 70, 90, 84,
];

export default function DashboardRightSidebar({ role = 1 }: DashboardRightSidebarProps) {
  const isEmployer = role === 2;
  const isBusiness = role === 3;

  // View data by role
  const viewsTitle = isEmployer ? 'Job Views & Reach' : isBusiness ? 'Promotion Views & Reach' : 'Profile Views';
  const totalViews = isEmployer ? '420' : isBusiness ? '2,450' : '245';
  const growthRate = isEmployer ? '↑ 34%' : isBusiness ? '↑ 38%' : '↑ 28%';
  const viewsSub = isEmployer ? 'Total Job Views' : isBusiness ? 'Total Impressions' : 'Total Profile Views';

  const breakdown = isEmployer ? [
    { icon: 'bi-people-fill', label: 'Applicants from Dayton, OH', count: '210' },
    { icon: 'bi-globe2', label: 'Remote Candidates', count: '160' },
    { icon: 'bi-star-fill', label: 'Shortlisted Talent', count: '50' },
  ] : isBusiness ? [
    { icon: 'bi-geo-alt-fill', label: 'Local Views (Dayton, OH)', count: '1,420' },
    { icon: 'bi-search', label: 'Search Results Placement', count: '680' },
    { icon: 'bi-megaphone-fill', label: 'Homepage Featured Slot', count: '350' },
  ] : [
    { icon: 'bi-people-fill', label: 'People from Dayton, OH', count: '120' },
    { icon: 'bi-building', label: 'Employers / Businesses', count: '85' },
    { icon: 'bi-person-badge', label: 'Other Professionals', count: '40' },
  ];

  // Visitors list
  const visitorsTitle = isEmployer ? "Recent Applicants" : isBusiness ? "Recent Inquiries" : "Who's Viewed Your Profile";
  const visitors = [
    {
      name: 'Sarah Cooper',
      title: isEmployer ? 'Applied for Senior React Dev' : isBusiness ? 'Interested in Brake Services' : 'Marketing Manager',
      sub: 'Dayton, OH',
      time: '2h ago',
      avatar: '/images/visitor_sarah.jpg',
    },
    {
      name: 'James Miller',
      title: isEmployer ? 'Applied for Full Stack Lead' : isBusiness ? 'Requested Quote for Fleet Care' : 'Hiring Manager',
      sub: isEmployer ? 'Tech Solutions Inc.' : 'Tech Solutions Inc.',
      time: '1d ago',
      avatar: '/images/visitor_james.jpg',
    },
    {
      name: 'Lisa Tran',
      title: isEmployer ? 'Applied for Product Designer' : isBusiness ? 'Inquired about Oil Change Promo' : 'Graphic Designer',
      sub: 'Freelance',
      time: '2d ago',
      avatar: '/images/visitor_lisa.jpg',
    },
    {
      name: 'Robert Allen',
      title: isEmployer ? 'Applied for DevOps Engineer' : isBusiness ? 'Corporate Fleet Partner' : 'Business Owner',
      sub: 'Allen Auto Repair',
      time: '3d ago',
      avatar: '/images/visitor_robert.jpg',
    },
  ];

  // Preferences data
  const prefTitle = isEmployer ? 'Hiring Preferences' : isBusiness ? 'Business Preferences' : 'Career Preferences';
  const prefFields = isEmployer ? [
    { icon: 'bi-briefcase-fill', label: 'Job Types', value: 'Full-time, Contract, Remote' },
    { icon: 'bi-person-fill', label: 'Roles Hired', value: 'Full-Stack Developers, PMs' },
    { icon: 'bi-geo-alt-fill', label: 'Location', value: 'Dayton, OH (Open to Remote)' },
    { icon: 'bi-clock-fill', label: 'Urgency', value: 'Hiring Immediately' },
    { icon: 'bi-currency-dollar', label: 'Salary Budget', value: '$75,000 - $140,000' },
  ] : isBusiness ? [
    { icon: 'bi-shop', label: 'Category', value: 'Automotive & Local Services' },
    { icon: 'bi-bullseye', label: 'Target Audience', value: 'Local Residents & Businesses' },
    { icon: 'bi-geo-alt-fill', label: 'Target Location', value: 'Dayton, OH (25 mi radius)' },
    { icon: 'bi-check-circle-fill', label: 'Campaign Status', value: 'Active & Featured' },
    { icon: 'bi-currency-dollar', label: 'Monthly Budget', value: '$499 - $1,499 / month' },
  ] : [
    { icon: 'bi-briefcase-fill', label: 'Looking for', value: 'Full-time, Contract, Freelance' },
    { icon: 'bi-person-fill', label: 'Job Title', value: 'Web Development, Project Management' },
    { icon: 'bi-geo-alt-fill', label: 'Location', value: 'Dayton, OH (Open to Remote)' },
    { icon: 'bi-clock-fill', label: 'Availability', value: 'Immediately' },
    { icon: 'bi-currency-dollar', label: 'Salary Range', value: '$50,000 - $100,000' },
  ];

  return (
    <aside className="dash-right-sidebar">
      {/* 1. Profile Views Card with Mini Bar Chart */}
      <div className="dash-card">
        <div className="dash-card-header mb-1">
          <h4 className="dash-card-title">{viewsTitle}</h4>
          <Link href="/dashboard" className="dash-card-link-cyan">
            Last 30 Days →
          </Link>
        </div>

        {/* 20-bar Visual Activity Chart */}
        <div className="dash-chart-bars-row" aria-label="Views chart">
          {defaultBars.map((heightPct, idx) => (
            <div
              key={idx}
              className="dash-mini-bar"
              style={{ height: `${heightPct}%` }}
              title={`Day ${idx + 1}: ${heightPct}%`}
            />
          ))}
        </div>

        <div className="dash-views-stat-row">
          <div className="dash-views-big-number">{totalViews}</div>
          <span className="dash-views-growth-pill">{growthRate}</span>
        </div>
        <p className="dash-views-subtitle">{viewsSub}</p>

        {/* Breakdown rows */}
        <div className="dash-breakdown-list">
          {breakdown.map((b, i) => (
            <div key={i} className="dash-breakdown-item">
              <div className="dash-breakdown-left">
                <i className={`bi ${b.icon}`} />
                <span>{b.label}</span>
              </div>
              <span className="dash-breakdown-count">{b.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Who's Viewed Your Profile / Recent Visitors Card */}
      <div className="dash-card">
        <div className="dash-card-header mb-2">
          <h4 className="dash-card-title">{visitorsTitle}</h4>
          <Link href="/dashboard" className="dash-card-link-cyan">
            View All →
          </Link>
        </div>

        <div className="dash-visitors-list">
          {visitors.map((v, i) => (
            <div key={i} className="dash-visitor-item">
              <div className="dash-visitor-left">
                <Image
                  src={v.avatar}
                  alt={v.name}
                  width={38}
                  height={38}
                  className="dash-visitor-avatar"
                />
                <div>
                  <div className="dash-visitor-name">{v.name}</div>
                  <div className="dash-visitor-title">
                    {v.title}
                    {v.sub && <span className="text-secondary ms-1">• {v.sub}</span>}
                  </div>
                </div>
              </div>
              <span className="dash-visitor-time">{v.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Career / Hiring / Business Preferences Card */}
      <div className="dash-card">
        <div className="dash-card-header mb-3">
          <h4 className="dash-card-title">{prefTitle}</h4>
          <Link href={`/profile?tab=${role}`} className="dash-card-edit-btn">
            <i className="bi bi-pencil" /> Edit
          </Link>
        </div>

        <div className="dash-pref-list">
          {prefFields.map((field, i) => (
            <div key={i} className="dash-pref-item">
              <div className="dash-pref-icon">
                <i className={`bi ${field.icon}`} />
              </div>
              <div className="flex-grow-1">
                <div className="dash-pref-label">{field.label}</div>
                <div className="dash-pref-val">{field.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

