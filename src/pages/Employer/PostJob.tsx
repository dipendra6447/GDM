"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '../../hooks/useAuth';
import 'react-quill-new/dist/quill.snow.css';
import './PostJob.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const TITLE_MAX = 255;
const DESC_MIN = 10;

interface FormErrors {
  title?: string;
  description?: string;
}

const PostJob: React.FC = () => {
  const { user, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jobType, setJobType] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [benefits, setBenefits] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [postedJobTitle, setPostedJobTitle] = useState('');
  
  const [activeTab, setActiveTab] = useState<'manage' | 'post'>('manage');
  const [employerJobs, setEmployerJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    if (activeTab === 'manage' && isLoggedIn && user?.roles?.includes(2)) {
      const fetchJobs = async () => {
        setLoadingJobs(true);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/api/jobs/employer/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            setEmployerJobs(data.data || []);
          }
        } catch (error) {
          console.error("Error fetching jobs", error);
        } finally {
          setLoadingJobs(false);
        }
      };
      fetchJobs();
    }
  }, [activeTab, isLoggedIn, user]);

  const handleToggleStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        setEmployerJobs(prev => prev.map(job => job.id === jobId ? { ...job, isActive: !currentStatus } : job));
      }
    } catch (error) {
      console.error("Error toggling status", error);
    }
  };

  // Auth guard — redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login?role=job_poster');
    }
  }, [isLoading, isLoggedIn, router]);

  // Role guard — redirect non-employer users back to home
  useEffect(() => {
    if (!isLoading && isLoggedIn && user && !user.roles.includes(2)) {
      router.push('/');
    }
  }, [isLoading, isLoggedIn, user, router]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Job title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Job title must be at least 3 characters';
    } else if (title.trim().length > TITLE_MAX) {
      newErrors.title = `Job title must be at most ${TITLE_MAX} characters`;
    }

    if (!description || description.replace(/<[^>]*>?/gm, '').trim().length < DESC_MIN) {
      newErrors.description = `Job description must be at least ${DESC_MIN} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          jobType,
          workMode,
          location: location.trim(),
          category,
          experience: experience.trim(),
          education: education.trim(),
          skills: skills.trim(),
          salaryRange: salaryRange.trim(),
          benefits: benefits.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to post job');
      }

      setPostedJobTitle(title.trim());
      setSuccess(true);
      setTitle('');
      setDescription('');
      setJobType('');
      setWorkMode('');
      setLocation('');
      setCategory('');
      setExperience('');
      setEducation('');
      setSkills('');
      setSalaryRange('');
      setBenefits('');
      setErrors({});
    } catch (err: any) {
      setApiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostAnother = () => {
    setSuccess(false);
    setPostedJobTitle('');
    setApiError('');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="pj-page">
        <div className="container">
          <div className="pj-loading">
            <div className="pj-loading-spinner" />
            <p className="pj-loading-text">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render until auth is resolved and user is employer
  if (!isLoggedIn || !user?.roles?.includes(2)) {
    return null;
  }

  // Success state
  if (success) {
    return (
      <div className="pj-page">
        <div className="container">
          <div className="pj-success-card">
            <div className="pj-success-icon">
              <i className="bi bi-check-lg" />
            </div>
            <h2 className="pj-success-title">Job Posted Successfully!</h2>
            <p className="pj-success-desc">
              Your job listing <strong>"{postedJobTitle}"</strong> is now live
              and visible to thousands of candidates on JobNest.
            </p>
            <div className="pj-success-actions">
              <button
                className="pj-btn-post-another"
                onClick={handlePostAnother}
                type="button"
              >
                <i className="bi bi-plus-circle" /> Post Another Job
              </button>
              <button
                className="pj-btn-view-jobs"
                onClick={() => {
                  setSuccess(false);
                  setActiveTab('manage');
                }}
                type="button"
              >
                <i className="bi bi-list-ul" /> View My Jobs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pj-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="pj-breadcrumb">
          <Link href="/">Home</Link>
          <i className="bi bi-chevron-right" />
          <span>Employer Dashboard</span>
        </div>

        {/* Header */}
        <div className="pj-header">
          <h1 className="pj-title">Employer Dashboard</h1>
          <p className="pj-subtitle">
            Manage your job listings or post a new opportunity to reach candidates.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="pj-tabs-nav">
          <button 
            className={`pj-tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <i className="bi bi-card-list" /> My Jobs
          </button>
          <button 
            className={`pj-tab-btn ${activeTab === 'post' ? 'active' : ''}`}
            onClick={() => setActiveTab('post')}
          >
            <i className="bi bi-plus-circle" /> Post a Job
          </button>
        </div>

        {/* Manage Jobs Tab */}
        {activeTab === 'manage' && (
          <div className="pj-manage-jobs">
            {loadingJobs ? (
              <div className="pj-loading-inline">
                <div className="spinner-border spinner-border-sm text-primary" /> Loading your jobs...
              </div>
            ) : employerJobs.length === 0 ? (
              <div className="pj-empty-state">
                <div className="pj-empty-icon"><i className="bi bi-inbox" /></div>
                <h3>No jobs posted yet</h3>
                <p>You haven't posted any jobs. Create your first listing to get started.</p>
                <button onClick={() => setActiveTab('post')} className="pj-btn-submit mt-3">
                  <i className="bi bi-plus-lg" /> Post a Job
                </button>
              </div>
            ) : (
              <div className="pj-jobs-grid">
                {employerJobs.map(job => (
                  <div key={job.id} className="pj-manage-card">
                    <div className="pj-manage-card-header">
                      <div>
                        <h3 className="pj-manage-title">{job.title}</h3>
                        <span className="pj-manage-date">Posted on {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="pj-manage-toggle-wrap">
                        <span className={`pj-status-badge ${job.isActive ? 'active' : 'inactive'}`}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <label className="pj-toggle">
                          <input 
                            type="checkbox" 
                            checked={job.isActive} 
                            onChange={() => handleToggleStatus(job.id, job.isActive)} 
                          />
                          <span className="pj-slider"></span>
                        </label>
                      </div>
                    </div>
                    <div className="pj-manage-card-stats">
                      <div className="pj-stat">
                        <i className="bi bi-geo-alt" /> {job.location || 'Not specified'}
                      </div>
                      <div className="pj-stat">
                        <i className="bi bi-briefcase" /> {job.jobType || 'Not specified'}
                      </div>
                      <div className="pj-stat">
                        <i className="bi bi-people" /> 0 Applicants
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Post Job Tab */}
        {activeTab === 'post' && (
        <div className="pj-layout">
          {/* LEFT: Form */}
          <div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="pj-form-card">
                <div className="pj-form-card-header">
                  <div className="pj-form-card-header-icon">
                    <i className="bi bi-briefcase" />
                  </div>
                  <h2>Job Details</h2>
                </div>

                <div className="pj-form-card-body">
                  {/* API Error */}
                  {apiError && (
                    <div className="pj-alert-error">
                      <i className="bi bi-exclamation-triangle-fill" />
                      <div>{apiError}</div>
                    </div>
                  )}

                  {/* Job Title */}
                  <div className="pj-field">
                    <label className="pj-label" htmlFor="pj-title">
                      Job Title <span className="pj-required">*</span>
                    </label>
                    <input
                      id="pj-title"
                      type="text"
                      className={`pj-input${errors.title ? ' is-invalid' : ''}`}
                      placeholder="e.g. Senior React Developer, Marketing Manager"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                      }}
                      maxLength={TITLE_MAX}
                      autoFocus
                    />
                    <div className={`pj-char-count${title.length > TITLE_MAX - 20 ? (title.length > TITLE_MAX ? ' pj-char-over' : ' pj-char-warn') : ''}`}>
                      {title.length}/{TITLE_MAX}
                    </div>
                    {errors.title && (
                      <div className="pj-field-error">
                        <i className="bi bi-exclamation-circle" /> {errors.title}
                      </div>
                    )}
                  </div>

                  {/* Category and Job Type Row */}
                  <div className="pj-form-row">
                    <div className="pj-field">
                      <label className="pj-label" htmlFor="pj-category">Category</label>
                      <select className="pj-select" id="pj-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">Select Category</option>
                        <option value="Technology">Technology</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Design">Design</option>
                        <option value="Business">Business</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Data Science">Data Science</option>
                      </select>
                    </div>
                    <div className="pj-field">
                      <label className="pj-label" htmlFor="pj-job-type">Job Type</label>
                      <select className="pj-select" id="pj-job-type" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                        <option value="">Select Type</option>
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                  </div>

                  {/* Work Mode and Location Row */}
                  <div className="pj-form-row">
                    <div className="pj-field">
                      <label className="pj-label" htmlFor="pj-work-mode">Work Mode</label>
                      <select className="pj-select" id="pj-work-mode" value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
                        <option value="">Select Mode</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site</option>
                      </select>
                    </div>
                    <div className="pj-field">
                      <label className="pj-label" htmlFor="pj-location">Location</label>
                      <input id="pj-location" type="text" className="pj-input" placeholder="e.g. Bangalore, India" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>
                  </div>

                  {/* Experience and Education Row */}
                  <div className="pj-form-row">
                    <div className="pj-field">
                      <label className="pj-label" htmlFor="pj-experience">Experience Required</label>
                      <input id="pj-experience" type="text" className="pj-input" placeholder="e.g. 3-5 years" value={experience} onChange={(e) => setExperience(e.target.value)} />
                    </div>
                    <div className="pj-field">
                      <label className="pj-label" htmlFor="pj-education">Education Required</label>
                      <input id="pj-education" type="text" className="pj-input" placeholder="e.g. Bachelor's Degree" value={education} onChange={(e) => setEducation(e.target.value)} />
                    </div>
                  </div>

                  {/* Salary and Benefits Row */}
                  <div className="pj-form-row">
                    <div className="pj-field">
                      <label className="pj-label" htmlFor="pj-salary">Salary Range</label>
                      <input id="pj-salary" type="text" className="pj-input" placeholder="e.g. ₹12-20 LPA" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} />
                    </div>
                    <div className="pj-field">
                      <label className="pj-label" htmlFor="pj-benefits">Benefits <span className="pj-label-hint">(Comma separated)</span></label>
                      <input id="pj-benefits" type="text" className="pj-input" placeholder="e.g. Health Insurance, Gym" value={benefits} onChange={(e) => setBenefits(e.target.value)} />
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="pj-field">
                    <label className="pj-label" htmlFor="pj-skills">Skills <span className="pj-label-hint">(Comma separated)</span></label>
                    <input id="pj-skills" type="text" className="pj-input" placeholder="e.g. React, Node.js, MongoDB" value={skills} onChange={(e) => setSkills(e.target.value)} />
                  </div>

                  {/* Job Description */}
                  <div className="pj-field">
                    <label className="pj-label" htmlFor="pj-description">
                      Job Description <span className="pj-required">*</span>
                      <span className="pj-label-hint">(min {DESC_MIN} characters, no max limit)</span>
                    </label>
                    <div className={`pj-quill-wrapper ${errors.description ? 'is-invalid' : ''}`}>
                      <ReactQuill
                        theme="snow"
                        value={description}
                        onChange={(val) => {
                          setDescription(val);
                          if (errors.description && val.replace(/<[^>]*>?/gm, '').trim().length >= DESC_MIN) {
                            setErrors((prev) => ({ ...prev, description: undefined }));
                          }
                        }}
                        placeholder="Describe the role, responsibilities, requirements, benefits, and any other relevant details…"
                        modules={{
                          toolbar: [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            ['link', 'clean']
                          ],
                        }}
                      />
                    </div>
                    {errors.description && (
                      <div className="pj-field-error">
                        <i className="bi bi-exclamation-circle" /> {errors.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pj-form-actions">
                  <Link href="/" className="pj-btn-cancel">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="pj-btn-submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />
                        Publishing…
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send" /> Publish Job
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* RIGHT: Sidebar Tips */}
          <aside>
            <div className="pj-sidebar-card">
              <h3>
                <i className="bi bi-lightbulb" /> Tips for a Great Listing
              </h3>

              <div className="pj-tip">
                <div className="pj-tip-icon" style={{ background: 'rgba(36, 84, 255, 0.08)', color: '#2454FF' }}>
                  <i className="bi bi-pencil" />
                </div>
                <div className="pj-tip-text">
                  <strong>Be specific with the title.</strong> Use clear, standard job titles that candidates search for.
                </div>
              </div>

              <div className="pj-tip">
                <div className="pj-tip-icon" style={{ background: 'rgba(20, 184, 122, 0.08)', color: '#14B87A' }}>
                  <i className="bi bi-list-check" />
                </div>
                <div className="pj-tip-text">
                  <strong>Detail the responsibilities.</strong> Outline what the role involves day-to-day so candidates can self-select.
                </div>
              </div>

              <div className="pj-tip">
                <div className="pj-tip-icon" style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#F59E0B' }}>
                  <i className="bi bi-currency-dollar" />
                </div>
                <div className="pj-tip-text">
                  <strong>Include compensation info.</strong> Listings with salary ranges get up to 3x more applications.
                </div>
              </div>

              <div className="pj-tip">
                <div className="pj-tip-icon" style={{ background: 'rgba(123, 62, 255, 0.08)', color: '#7B3EFF' }}>
                  <i className="bi bi-geo-alt" />
                </div>
                <div className="pj-tip-text">
                  <strong>Mention location & remote.</strong> Clarify whether the role is on-site, remote, or hybrid.
                </div>
              </div>

              {/* Quota Info */}
              <div className="pj-quota-card">
                <div className="pj-quota-label">Jobs Posted</div>
                <div className="pj-quota-value">
                  {user.jobPostCount} <span>/ Free Tier</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
        )}
      </div>
    </div>
  );
};

export default PostJob;
