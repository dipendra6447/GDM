"use client";
import React from 'react';

interface Props {
  roles: number[];
  activeRole: number;
  onSwitch: (role: number) => void;
}

const ROLE_CONFIG: Record<number, { label: string; icon: string; colorClass: string; desc: string }> = {
  1: { label: 'Job Seeker',        icon: 'bi-person-badge', colorClass: 'role-tab-seeker',   desc: 'Manage your resume & job search profile' },
  2: { label: 'Employer',          icon: 'bi-building',     colorClass: 'role-tab-employer', desc: 'Manage your company & hiring profile' },
  3: { label: 'Business Promoter', icon: 'bi-megaphone',    colorClass: 'role-tab-promoter', desc: 'Manage your business & promotions' },
};

export default function ProfileRoleTabs({ roles, activeRole, onSwitch }: Props) {
  // Only show tabs if user has more than one role
  if (!roles || roles.length <= 1) return null;

  return (
    <div className="profile-role-tabs-bar">
      <div className="profile-role-tabs-inner">
        {roles.map(role => {
          const config = ROLE_CONFIG[role];
          if (!config) return null;
          const isActive = activeRole === role;

          return (
            <button
              key={role}
              type="button"
              className={`profile-role-tab-card ${config.colorClass} ${isActive ? 'active' : ''}`}
              onClick={() => onSwitch(role)}
              aria-pressed={isActive}
            >
              <div className="profile-role-tab-icon-wrap">
                <i className={`bi ${config.icon}`} />
              </div>
              <div className="profile-role-tab-text">
                <span className="profile-role-tab-label">{config.label}</span>
                <span className="profile-role-tab-desc">{config.desc}</span>
              </div>
              {isActive && (
                <span className="profile-role-tab-active-badge">
                  <i className="bi bi-check-circle-fill" /> Active
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
