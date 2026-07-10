'use client';

import { useState, useEffect, useRef } from 'react';
import { MdWork, MdToggleOn, MdToggleOff, MdDelete, MdAdd, MdEdit } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import { fadeInUp } from '@/lib/animations';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import './Jobs.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const STATUS_TABS = [
  { label: 'All', filter: null },
  { label: 'Active', filter: 'active' },
  { label: 'Inactive', filter: 'inactive' },
  { label: 'Deleted', filter: 'deleted' },
];

export default function JobsPage() {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const [employers, setEmployers] = useState<any[]>([]);
  const [jobCategories, setJobCategories] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, usersRes, catRes] = await Promise.all([
        api.get('/admin/jobs?limit=100'),
        api.get('/admin/users'),
        api.get('/admin/categories/job')
      ]);
      
      if (jobsRes.success) setJobs(jobsRes.data);
      if (usersRes.success) {
        setEmployers(usersRes.data.filter((u: any) => u.roles.some((r: any) => r.roleId === 2) && !u.isDeleted));
      }
      if (catRes.success) {
        setJobCategories(catRes.data.filter((c: any) => c.isActive && !c.isDeleted));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && contentRef.current) fadeInUp(contentRef.current);
  }, [loading]);



  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/jobs/${id}/status`, { isActive: !currentStatus });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle job status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await api.delete(`/admin/jobs/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete job');
    }
  };



  const filteredJobs = jobs.filter((job) => {
    if (activeFilter === null) return true;
    if (activeFilter === 'active') return job.isActive && !job.isDeleted;
    if (activeFilter === 'inactive') return !job.isActive && !job.isDeleted;
    if (activeFilter === 'deleted') return job.isDeleted;
    return true;
  });

  const getStatusLabel = (job: any) => {
    if (job.isDeleted) return { label: 'Deleted', className: 'badge-danger' };
    if (job.isActive) return { label: 'Active', className: 'badge-success' };
    return { label: 'Inactive', className: 'badge-warning' };
  };

  return (
    <div className="jobs-page">
      <PageHeader
        title="Jobs Management"
        subtitle="View, moderate, and manage all job listings across the platform."
        breadcrumbs={[{ label: 'Home', path: '/admin' }, { label: 'Jobs' }]}
      />

      <div className="role-filter-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            className={`role-tab ${activeFilter === tab.filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(tab.filter)}
          >
            {tab.label}
            <span className="tab-count">
              {tab.filter === null
                ? jobs.length
                : jobs.filter((j) => {
                    if (tab.filter === 'active') return j.isActive && !j.isDeleted;
                    if (tab.filter === 'inactive') return !j.isActive && !j.isDeleted;
                    if (tab.filter === 'deleted') return j.isDeleted;
                    return false;
                  }).length}
            </span>
          </button>
        ))}
      </div>

      <div className="admin-card" ref={contentRef}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3><MdWork className="icon-mr" /> Job Listings ({filteredJobs.length})</h3>
          <button className="btn btn-primary" onClick={() => router.push('/admin/jobs/create')}><MdAdd /> Add Job</button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th><th>Company</th><th>Location</th><th>Type</th><th>Employer</th><th>Posted</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-4">Loading jobs...</td></tr>
              ) : filteredJobs.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-4">No jobs found.</td></tr>
              ) : (
                filteredJobs.map((job) => {
                  const status = getStatusLabel(job);
                  return (
                    <tr key={job.id} className={job.isDeleted ? 'row-deleted' : ''}>
                      <td><div className="job-title">{job.title}</div></td>
                      <td>{job.companyName || '—'}</td>
                      <td>{job.location || '—'}</td>
                      <td>{job.jobType || '—'}</td>
                      <td><span className="text-muted">{job.employerEmail}</span></td>
                      <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                      <td><span className={`status-badge ${status.className}`}>{status.label}</span></td>
                      <td>
                        {!job.isDeleted && (
                          <div className="action-buttons">
                            <button className="btn-icon text-primary" onClick={() => router.push(`/admin/jobs/${job.id}`)} title="Edit"><MdEdit /></button>
                            <button className={`btn-icon ${job.isActive ? 'text-success' : 'text-warning'}`} onClick={() => handleToggleStatus(job.id, job.isActive)} title={job.isActive ? 'Deactivate' : 'Activate'}>
                              {job.isActive ? <MdToggleOn /> : <MdToggleOff />}
                            </button>
                            <button className="btn-icon text-danger" onClick={() => handleDelete(job.id)} title="Delete"><MdDelete /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
