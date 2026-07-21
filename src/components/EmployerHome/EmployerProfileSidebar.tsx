"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import "./EmployerProfileSidebar.css";

interface Props {
  onSwitchRole?: (roleId: number) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const EmployerProfileSidebar: React.FC<Props> = ({ onSwitchRole }) => {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [jobCount, setJobCount] = useState<number>(0);
  const [applicantCount, setApplicantCount] = useState<number>(0);

  useEffect(() => {
    const fetchEmployerStats = async () => {
      if (!isLoggedIn) return;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/jobs/employer/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const jobsList = data.data || [];
          setJobCount(jobsList.length);
          const totalApps = jobsList.reduce((sum: number, j: any) => sum + (j.applicantCount || 0), 0);
          setApplicantCount(totalApps);
        }
      } catch (err) {
        console.error("Error loading employer stats", err);
      }
    };
    fetchEmployerStats();
  }, [isLoggedIn]);

  if (!isLoggedIn || !user) return null;

  const companyInitial = user?.email?.charAt(0).toUpperCase() || 'C';
  const companyName = user?.email?.split('@')[0] || 'My Company';

  return (
    <div className="emp-sidebar-card">
      {/* Top Profile Header */}
      <div className="emp-sidebar-top text-center">
        <div className="emp-avatar-container mb-2">
          <div className="emp-avatar-wrapper">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Company Logo" style={{ width: '100%', height: '100%', borderRadius: '20px', objectFit: 'cover' }} />
            ) : (
              companyInitial
            )}
          </div>
        </div>

        <h3 className="emp-company-name">{companyName}</h3>
        <span className="emp-role-badge">
          <i className="bi bi-patch-check-fill"></i> Employer Account
        </span>

        <Link
          href="/employer/post-job?tab=post"
          className="btn btn-primary w-100 mt-3 fw-bold d-inline-flex align-items-center justify-content-center gap-2"
          style={{ borderRadius: '10px', background: '#2454ff', border: 'none', padding: '10px' }}
        >
          <i className="bi bi-plus-circle-fill"></i> Post a Job
        </Link>
      </div>

      {/* Recruitment Metrics Box */}
      <div className="emp-perf-box">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="emp-perf-title">Recruitment Activity</span>
          <i className="bi bi-graph-up-arrow text-success small" />
        </div>
        <div className="row g-2 text-center">
          <div className="col-6 border-end" style={{ borderColor: '#e2e8f0' }}>
            <div className="emp-perf-metric-val">{jobCount}</div>
            <span className="emp-perf-metric-label">Jobs Posted</span>
          </div>
          <div className="col-6">
            <div className="emp-perf-metric-val" style={{ color: '#2454ff' }}>{applicantCount}</div>
            <span className="emp-perf-metric-label">Applicants</span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-top text-center" style={{ borderColor: '#e2e8f0' }}>
          <span className="small text-muted">Free Job Limit: <strong>{jobCount}/3 Posted</strong></span>
        </div>
      </div>

      {/* Employer Navigation Links */}
      <div className="emp-sidebar-links">
        <Link href="/employer" className="emp-sidebar-link-item active">
          <i className="bi bi-house-door" />
          <span>Employer Home</span>
        </Link>
        <Link href="/dashboard?role=2&tab=jobs" className="emp-sidebar-link-item">
          <i className="bi bi-briefcase" />
          <span>Manage Jobs</span>
        </Link>
        <Link href="/dashboard?role=2&tab=post" className="emp-sidebar-link-item">
          <i className="bi bi-plus-square" />
          <span>Post New Job</span>
        </Link>
        <Link href="/dashboard?role=2&tab=candidates" className="emp-sidebar-link-item">
          <i className="bi bi-people" />
          <span>Candidate Database</span>
        </Link>
        <Link href="/profile?tab=2" className="emp-sidebar-link-item">
          <i className="bi bi-building" />
          <span>Company Profile</span>
        </Link>
        <Link href="/dashboard/subscription?role=2" className="emp-sidebar-link-item">
          <i className="bi bi-credit-card-fill text-warning" />
          <span>Employer Subscription</span>
        </Link>
      </div>

      {/* Role Switcher Option */}
      {onSwitchRole && (
        <button
          className="emp-switch-role-btn"
          onClick={() => onSwitchRole(1)}
          type="button"
        >
          <i className="bi bi-arrow-repeat" />
          <span>Switch to Job Seeker View</span>
        </button>
      )}
    </div>
  );
};

export default EmployerProfileSidebar;
