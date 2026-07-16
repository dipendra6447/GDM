'use client';

import { useState, useEffect, useRef } from 'react';
import { MdStorefront, MdAdd, MdEdit, MdDelete, MdToggleOn, MdToggleOff, MdVisibility } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import { fadeInUp } from '@/lib/animations';
import './Businesses.css'; 

export default function BusinessesPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [businessCategories, setBusinessCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '', password: '', businessName: '', businessCategory: '', gstNumber: '', contactPhone: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, catRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/categories/business')
      ]);
      
      if (usersRes.success) {
        const busUsers = usersRes.data.filter((u: any) => u.roles.some((r: any) => r.roleId === 3) && !u.isDeleted);
        setBusinesses(busUsers);
      }
      if (catRes.success) {
        setBusinessCategories(catRes.data.filter((c: any) => c.isActive && !c.isDeleted));
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBusiness) {
        await api.put(`/admin/businesses/${editingBusiness.id}`, formData);
      } else {
        await api.post('/admin/businesses', formData);
      }
      setShowModal(false);
      setEditingBusiness(null);
      setFormData({ email: '', password: '', businessName: '', businessCategory: '', gstNumber: '', contactPhone: '' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save business');
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/businesses/${id}/status`, { isActive: !currentStatus });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to soft-delete this business?')) return;
    try {
      await api.delete(`/admin/businesses/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete business');
    }
  };

  const openModal = (business: any = null) => {
    setEditingBusiness(business);
    if (business) {
      setFormData({
        email: business.email,
        password: '', 
        businessName: business.promoterProfile?.businessName || '',
        businessCategory: business.promoterProfile?.businessCategory || '',
        gstNumber: business.promoterProfile?.gstNumber || '',
        contactPhone: business.promoterProfile?.contactPhone || ''
      });
    } else {
      setFormData({ email: '', password: '', businessName: '', businessCategory: '', gstNumber: '', contactPhone: '' });
    }
    setShowModal(true);
  };

  return (
    <div className="employers-page">
      <PageHeader
        title="Business Promoters"
        subtitle="Manage registered business owners."
        breadcrumbs={[{ label: 'Home', path: '/admin' }, { label: 'Businesses' }]}
      />

      <div className="admin-card" ref={contentRef}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3><MdStorefront className="icon-mr" /> Businesses ({businesses.length})</h3>
          <button className="btn btn-primary" onClick={() => openModal()}><MdAdd /> Add Business</button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
              ) : businesses.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4">No businesses found.</td></tr>
              ) : (
                businesses.map((bus) => (
                  <tr key={bus.id}>
                    <td><strong>{bus.promoterProfile?.businessName || 'N/A'}</strong></td>
                    <td>{bus.email}</td>
                    <td>
                      <span className={`status-badge ${bus.isActive ? 'badge-success' : 'badge-warning'}`}>
                        {bus.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(bus.createdAt).toLocaleDateString()}</td>
                    <td>
                       <div className="action-buttons">
                         <button className="btn-icon text-info" onClick={() => router.push(`/admin/businesses/${bus.id}`)} title="View Detail"><MdVisibility /></button>
                        <button className="btn-icon text-primary" onClick={() => openModal(bus)} title="Edit"><MdEdit /></button>
                        <button className={`btn-icon ${bus.isActive ? 'text-success' : 'text-warning'}`} onClick={() => handleToggle(bus.id, bus.isActive)} title="Toggle Status">
                          {bus.isActive ? <MdToggleOn /> : <MdToggleOff />}
                        </button>
                        <button className="btn-icon text-danger" onClick={() => handleDelete(bus.id)} title="Delete"><MdDelete /></button>
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
              <h3>{editingBusiness ? 'Edit Business' : 'Add Business'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body employer-form-grid">
                {!editingBusiness && (
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
                  <label>Business Name</label>
                  <input type="text" name="businessName" className="form-control" value={formData.businessName} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Business Category</label>
                  <select name="businessCategory" className="form-control" value={formData.businessCategory} onChange={handleInputChange}>
                    <option value="">Select a Category</option>
                    {businessCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>GST Number</label>
                  <input type="text" name="gstNumber" className="form-control" value={formData.gstNumber} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input type="text" name="contactPhone" className="form-control" value={formData.contactPhone} onChange={handleInputChange} />
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
