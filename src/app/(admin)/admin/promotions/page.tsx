'use client';

import { useState, useEffect, useRef } from 'react';
import { MdListAlt, MdCheck, MdClose, MdAdd, MdRemoveRedEye, MdDelete } from 'react-icons/md';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import { fadeInUp } from '@/lib/animations';
import BusinessAdCard from '@/components/BusinessAdCard/BusinessAdCard';
import CollageMaker from '@/components/CollageMaker/CollageMaker';
import './Promotions.css';

export default function PromotionsPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewPromo, setPreviewPromo] = useState<any | null>(null);
  
  const [newPromo, setNewPromo] = useState({ 
    businessName: '', 
    category: 'IT SERVICES',
    purpose: 'Transform Your Business With Technology',
    offerTag: '🔥 Free Consultation — Limited Slots',
    businessContactDetails: '', // CTA Target Website URL
    userEmail: '',
    description: ''
  });
  const [bannerFiles, setBannerFiles] = useState<(File | null)[]>([null, null, null]);

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

  const handleDeletePromotion = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete campaign "${name}"? This action cannot be undone.`)) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchPromotions();
      } else {
        alert(data.message || 'Failed to delete promotion');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete promotion');
    }
  };

  const handleAddPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('businessName', newPromo.businessName);
      formData.append('userEmail', newPromo.userEmail);
      formData.append('category', newPromo.category);
      formData.append('purpose', newPromo.purpose);
      formData.append('offerTag', newPromo.offerTag);
      formData.append('businessContactDetails', newPromo.businessContactDetails);
      formData.append('businessDescription', newPromo.description);

      if (bannerFiles[0]) formData.append('banner', bannerFiles[0]);
      if (bannerFiles[1]) formData.append('banner2', bannerFiles[1]);
      if (bannerFiles[2]) formData.append('banner3', bannerFiles[2]);

      const token = localStorage.getItem('token');
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddModal(false);
        setBannerFiles([null, null, null]);
        setNewPromo({ businessName: '', category: 'IT SERVICES', purpose: '', offerTag: '🔥 Free Consultation — Limited Slots', businessContactDetails: '', userEmail: '', description: '' });
        fetchPromotions();
      } else {
        alert(data.message || 'Failed to add promotion.');
      }
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
        subtitle="Manage, approve, and preview business promotional listings."
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
                <th>Impressions</th>
                <th>Clicks</th>
                <th>CTR</th>
                <th>Avg CPC</th>
                <th>Total Spent</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-4">Loading promotions...</td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-4">No promotions found.</td>
                </tr>
              ) : (
                promotions.map(promo => (
                  <tr key={promo.id}>
                    <td>
                      <div className="promo-name fw-bold">{promo.businessName}</div>
                      <button 
                        type="button"
                        onClick={() => setPreviewPromo(promo)} 
                        className="btn btn-sm btn-link p-0 text-primary text-decoration-none fw-semibold"
                        style={{ fontSize: '0.8rem' }}
                      >
                        <MdRemoveRedEye className="me-1" /> Preview Collage Ad
                      </button>
                    </td>
                    <td>{promo.userEmail}</td>
                    <td>{promo.impressions !== undefined ? promo.impressions : '0'}</td>
                    <td>{promo.clicks !== undefined ? promo.clicks : '0'}</td>
                    <td>{promo.ctr !== undefined ? `${promo.ctr}%` : '0.00%'}</td>
                    <td>{promo.cpc !== undefined ? `₹${promo.cpc}` : '₹0.00'}</td>
                    <td>{promo.spent !== undefined ? `₹${promo.spent}` : '₹0'}</td>
                    <td>{new Date(promo.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(promo.status)}`}>
                        {promo.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon text-primary"
                          onClick={() => setPreviewPromo(promo)}
                          title="Preview Collage Card"
                        >
                          <MdRemoveRedEye />
                        </button>

                        {promo.status === 'pending_approval' && (
                          <>
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
                          </>
                        )}

                        <button
                          className="btn-icon text-danger"
                          onClick={() => handleDeletePromotion(promo.id, promo.businessName)}
                          title="Delete Campaign"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADMIN COLLAGE AD CARD PREVIEW MODAL */}
      {previewPromo && (
        <div className="admin-modal-overlay d-flex align-items-center justify-content-center" style={{ zIndex: 1060 }}>
          <div className="admin-modal" style={{ maxWidth: '900px', width: '90%', borderRadius: '24px', padding: '1.5rem' }}>
            <div className="modal-header border-0 pb-3 d-flex justify-content-between align-items-center">
              <h4 className="fw-bold mb-0">Collage Ad Card Live Preview</h4>
              <button className="close-btn btn-close" onClick={() => setPreviewPromo(null)}></button>
            </div>
            <div className="modal-body p-0">
              <BusinessAdCard
                businessName={previewPromo.businessName}
                category={previewPromo.category || 'IT SERVICES'}
                purpose={previewPromo.purpose || 'Transform Your Business With Technology'}
                description={previewPromo.businessDescription}
                offerTag={previewPromo.offerTag || '🔥 Free Consultation — Limited Slots'}
                bannerUrl={previewPromo.bannerUrl}
                ctaHref={previewPromo.businessContactDetails || '#'}
              />
            </div>
            <div className="modal-footer border-0 pt-3">
              <button className="btn btn-secondary px-4" style={{ borderRadius: '10px' }} onClick={() => setPreviewPromo(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN ADD PROMOTION MODAL WITH COLLAGE MAKER */}
      {showAddModal && (
        <div className="admin-modal-overlay d-flex align-items-center justify-content-center" style={{ zIndex: 1060 }}>
          <div className="admin-modal" style={{ maxWidth: '800px', width: '90%', borderRadius: '24px', padding: '1.75rem' }}>
            <div className="modal-header border-0 pb-2 d-flex justify-content-between align-items-center">
              <h3 className="fw-bold mb-0">Add New Business Promotion</h3>
              <button className="close-btn btn-close" onClick={() => setShowAddModal(false)}></button>
            </div>
            <form onSubmit={handleAddPromotion}>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary">Owner Email *</label>
                    <input type="email" className="form-control" value={newPromo.userEmail} onChange={(e) => setNewPromo({...newPromo, userEmail: e.target.value})} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary">Business Name *</label>
                    <input type="text" className="form-control" value={newPromo.businessName} onChange={(e) => setNewPromo({...newPromo, businessName: e.target.value})} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary">Category</label>
                    <input type="text" className="form-control" value={newPromo.category} onChange={(e) => setNewPromo({...newPromo, category: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary">Tagline / Purpose</label>
                    <input type="text" className="form-control" value={newPromo.purpose} onChange={(e) => setNewPromo({...newPromo, purpose: e.target.value})} />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-semibold text-secondary">CTA Destination Link / Website URL *</label>
                    <input type="url" className="form-control" value={newPromo.businessContactDetails} onChange={(e) => setNewPromo({...newPromo, businessContactDetails: e.target.value})} placeholder="https://yourbusiness.com" required />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-semibold text-secondary">Offer Pill / Badge Text</label>
                    <input type="text" className="form-control" value={newPromo.offerTag} onChange={(e) => setNewPromo({...newPromo, offerTag: e.target.value})} />
                  </div>

                  {/* COLLAGE MAKER COMPONENT IN ADMIN SECTION */}
                  <div className="col-md-12">
                    <CollageMaker
                      files={bannerFiles}
                      onFilesChange={setBannerFiles}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary px-4">Add Promotion</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
