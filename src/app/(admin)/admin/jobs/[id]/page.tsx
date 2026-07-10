'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MdArrowBack, MdWork } from 'react-icons/md';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import { fadeInUp } from '@/lib/animations';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import '../Jobs.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

import { use } from 'react';

export default function JobFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isEditing = id !== 'create';
  
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [employers, setEmployers] = useState<any[]>([]);
  const [jobCategories, setJobCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '', description: '', companyName: '', location: '', category: '', employerId: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const promises: Promise<any>[] = [
        api.get('/admin/users'),
        api.get('/admin/categories/job')
      ];
      
      if (isEditing) {
        promises.push(api.get(`/admin/jobs/${id}`));
      }
      
      const results = await Promise.all(promises);
      const usersRes = results[0];
      const catRes = results[1];
      const jobRes = isEditing ? results[2] : null;
      
      if (usersRes?.success) {
        setEmployers(usersRes.data.filter((u: any) => u.roles.some((r: any) => r.roleId === 2) && !u.isDeleted));
      }
      if (catRes?.success) {
        setJobCategories(catRes.data.filter((c: any) => c.isActive && !c.isDeleted));
      }
      if (isEditing && jobRes?.success) {
        const job = jobRes.data;
        setFormData({
          title: job.title || '',
          description: job.description || '',
          companyName: job.companyName || '',
          location: job.location || '',
          category: job.category || '',
          employerId: job.employerId || ''
        });
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
      if (isEditing) {
        await api.put(`/admin/jobs/${id}`, formData);
      } else {
        await api.post('/admin/jobs', formData);
      }
      router.push('/admin/jobs');
    } catch (err: any) {
      alert(err.message || 'Failed to save job');
    }
  };

  return (
    <div className="jobs-page">
      <PageHeader
        title={isEditing ? 'Edit Job' : 'Add New Job'}
        subtitle={isEditing ? 'Update the details of an existing job listing.' : 'Create a new job listing on behalf of an employer.'}
        breadcrumbs={[{ label: 'Home', path: '/admin' }, { label: 'Jobs', path: '/admin/jobs' }, { label: isEditing ? 'Edit Job' : 'Add Job' }]}
      />

      <div className="admin-card" ref={contentRef} style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3><MdWork className="icon-mr" /> Job Details</h3>
          <button className="btn btn-outline-secondary" onClick={() => router.push('/admin/jobs')}>
            <MdArrowBack className="icon-mr" /> Back to Jobs
          </button>
        </div>

        {error && <div className="alert alert-danger" style={{ margin: '1rem' }}>{error}</div>}

        <div className="card-body" style={{ padding: '2rem' }}>
          {loading ? (
            <div className="text-center py-4">Loading form data...</div>
          ) : (
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Job Title <span className="text-danger">*</span></label>
                  <input type="text" name="title" className="form-control" value={formData.title} onChange={handleInputChange} required />
                </div>
                
                {!isEditing && (
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Employer <span className="text-danger">*</span></label>
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
                
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
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
                  <div className="job-editor-wrapper">
                    <ReactQuill
                      theme="snow"
                      value={formData.description}
                      onChange={(val) => setFormData({ ...formData, description: val })}
                      placeholder="Describe the role, responsibilities, requirements..."
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
                </div>
              </div>
              
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline-secondary" onClick={() => router.push('/admin/jobs')}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Create Job'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
