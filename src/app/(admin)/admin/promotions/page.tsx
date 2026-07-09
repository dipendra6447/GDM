'use client';

import { useState, useEffect, useRef } from 'react';
import { MdListAlt, MdCheck, MdClose } from 'react-icons/md';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import { fadeInUp } from '@/lib/animations';
import './Promotions.css';

export default function PromotionsPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        <div className="card-header">
          <h3><MdListAlt className="icon-mr" /> Promotion Listings</h3>
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
    </div>
  );
}
