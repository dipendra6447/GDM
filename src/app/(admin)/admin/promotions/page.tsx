'use client';

import { useState, useEffect, useRef } from 'react';
import { MdListAlt, MdCheck, MdClose, MdAdd } from 'react-icons/md';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import { fadeInUp } from '@/lib/animations';
import './Promotions.css';

export default function PromotionsPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPromo, setNewPromo] = useState({ businessName: '', bannerUrl: '', userEmail: '' });

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/promotions');
      if (res.success) {
        setPromotions(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (!loading && contentRef.current) {
      fadeInUp(contentRef.current);
    }
  }, [loading]);

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!window.confirm(`Are you sure you want to mark this as ${status}?`)) return;
    try {
      await api.patch(`/admin/promotions/${id}/status`, { status });
      fetchPromotions();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleAddPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/promotions', newPromo);
      setShowAddModal(false);
      setNewPromo({ businessName: '', bannerUrl: '', userEmail: '' });
      fetchPromotions();
    } catch (err: any) {
      alert(err.message || 'Failed to add promotion.');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'rejected': return 'badge-danger';
      case 'pending_approval': return 'badge-warning';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="promotions-page">
      <PageHeader
        title="Business Promotions"
        subtitle="Manage and approve business promotional listings."
        breadcrumbs={[
          { label: 'Home', path: '/admin' },
          { label: 'Promotions' }
        ]}
      />

      <div className="admin-card" ref={contentRef}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3><MdListAlt className="icon-mr" /> Promotion Listings</h3>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}><MdAdd /> Add Promotion</button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Owner Email</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">Loading promotions...</td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">No promotions found.</td>
                </tr>
              ) : (
                promotions.map(promo => (
                  <tr key={promo.id}>
                    <td>
                      <div className="promo-name">{promo.businessName}</div>
                      {promo.bannerUrl && (
                        <a href={promo.bannerUrl} target="_blank" rel="noopener noreferrer" className="promo-link">
                          View Banner
                        </a>
                      )}
                    </td>
                    <td>{promo.userEmail}</td>
                    <td>{new Date(promo.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(promo.status)}`}>
                        {promo.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {promo.status === 'pending_approval' && (
                        <div className="action-buttons">
                          <button 
                            className="btn-icon text-success"
                            onClick={() => handleUpdateStatus(promo.id, 'active')}
                            title="Approve"
                          >
                            <MdCheck />
                          </button>
                          <button 
                            className="btn-icon text-danger"
                            onClick={() => handleUpdateStatus(promo.id, 'rejected')}
                            title="Reject"
                          >
                            <MdClose />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="modal-header">
              <h3>Add New Promotion</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddPromotion}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Owner Email</label>
                  <input type="email" className="form-control" value={newPromo.userEmail} onChange={(e) => setNewPromo({...newPromo, userEmail: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Business Name</label>
                  <input type="text" className="form-control" value={newPromo.businessName} onChange={(e) => setNewPromo({...newPromo, businessName: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Banner Image URL</label>
                  <input type="url" className="form-control" value={newPromo.bannerUrl} onChange={(e) => setNewPromo({...newPromo, bannerUrl: e.target.value})} placeholder="https://..." required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Promotion</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
