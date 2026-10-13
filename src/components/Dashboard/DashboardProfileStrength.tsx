"use client";
import React from 'react';
import Link from 'next/link';

interface DashboardProfileStrengthProps {
  role?: 1 | 2 | 3;
}

export default function DashboardProfileStrength({ role = 1 }: DashboardProfileStrengthProps) {
  const isEmployer = role === 2;
  const isBusiness = role === 3;

  const title = isEmployer ? 'Company Profile Strength' : isBusiness ? 'Campaign Strength' : 'Profile Strength';
  const score = isEmployer ? '85%' : isBusiness ? '80%' : '82%';
  const fillWidth = isEmployer ? '85%' : isBusiness ? '80%' : '82%';

  const desc = isEmployer
    ? 'Your company profile is looking great! Complete all sections to attract more qualified applicants.'
    : isBusiness
    ? 'Your business profile is looking great! Complete all sections to reach more high-intent customers.'
    : 'Your profile is looking great! Complete all sections to get more views and opportunities.';

  const checklist = isEmployer
    ? [
        { text: 'Add Company Logo', done: true },
        { text: 'Add Company Headline', done: true },
        { text: 'Add About Company', done: true },
        { text: 'Add Industry & Size', done: true },
        { text: 'Add Office Location', done: true },
        { text: 'Post First Job', done: true },
        { text: 'Add Company Benefits', done: false },
        { text: 'Add Culture Photos', done: false },
      ]
    : isBusiness
    ? [
        { text: 'Add Business Logo', done: true },
        { text: 'Add Business Tagline', done: true },
        { text: 'Add Business Overview', done: true },
        { text: 'Add Contact & Phone', done: true },
        { text: 'Add Address Location', done: true },
        { text: 'Add First Campaign', done: true },
        { text: 'Upload Banner Collage', done: false },
        { text: 'Add Promo Discount Code', done: false },
      ]
    : [
        { text: 'Add Profile Photo', done: true },
        { text: 'Add Headline', done: true },
        { text: 'Add About Me', done: true },
        { text: 'Add Skills (8/10)', done: true },
        { text: 'Add Work Experience', done: true },
        { text: 'Add Location', done: true },
        { text: 'Add Portfolio/Projects', done: false },
        { text: 'Add Services', done: false },
      ];

  const btnLabel = isEmployer
    ? 'Complete Company Profile →'
    : isBusiness
    ? 'Complete Business Profile →'
    : 'Complete Profile →';

  return (
    <div className="dash-card">
      <div className="dash-card-header mb-1">
        <h4 className="dash-card-title">{title}</h4>
        <span className="profile-strength-score">{score}</span>
      </div>

      <div className="dash-strength-bar">
        <div className="dash-strength-fill" style={{ width: fillWidth }} />
      </div>

      <p className="text-secondary" style={{ fontSize: '12px', lineHeight: '1.45', margin: '0 0 12px 0' }}>
        {desc}
      </p>

      <div className="dash-checklist">
        {checklist.map((item, idx) => (
          <div key={idx} className="dash-check-item">
            {item.done ? (
              <i className="bi bi-check-circle-fill check-icon-done" />
            ) : (
              <i className="bi bi-circle check-icon-pending" />
            )}
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      <Link
        href={`/profile?tab=${role}`}
        className="dash-btn-full"
        id="dash-complete-profile-btn"
      >
        {btnLabel}
      </Link>
    </div>
  );
}

