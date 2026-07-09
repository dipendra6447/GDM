'use client';

import { useState, useEffect, useRef } from 'react';
import { MdWork, MdToggleOn, MdToggleOff, MdDelete, MdAdd, MdEdit } from 'react-icons/md';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import { fadeInUp } from '@/lib/animations';
import './Jobs.css';

const STATUS_TABS = [
  { label: 'All', filter: null },
  { label: 'Active', filter: 'active' },
  { label: 'Inactive', filter: 'inactive' },
  { label: 'Deleted', filter: 'deleted' },
];

export default function JobsPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const [employers, setEmployers] = useState<any[]>([]);
  const [jobCategories, setJobCategories] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', companyName: '', location: '', category: '', employerId: ''
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await api.put(`/admin/jobs/${editingJob.id}`, formData);
      } else {
        await api.post('/admin/jobs', formData);
      }
      setShowModal(false);
      setEditingJob(null);
      setFormData({ title: '', description: '', companyName: '', location: '', category: '', employerId: '' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save job');
    }
  };

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

  const openModal = (job: any = null) => {
    setEditingJob(job);
    if (job) {
      setFormData({
        title: job.title || '', description: job.description || '', companyName: job.companyName || '',
        location: job.location || '', category: job.category || '', employerId: job.employerId || ''
      });
    } else {
      setFormData({ title: '', description: '', companyName: '', location: '', category: '', employerId: '' });
    }
    setShowModal(true);
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
          <button className="btn btn-primary" onClick={() => openModal()}><MdAdd /> Add Job</button>
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
                            <button className="btn-icon text-primary" onClick={() => openModal(job)} title="Edit"><MdEdit /></button>
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

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{editingJob ? 'Edit Job' : 'Add Job'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Job Title</label>
                  <input type="text" name="title" className="form-control" value={formData.title} onChange={handleInputChange} required />
                </div>
                {!editingJob && (
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Employer</label>
                    <select name="employerId" className="form-control" value={formData.employerId} onChange={handleInputChange} required>
                      <option value="">Select an Employer</option>
                      {employers.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.employerProfile?.companyName || emp.email}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label>Company Name</label>
                  <input type="text" name="companyName" className="form-control" value={formData.companyName} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" name="location" className="form-control" value={formData.location} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" className="form-control" value={formData.category} onChange={handleInputChange}>
                    <option value="">Select a Category</option>
                    {jobCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea name="description" className="form-control" rows={4} value={formData.description} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
