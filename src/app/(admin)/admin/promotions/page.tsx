'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MdListAlt,
  MdCheck,
  MdClose,
  MdAdd,
  MdRemoveRedEye,
  MdDelete,
  MdEdit,
  MdStorefront,
  MdFilterList,
} from 'react-icons/md';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import { fadeInUp } from '@/lib/animations';
import BusinessAdCard from '@/components/BusinessAdCard/BusinessAdCard';
import CollageMaker from '@/components/CollageMaker/CollageMaker';
import './Promotions.css';

export default function PromotionsPage() {
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [promotions, setPromotions] = useState<any[]>([]);
  const [registeredBusinesses, setRegisteredBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any | null>(null);
  const [previewPromo, setPreviewPromo] = useState<any | null>(null);

  const [newPromo, setNewPromo] = useState({
    businessName: '',
    category: 'IT SERVICES',
    purpose: 'Transform Your Business With Technology',
    offerTag: '🔥 Free Consultation — Limited Slots',
    ctaLabel: 'Visit Website',
    businessContactDetails: '',
    userEmail: '',
    description: '',
    status: 'active',
  });
  const [bannerFiles, setBannerFiles] = useState<(File | null)[]>([null, null, null]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [bannerPositions, setBannerPositions] = useState<string[]>(['50% 50%', '50% 50%', '50% 50%']);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError('');
      const [promoRes, usersRes] = await Promise.all([
        api.get('/admin/promotions'),
        api.get('/admin/users').catch(() => ({ success: false, data: [] })),
      ]);

      if (promoRes.success) {
        setPromotions(promoRes.data);
      } else {
        setError(promoRes.message || 'Failed to fetch promotions');
      }

      if (usersRes.success) {
        const promoters = usersRes.data.filter(
          (u: any) => u.roles?.some((r: any) => r.roleId === 3) && !u.isDeleted
        );
        setRegisteredBusinesses(promoters);
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

  const handleOpenAddModal = () => {
    setEditingPromo(null);
    setNewPromo({
      businessName: '',
      category: 'IT SERVICES',
      purpose: 'Transform Your Business With Technology',
      offerTag: '🔥 Free Consultation — Limited Slots',
      ctaLabel: 'Visit Website',
      businessContactDetails: '',
      userEmail: registeredBusinesses[0]?.email || '',
      description: '',
      status: 'active',
    });
    setBannerFiles([null, null, null]);
    setExistingImageUrls([]);
    setBannerPositions(['50% 50%', '50% 50%', '50% 50%']);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (promo: any) => {
    setEditingPromo(promo);
    setNewPromo({
      businessName: promo.businessName || '',
      category: promo.category || 'IT SERVICES',
      purpose: promo.purpose || '',
      offerTag: promo.offerTag || '🔥 Free Consultation — Limited Slots',
      ctaLabel: promo.ctaLabel || 'Visit Website',
      businessContactDetails: promo.businessContactDetails || '',
      userEmail: promo.userEmail || '',
      description: promo.businessDescription || '',
      status: promo.status || 'active',
    });
    setBannerFiles([null, null, null]);
    const parsedUrls = promo.bannerUrl
      ? promo.bannerUrl.split(',').map((u: string) => u.trim()).filter(Boolean)
      : [];
    setExistingImageUrls(parsedUrls);

    const posArray = parsedUrls.map((item: string) => {
      const parts = item.split('#pos=');
      return parts[1] ? decodeURIComponent(parts[1]) : '50% 50%';
    });
    while (posArray.length < 3) posArray.push('50% 50%');
    setBannerPositions(posArray);

    setShowAddModal(true);
  };

  const handleSelectBusinessUser = (email: string) => {
    const selected = registeredBusinesses.find((b) => b.email === email);
    setNewPromo((prev) => ({
      ...prev,
      userEmail: email,
      businessName: selected?.promoterProfile?.businessName || prev.businessName,
      category: selected?.promoterProfile?.businessCategory || prev.category,
      description: selected?.promoterProfile?.about || prev.description,
    }));
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!window.confirm(`Are you sure you want to mark this status as ${status}?`)) return;
    try {
      await api.patch(`/admin/promotions/${id}/status`, { status });
      fetchPromotions();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDeletePromotion = async (id: string, name: string) => {
    if (id.startsWith('draft_')) {
      alert('This is a registered business profile placeholder without an active campaign record.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete campaign "${name}"? This action cannot be undone.`)) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
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

  const handleSavePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('businessName', newPromo.businessName);
      formData.append('userEmail', newPromo.userEmail);
      formData.append('category', newPromo.category);
      formData.append('purpose', newPromo.purpose);
      formData.append('offerTag', newPromo.offerTag);
      formData.append('ctaLabel', newPromo.ctaLabel);
      formData.append('status', newPromo.status || 'active');
      formData.append('businessContactDetails', newPromo.businessContactDetails);
      formData.append('businessDescription', newPromo.description);

      if (bannerFiles[0]) formData.append('banner', bannerFiles[0]);
      if (bannerFiles[1]) formData.append('banner2', bannerFiles[1]);
      if (bannerFiles[2]) formData.append('banner3', bannerFiles[2]);

      formData.append('bannerPositions', bannerPositions.join(','));

      if (editingPromo && !editingPromo.isDraftPlaceholder) {
        const remainingUrls = existingImageUrls.filter(Boolean);
        if (remainingUrls.length > 0) {
          formData.append('bannerUrl', remainingUrls.join(','));
        }
      }

      const isEditExisting = editingPromo && !editingPromo.isDraftPlaceholder;
      const url = isEditExisting ? `/api/promotions/${editingPromo.id}` : '/api/admin/promotions';
      const method = isEditExisting ? 'PUT' : 'POST';

      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddModal(false);
        setEditingPromo(null);
        setBannerFiles([null, null, null]);
        setExistingImageUrls([]);
        setBannerPositions(['50% 50%', '50% 50%', '50% 50%']);
        fetchPromotions();
      } else {
        alert(data.message || 'Failed to save promotion.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save promotion.');
    }
  };

  const filteredPromotions = promotions.filter((promo) => {
    const matchesStatus = statusFilter === 'all' || promo.status === statusFilter;
    const matchesSearch =
      searchTerm.trim() === '' ||
      promo.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="promotions-page">
      <PageHeader
        title="Business Promotions & Registered Organizations"
        subtitle="Manage, edit, approve, preview, and audit all registered businesses and campaign listings."
        breadcrumbs={[
          { label: 'Home', path: '/admin' },
          { label: 'Business Promotions' },
        ]}
      />

      <div className="admin-card" ref={contentRef}>
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h3 className="m-0 d-flex align-items-center gap-2">
            <MdListAlt className="icon-mr text-warning" /> Registered Businesses & Campaigns ({promotions.length})
          </h3>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              <MdAdd /> Add Promotion
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger m-3">{error}</div>}

        {/* Filter and Search Bar */}
        <div className="p-3 border-bottom border-secondary d-flex flex-wrap align-items-center justify-content-between gap-3" style={{ background: '#0f172a', color: '#ffffff' }}>
          <div className="d-flex align-items-center gap-2 flex-grow-1 overflow-hidden" style={{ minWidth: 0 }}>
            <span className="text-gold fw-bold small d-flex align-items-center gap-1 flex-shrink-0">
              <MdFilterList /> Status:
            </span>
            <div className="filter-pills-scroll flex-grow-1">
              {['all', 'active', 'pending_approval', 'draft', 'rejected', 'expired'].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`btn btn-sm ${statusFilter === st ? 'btn-gold font-weight-bold' : 'btn-outline-light'}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st === 'all'
                    ? 'All Listings'
                    : st === 'active'
                    ? 'Active'
                    : st === 'pending_approval'
                    ? 'Pending'
                    : st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ maxWidth: '320px', width: '100%' }}>
            <input
              type="text"
              className="form-control form-control-sm bg-dark text-white border-secondary"
              placeholder="Search business name, email, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* MOBILE CARD VIEW (VISIBLE ON SMALL SCREENS < 768px) */}
        <div className="p-3 d-block d-md-none">
          {loading ? (
            <div className="text-center py-4 text-warning">Loading registered businesses &amp; campaigns...</div>
          ) : filteredPromotions.length === 0 ? (
            <div className="text-center py-4 text-muted">No matching business promotions found.</div>
          ) : (
            filteredPromotions.map((promo) => (
              <div className="promo-mobile-card" key={promo.id}>
                <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                  <div>
                    <h5 className="fw-bold text-white mb-1" style={{ fontSize: '1.05rem' }}>{promo.businessName}</h5>
                    <span className="badge bg-secondary text-capitalize">{promo.category || 'N/A'}</span>
                  </div>
                  <select
                    className={`form-select form-select-sm fw-semibold border ${
                      promo.status === 'active'
                        ? 'bg-success-subtle text-success border-success'
                        : promo.status === 'pending_approval'
                        ? 'bg-warning-subtle text-warning border-warning'
                        : promo.status === 'rejected'
                        ? 'bg-danger-subtle text-danger border-danger'
                        : 'bg-dark text-secondary border-secondary'
                    }`}
                    style={{ borderRadius: '6px', fontSize: '0.75rem', width: 'auto' }}
                    value={promo.status || 'draft'}
                    onChange={(e) => handleUpdateStatus(promo.id, e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="pending_approval">Pending</option>
                    <option value="draft">Draft</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div className="text-light small mb-2">{promo.userEmail}</div>

                <button
                  type="button"
                  onClick={() => setPreviewPromo(promo)}
                  className="btn btn-sm btn-outline-warning text-decoration-none fw-semibold mb-2 w-100"
                  style={{ fontSize: '0.8rem', borderRadius: '8px' }}
                >
                  <MdRemoveRedEye className="me-1" /> Preview Collage Card
                </button>

                {/* 4-Metric Grid */}
                <div className="promo-metrics-grid">
                  <div>
                    <div className="metric-item-val">{promo.impressions !== undefined ? promo.impressions : '0'}</div>
                    <div className="metric-item-lbl">Views</div>
                  </div>
                  <div>
                    <div className="metric-item-val">{promo.clicks !== undefined ? promo.clicks : '0'}</div>
                    <div className="metric-item-lbl">Clicks</div>
                  </div>
                  <div>
                    <div className="metric-item-val">{promo.ctr !== undefined ? `${promo.ctr}%` : '0.00%'}</div>
                    <div className="metric-item-lbl">CTR</div>
                  </div>
                  <div>
                    <div className="metric-item-val">{promo.spent !== undefined ? `$${promo.spent}` : '$0'}</div>
                    <div className="metric-item-lbl">Spent</div>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="action-buttons justify-content-between pt-2 border-top border-secondary">
                  <button
                    className="btn btn-sm btn-outline-info flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                    onClick={() => router.push(`/admin/businesses/${promo.userId}`)}
                    title="Full Business 360° Audit"
                  >
                    <MdStorefront /> Audit 360°
                  </button>

                  <button
                    className="btn btn-sm btn-outline-primary flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                    onClick={() => handleOpenEditModal(promo)}
                    title="Edit Campaign"
                  >
                    <MdEdit /> Edit
                  </button>

                  {promo.status !== 'active' && (
                    <button
                      className="btn btn-sm btn-outline-success d-flex align-items-center justify-content-center gap-1"
                      onClick={() => handleUpdateStatus(promo.id, 'active')}
                      title="Approve Campaign"
                    >
                      <MdCheck />
                    </button>
                  )}

                  {!promo.isDraftPlaceholder && (
                    <button
                      className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center gap-1"
                      onClick={() => handleDeletePromotion(promo.id, promo.businessName)}
                      title="Delete Campaign"
                    >
                      <MdDelete />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE VIEW (VISIBLE ON SCREENS >= 768px) */}
        <div className="table-responsive d-none d-md-block">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Owner Email</th>
                <th>Category</th>
                <th>Impressions</th>
                <th>Clicks</th>
                <th>CTR</th>
                <th>Spent</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-warning">
                    Loading registered businesses &amp; campaigns...
                  </td>
                </tr>
              ) : filteredPromotions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-muted">
                    No matching business promotions found.
                  </td>
                </tr>
              ) : (
                filteredPromotions.map((promo) => (
                  <tr key={promo.id}>
                    <td>
                      <div className="promo-name fw-bold text-dark">{promo.businessName}</div>
                      <button
                        type="button"
                        onClick={() => setPreviewPromo(promo)}
                        className="btn btn-sm btn-link p-0 text-primary text-decoration-none fw-semibold"
                        style={{ fontSize: '0.8rem' }}
                      >
                        <MdRemoveRedEye className="me-1" /> Preview Collage Ad
                      </button>
                    </td>
                    <td>
                      <span className="text-secondary fw-medium">{promo.userEmail}</span>
                    </td>
                    <td>
                      <span className="badge bg-secondary text-capitalize">{promo.category || 'N/A'}</span>
                    </td>
                    <td className="fw-semibold text-dark">{promo.impressions !== undefined ? promo.impressions : '0'}</td>
                    <td className="fw-semibold text-dark">{promo.clicks !== undefined ? promo.clicks : '0'}</td>
                    <td className="fw-semibold text-dark">{promo.ctr !== undefined ? `${promo.ctr}%` : '0.00%'}</td>
                    <td className="fw-semibold text-dark">{promo.spent !== undefined ? `$${promo.spent}` : '$0'}</td>
                    <td>
                      <select
                        className={`form-select form-select-sm fw-semibold border ${
                          promo.status === 'active'
                            ? 'bg-success-subtle text-success border-success'
                            : promo.status === 'pending_approval'
                            ? 'bg-warning-subtle text-warning border-warning'
                            : promo.status === 'rejected'
                            ? 'bg-danger-subtle text-danger border-danger'
                            : 'bg-light text-secondary border-secondary'
                        }`}
                        style={{ borderRadius: '6px', fontSize: '0.8rem', minWidth: '150px' }}
                        value={promo.status || 'draft'}
                        onChange={(e) => handleUpdateStatus(promo.id, e.target.value)}
                      >
                        <option value="active">Active (Approved)</option>
                        <option value="pending_approval">Pending Approval</option>
                        <option value="draft">Draft / Registered</option>
                        <option value="rejected">Rejected</option>
                        <option value="expired">Expired</option>
                      </select>
                    </td>
                    <td className="text-center">
                      <div className="action-buttons justify-content-center">
                        <button
                          className="btn-icon text-info"
                          onClick={() => router.push(`/admin/businesses/${promo.userId}`)}
                          title="Full Business 360° Audit"
                        >
                          <MdStorefront />
                        </button>

                        <button
                          className="btn-icon text-warning me-1"
                          onClick={() => setPreviewPromo(promo)}
                          title="Preview Collage Card"
                        >
                          <MdRemoveRedEye />
                        </button>

                        <button
                          className="btn-icon text-primary me-1"
                          onClick={() => handleOpenEditModal(promo)}
                          title="Edit Campaign & Business Info"
                        >
                          <MdEdit />
                        </button>

                        {promo.status !== 'active' && (
                          <button
                            className="btn-icon text-success fw-bold me-1"
                            onClick={() => handleUpdateStatus(promo.id, 'active')}
                            title="Approve & Activate Campaign"
                          >
                            <MdCheck />
                          </button>
                        )}

                        {(promo.status === 'active' || promo.status === 'pending_approval') && (
                          <button
                            className="btn-icon text-warning me-1"
                            onClick={() => handleUpdateStatus(promo.id, 'rejected')}
                            title="Reject / Deactivate Campaign"
                          >
                            <MdClose />
                          </button>
                        )}

                        {!promo.isDraftPlaceholder && (
                          <button
                            className="btn-icon text-danger"
                            onClick={() => handleDeletePromotion(promo.id, promo.businessName)}
                            title="Delete Campaign"
                          >
                            <MdDelete />
                          </button>
                        )}
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
          <div className="admin-modal bg-dark border border-secondary" style={{ maxWidth: '900px', width: '90%', borderRadius: '24px', padding: '1.5rem' }}>
            <div className="modal-header border-0 pb-3 d-flex justify-content-between align-items-center text-white">
              <h4 className="fw-bold mb-0">Collage Ad Card Live Preview</h4>
              <button className="close-btn btn-close btn-close-white" onClick={() => setPreviewPromo(null)}></button>
            </div>
            <div className="modal-body p-0">
              <BusinessAdCard
                businessName={previewPromo.businessName}
                category={previewPromo.category || 'IT SERVICES'}
                purpose={previewPromo.purpose || 'Transform Your Business With Technology'}
                description={previewPromo.businessDescription}
                offerTag={previewPromo.offerTag || '🔥 Free Consultation — Limited Slots'}
                ctaLabel={previewPromo.ctaLabel || 'Visit Website'}
                bannerUrl={previewPromo.bannerUrl}
                ctaHref={previewPromo.businessContactDetails || '#'}
              />
            </div>
            <div className="modal-footer border-0 pt-3">
              <button className="btn btn-secondary px-4" style={{ borderRadius: '10px' }} onClick={() => setPreviewPromo(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN ADD / EDIT PROMOTION MODAL WITH REGISTERED BUSINESS SELECTION */}
      {showAddModal && (
        <div className="admin-modal-overlay d-flex align-items-center justify-content-center" style={{ zIndex: 1060 }}>
          <div className="admin-modal bg-dark text-white border border-secondary" style={{ maxWidth: '800px', width: '90%', borderRadius: '24px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header border-0 pb-2 d-flex justify-content-between align-items-center">
              <h3 className="fw-bold mb-0">
                {editingPromo ? 'Edit Business Promotion' : 'Add New Business Promotion'}
              </h3>
              <button className="close-btn btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
            </div>
            <form onSubmit={handleSavePromotion}>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-gold">Select Registered Business Owner *</label>
                    {registeredBusinesses.length > 0 ? (
                      <select
                        className="form-select bg-dark text-white border-secondary"
                        value={newPromo.userEmail}
                        onChange={(e) => handleSelectBusinessUser(e.target.value)}
                        required
                      >
                        {registeredBusinesses.map((bus) => (
                          <option key={bus.id} value={bus.email}>
                            {bus.promoterProfile?.businessName || bus.email} ({bus.email})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="email"
                        className="form-control bg-dark text-white border-secondary"
                        value={newPromo.userEmail}
                        onChange={(e) => setNewPromo({ ...newPromo, userEmail: e.target.value })}
                        placeholder="Owner Email Address"
                        required
                      />
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-gold">Business Name *</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      value={newPromo.businessName}
                      onChange={(e) => setNewPromo({ ...newPromo, businessName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-gold">Category *</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      value={newPromo.category}
                      onChange={(e) => setNewPromo({ ...newPromo, category: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-gold">Campaign Status</label>
                    <select
                      className="form-select bg-dark text-white border-secondary"
                      value={newPromo.status}
                      onChange={(e) => setNewPromo({ ...newPromo, status: e.target.value })}
                    >
                      <option value="active">Active (Approved)</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="draft">Draft</option>
                      <option value="rejected">Rejected</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-gold">Dynamic Button Text (CTA Label) *</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      value={newPromo.ctaLabel}
                      onChange={(e) => setNewPromo({ ...newPromo, ctaLabel: e.target.value })}
                      placeholder="e.g. Visit Website, Book Consultation"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-gold">CTA Website URL / Link *</label>
                    <input
                      type="url"
                      className="form-control bg-dark text-white border-secondary"
                      value={newPromo.businessContactDetails}
                      onChange={(e) => setNewPromo({ ...newPromo, businessContactDetails: e.target.value })}
                      placeholder="https://yourbusiness.com"
                      required
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-semibold text-gold">Tagline / Purpose</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      value={newPromo.purpose}
                      onChange={(e) => setNewPromo({ ...newPromo, purpose: e.target.value })}
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-semibold text-gold">Offer Pill / Badge Text</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      value={newPromo.offerTag}
                      onChange={(e) => setNewPromo({ ...newPromo, offerTag: e.target.value })}
                    />
                  </div>

                  {/* COLLAGE MAKER COMPONENT */}
                  <div className="col-md-12">
                    <CollageMaker
                      files={bannerFiles}
                      onFilesChange={setBannerFiles}
                      urls={existingImageUrls}
                      onUrlsChange={setExistingImageUrls}
                      positions={bannerPositions}
                      onPositionsChange={setBannerPositions}
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-semibold text-gold">Business Description</label>
                    <textarea
                      className="form-control bg-dark text-white border-secondary"
                      rows={3}
                      value={newPromo.description}
                      onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4">
                  {editingPromo ? 'Update Promotion' : 'Add Promotion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
