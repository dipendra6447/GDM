'use client';

import { useState, useEffect, useRef } from 'react';
import { MdBusinessCenter, MdAdd, MdEdit, MdDelete, MdToggleOn, MdToggleOff, MdVisibility } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import { fadeInUp } from '@/lib/animations';
import './Employers.css';

export default function EmployersPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [employers, setEmployers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '', password: '', companyName: '', industry: '', companySize: '', hrName: ''
  });

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.success) {
        const empUsers = res.data.filter((u: any) => u.roles.some((r: any) => r.roleId === 2) && !u.isDeleted);
        setEmployers(empUsers);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch employers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployers();
  }, []);

  useEffect(() => {
    if (!loading && contentRef.current) fadeInUp(contentRef.current);
  }, [loading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployer) {
        await api.put(`/admin/employers/${editingEmployer.id}`, formData);
      } else {
        await api.post('/admin/employers', formData);
      }
      setShowModal(false);
      setEditingEmployer(null);
      setFormData({ email: '', password: '', companyName: '', industry: '', companySize: '', hrName: '' });
      fetchEmployers();
    } catch (err: any) {
      alert(err.message || 'Failed to save employer');
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/employers/${id}/status`, { isActive: !currentStatus });
      fetchEmployers();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to soft-delete this employer?')) return;
    try {
      await api.delete(`/admin/employers/${id}`);
      fetchEmployers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete employer');
    }
  };

  const openModal = (employer: any = null) => {
    setEditingEmployer(employer);
    if (employer) {
      setFormData({
        email: employer.email,
        password: '',
        companyName: employer.employerProfile?.companyName || '',
        industry: employer.employerProfile?.industry || '',
        companySize: employer.employerProfile?.companySize || '',
        hrName: employer.employerProfile?.hrName || ''
      });
    } else {
      setFormData({ email: '', password: '', companyName: '', industry: '', companySize: '', hrName: '' });
    }
    setShowModal(true);
  };

  return (
    <div className="employers-page">
      <PageHeader
        title="Employers"
        subtitle="Manage registered company employers."
        breadcrumbs={[{ label: 'Home', path: '/admin' }, { label: 'Employers' }]}
      />

      <div className="admin-card" ref={contentRef}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3><MdBusinessCenter className="icon-mr" /> Employers ({employers.length})</h3>
          <button className="btn btn-primary" onClick={() => openModal()}><MdAdd /> Add Employer</button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
              ) : employers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4">No employers found.</td></tr>
              ) : (
                employers.map((emp) => (
                  <tr key={emp.id}>
                    <td><strong>{emp.employerProfile?.companyName || 'N/A'}</strong></td>
                    <td>{emp.email}</td>
                    <td>
                      <span className={`status-badge ${emp.isActive ? 'badge-success' : 'badge-warning'}`}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(emp.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon text-info" onClick={() => router.push(`/admin/users/${emp.id}`)} title="View Detail"><MdVisibility /></button>
                        <button className="btn-icon text-primary" onClick={() => openModal(emp)} title="Edit"><MdEdit /></button>
                        <button className={`btn-icon ${emp.isActive ? 'text-success' : 'text-warning'}`} onClick={() => handleToggle(emp.id, emp.isActive)} title="Toggle Status">
                          {emp.isActive ? <MdToggleOn /> : <MdToggleOff />}
                        </button>
                        <button className="btn-icon text-danger" onClick={() => handleDelete(emp.id)} title="Delete"><MdDelete /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{editingEmployer ? 'Edit Employer' : 'Add Employer'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body employer-form-grid">
                {!editingEmployer && (
                  <>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input type="password" name="password" className="form-control" value={formData.password} onChange={handleInputChange} required />
                    </div>
                  </>
                )}
                <div className="form-group">
                  <label>Company Name</label>
                  <input type="text" name="companyName" className="form-control" value={formData.companyName} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Industry</label>
                  <input type="text" name="industry" className="form-control" value={formData.industry} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Company Size</label>
                  <select name="companySize" className="form-control" value={formData.companySize} onChange={handleInputChange}>
                    <option value="">Select size</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="500+">500+</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>HR Name</label>
                  <input type="text" name="hrName" className="form-control" value={formData.hrName} onChange={handleInputChange} />
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
