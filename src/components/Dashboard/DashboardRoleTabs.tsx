"use client";
import React from 'react';

interface Props {
  roles: number[];
  activeRole: number;
  onSwitch: (role: number) => void;
}

const ROLE_CONFIG: Record<number, { label: string; icon: string; colorClass: string; desc: string }> = {
  1: { label: 'Job Seeker',        icon: 'bi-person-badge', colorClass: 'role-tab-seeker',   desc: 'Manage your job searches & applications' },
  2: { label: 'Employer',          icon: 'bi-building',     colorClass: 'role-tab-employer', desc: 'Manage your job listings & applicants' },
  3: { label: 'Business Promoter', icon: 'bi-megaphone',    colorClass: 'role-tab-promoter', desc: 'Manage your campaigns & promotions' },
};

export default function DashboardRoleTabs({ roles, activeRole, onSwitch }: Props) {
  // Only show tabs if user has more than one role
  if (!roles || roles.length <= 1) return null;

  return (
    <div className="dashboard-role-tabs-bar mb-4">
      <div className="dashboard-role-tabs-inner d-flex gap-3 flex-wrap">
        {roles.map(role => {
          const config = ROLE_CONFIG[role];
          if (!config) return null;
          const isActive = activeRole === role;

          return (
            <button
              key={role}
              type="button"
              className={`dashboard-role-tab-card ${config.colorClass} ${isActive ? 'active' : ''}`}
              onClick={() => onSwitch(role)}
              aria-pressed={isActive}
              style={{
                flex: 1,
                minWidth: '220px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 20px',
                borderRadius: '16px',
                background: isActive ? 'rgba(67, 24, 255, 0.05)' : '#ffffff',
                border: isActive ? '1px solid rgba(67, 24, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isActive ? '0 4px 15px rgba(67, 24, 255, 0.08)' : '0 2px 5px rgba(0,0,0,0.01)',
              }}
            >
              <div 
                className="dashboard-role-tab-icon-wrap"
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0,
                  background: role === 1 ? 'rgba(59,130,246,0.1)' : role === 2 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                  color: role === 1 ? '#3b82f6' : role === 2 ? '#10b981' : '#f59e0b',
                }}
              >
                <i className={`bi ${config.icon}`} />
              </div>
              <div className="dashboard-role-tab-text" style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 }}>
                <span 
                  className="dashboard-role-tab-label"
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: isActive ? '#4318ff' : '#1e293b',
                    display: 'block',
                  }}
                >
                  {config.label}
                </span>
                <span className="dashboard-role-tab-desc" style={{ fontSize: '0.74rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  {config.desc}
                </span>
              </div>
              {isActive && (
                <span 
                  className="dashboard-role-tab-active-badge"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '99px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    background: 'rgba(67, 24, 255, 0.1)',
                    color: '#4318ff',
                  }}
                >
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
