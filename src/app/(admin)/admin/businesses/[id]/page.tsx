'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { MdStorefront, MdVisibility, MdCheck, MdClose, MdArrowBack, MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';
import CollageMaker from '@/components/CollageMaker/CollageMaker';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BusinessDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id: businessUserId } = use(params);

  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'campaigns' | 'billing'>('profile');

  // Modal / Form state for Add/Edit Campaign
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [bannerFiles, setBannerFiles] = useState<(File | null)[]>([null, null, null]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    businessName: '',
    category: 'IT SERVICES',
    purpose: 'Transform Your Business With Technology',
    offerTag: '🔥 Free Consultation — Limited Slots',
    ctaLabel: 'Visit Website',
    businessContactDetails: '',
    userEmail: '',
    description: ''
  });

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/admin/businesses/${businessUserId}/details`);
      if (res.success) {
        setDetails(res.data);
      } else {
        setError(res.message || 'Failed to fetch business details');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load business details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [businessUserId]);

  const handleOpenAddModal = () => {
    setEditingPromo(null);
    setFormData({
      businessName: details?.profile?.businessName || '',
      category: details?.profile?.businessCategory || 'IT SERVICES',
      purpose: 'Transform Your Business With Technology',
      offerTag: '🔥 Free Consultation — Limited Slots',
      ctaLabel: 'Visit Website',
      businessContactDetails: details?.profile?.websiteUrl || '',
      userEmail: details?.user?.email || '',
      description: ''
    });
    setBannerFiles([null, null, null]);
    setExistingImageUrls([]);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditModal = (camp: any) => {
    setEditingPromo(camp);
    setFormData({
      businessName: camp.businessName || details?.profile?.businessName || '',
      category: camp.category || 'IT SERVICES',
      purpose: camp.purpose || '',
      offerTag: camp.offerTag || '🔥 Free Consultation — Limited Slots',
      ctaLabel: camp.ctaLabel || 'Visit Website',
      businessContactDetails: camp.businessContactDetails || '',
      userEmail: details?.user?.email || '',
      description: camp.businessDescription || ''
    });
    setBannerFiles([null, null, null]);
    const parsedUrls = camp.bannerUrl
      ? camp.bannerUrl.split(',').map((u: string) => u.trim()).filter(Boolean)
      : [];
    setExistingImageUrls(parsedUrls);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleUpdateCampaignStatus = async (promoId: string, status: string) => {
    if (!window.confirm(`Are you sure you want to mark this campaign as ${status}?`)) return;
    try {
      await api.patch(`/admin/promotions/${promoId}/status`, { status });
      fetchDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to update campaign status');
    }
  };

  const handleDeleteCampaign = async (promoId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete campaign "${name || 'Campaign'}"? This action cannot be undone.`)) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`/api/promotions/${promoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchDetails();
      } else {
        alert(data.message || 'Failed to delete campaign');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete campaign');
    }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const bodyData = new FormData();
      bodyData.append('businessName', formData.businessName);
      bodyData.append('userEmail', formData.userEmail);
      bodyData.append('category', formData.category);
      bodyData.append('purpose', formData.purpose);
      bodyData.append('offerTag', formData.offerTag);
      bodyData.append('ctaLabel', formData.ctaLabel);
      bodyData.append('status', (formData as any).status || 'active');
      bodyData.append('businessContactDetails', formData.businessContactDetails);
      bodyData.append('businessDescription', formData.description);

      if (bannerFiles[0]) bodyData.append('banner', bannerFiles[0]);
      if (bannerFiles[1]) bodyData.append('banner2', bannerFiles[1]);
      if (bannerFiles[2]) bodyData.append('banner3', bannerFiles[2]);

      if (editingPromo) {
        const remainingUrls = existingImageUrls.filter(Boolean);
        if (remainingUrls.length > 0) {
          bodyData.append('bannerUrl', remainingUrls.join(','));
        }
      }

      const url = editingPromo ? `/api/promotions/${editingPromo.id}` : '/api/promotions';
      const method = editingPromo ? 'PUT' : 'POST';

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: bodyData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowModal(false);
        setEditingPromo(null);
        setBannerFiles([null, null, null]);
        setExistingImageUrls([]);
        fetchDetails();
      } else {
        setErrorMsg(data.message || 'Failed to save campaign');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving campaign');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="business-details-page">
      <PageHeader
        title="Business 360° Audit"
        subtitle="Perform deep audits of promotional listings, profile indexes, and transactions."
        breadcrumbs={[
          { label: 'Home', path: '/admin' },
          { label: 'Businesses', path: '/admin/businesses' },
          { label: 'Audit Details' }
        ]}
      />

      <div className="mb-4">
        <button 
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
          onClick={() => router.push('/admin/businesses')}
          style={{ borderRadius: '8px' }}
        >
          <MdArrowBack /> Back to Businesses
        </button>
      </div>

      {loading ? (
        <div className="card border-0 shadow-sm p-5 text-center" style={{ borderRadius: '20px', backgroundColor: '#ffffff' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading details...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger p-4" style={{ borderRadius: '16px' }}>
          <i className="bi bi-exclamation-octagon-fill me-2" />
          {error}
        </div>
      ) : !details ? (
        <div className="alert alert-warning p-4" style={{ borderRadius: '16px' }}>
          No data found for this business.
        </div>
      ) : (
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '20px', backgroundColor: '#ffffff' }}>
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="p-3 bg-primary-subtle text-primary rounded-circle" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <MdStorefront size={28} />
            </div>
            <div>
              <h3 className="fw-bold mb-1" style={{ color: '#1e293b' }}>
                {details.profile?.businessName || 'Business Profile'}
              </h3>
              <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>
                Owner ID: {details.user?.email}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-4 border-bottom">
            <li className="nav-item" style={{ cursor: 'pointer' }}>
              <a className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile Details</a>
            </li>
            <li className="nav-item" style={{ cursor: 'pointer' }}>
              <a className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'campaigns' ? 'active' : ''}`} onClick={() => setActiveTab('campaigns')}>Ad Campaigns ({details.campaigns?.length || 0})</a>
            </li>
            <li className="nav-item" style={{ cursor: 'pointer' }}>
              <a className={`nav-link fw-semibold px-4 py-2 ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => setActiveTab('billing')}>Invoices Ledger ({details.invoices?.length || 0})</a>
            </li>
          </ul>

          {/* Tab Content Components */}
          <div className="py-2">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="row g-4">
                <div className="col-md-6">
                  <span className="text-secondary fw-semibold d-block mb-1" style={{ fontSize: '0.82rem' }}>BUSINESS CATEGORY</span>
                  <p className="fw-bold text-dark fs-5">{details.profile?.businessCategory || 'N/A'}</p>
                </div>
                <div className="col-md-6">
                  <span className="text-secondary fw-semibold d-block mb-1" style={{ fontSize: '0.82rem' }}>GSTIN NUMBER</span>
                  <p className="fw-bold text-dark fs-5">{details.profile?.gstNumber || 'N/A'}</p>
                </div>
                <div className="col-md-6">
                  <span className="text-secondary fw-semibold d-block mb-1" style={{ fontSize: '0.82rem' }}>CONTACT TELEPHONE</span>
                  <p className="fw-bold text-dark fs-5">{details.profile?.contactPhone || 'N/A'}</p>
                </div>
                <div className="col-md-6">
                  <span className="text-secondary fw-semibold d-block mb-1" style={{ fontSize: '0.82rem' }}>CONTACT EMAIL ADDRESS</span>
                  <p className="fw-bold text-dark fs-5">{details.profile?.contactEmail || 'N/A'}</p>
                </div>
                <div className="col-md-6">
                  <span className="text-secondary fw-semibold d-block mb-1" style={{ fontSize: '0.82rem' }}>WEBSITE URL</span>
                  <p className="fw-bold text-dark fs-5">
                    {details.profile?.websiteUrl ? (
                      <a href={details.profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-primary">
                        {details.profile.websiteUrl}
                      </a>
                    ) : 'N/A'}
                  </p>
                </div>
                <div className="col-md-6">
                  <span className="text-secondary fw-semibold d-block mb-1" style={{ fontSize: '0.82rem' }}>COMPANY LINKEDIN</span>
                  <p className="fw-bold text-dark fs-5">
                    {details.profile?.linkedinUrl ? (
                      <a href={details.profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-primary">
                        View Corporate Profile
                      </a>
                    ) : 'N/A'}
                  </p>
                </div>
                <div className="col-md-12">
                  <span className="text-secondary fw-semibold d-block mb-1" style={{ fontSize: '0.82rem' }}>REGISTERED HEADQUARTERS ADDRESS</span>
                  <p className="fw-semibold text-dark fs-5">{details.profile?.address || 'N/A'}</p>
                </div>
                <div className="col-md-12">
                  <span className="text-secondary fw-semibold d-block mb-1" style={{ fontSize: '0.82rem' }}>ABOUT THE BRAND / SERVICES</span>
                  <div className="p-3 bg-light rounded-3 text-secondary" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {details.profile?.about || 'No details provided.'}
                  </div>
                </div>
              </div>
            )}

            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-dark mb-0">Marketing Campaigns ({details.campaigns?.length || 0})</h5>
                  <button 
                    className="btn btn-primary btn-sm d-flex align-items-center gap-1 px-3 py-2" 
                    onClick={handleOpenAddModal}
                    style={{ borderRadius: '10px' }}
                  >
                    <MdAdd size={18} /> Add Campaign
                  </button>
                </div>

                <div className="table-responsive">
                  {details.campaigns?.length === 0 ? (
                    <div className="card border-0 shadow-sm p-4 text-center" style={{ borderRadius: '16px' }}>
                      <p className="text-secondary mb-3">No marketing campaigns created for this business yet.</p>
                      <div>
                        <button 
                          className="btn btn-primary btn-sm px-4 py-2 fw-semibold" 
                          onClick={handleOpenAddModal}
                          style={{ borderRadius: '10px' }}
                        >
                          <MdAdd size={18} className="me-1" /> Add Campaign Now
                        </button>
                      </div>
                    </div>
                  ) : (
                    <table className="table align-middle table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Banner</th>
                          <th>Category</th>
                          <th>Impressions</th>
                          <th>Clicks</th>
                          <th>CTR</th>
                          <th>Avg CPC</th>
                          <th>Total Cost</th>
                          <th>Status</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.campaigns.map((camp: any) => (
                          <tr key={camp.id}>
                            <td>
                              {camp.bannerUrl ? (
                                <a href={camp.bannerUrl} target="_blank" rel="noopener noreferrer">
                                  <img 
                                    src={camp.bannerUrl.split(',')[0]} 
                                    alt="Banner" 
                                    style={{ width: '90px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} 
                                  />
                                </a>
                              ) : (
                                <span className="text-muted">No banner</span>
                              )}
                            </td>
                            <td className="fw-semibold">{camp.category}</td>
                            <td>{camp.impressions !== undefined ? camp.impressions : '0'}</td>
                            <td>{camp.clicks !== undefined ? camp.clicks : '0'}</td>
                            <td className="fw-semibold text-primary">{camp.ctr !== undefined ? `${camp.ctr}%` : '0.00%'}</td>
                            <td>{camp.cpc !== undefined ? `₹${camp.cpc}` : '₹0.00'}</td>
                            <td className="fw-semibold text-dark">{camp.spent !== undefined ? `₹${camp.spent}` : '₹0'}</td>
                            <td>
                              <select 
                                className={`form-select form-select-sm fw-semibold border ${
                                  camp.status === 'active' ? 'bg-success-subtle text-success border-success' : 
                                  camp.status === 'pending_approval' ? 'bg-warning-subtle text-warning border-warning' : 
                                  camp.status === 'rejected' ? 'bg-danger-subtle text-danger border-danger' : 
                                  'bg-light text-secondary'
                                }`} 
                                style={{ borderRadius: '6px', fontSize: '0.8rem', width: 'auto' }}
                                value={camp.status || 'draft'}
                                onChange={(e) => handleUpdateCampaignStatus(camp.id, e.target.value)}
                              >
                                <option value="active">Active (Approved)</option>
                                <option value="pending_approval">Pending Approval</option>
                                <option value="draft">Draft</option>
                                <option value="rejected">Rejected</option>
                                <option value="expired">Expired</option>
                              </select>
                            </td>
                            <td className="text-center">
                              <div className="d-flex justify-content-center gap-1">
                                {camp.status !== 'active' && (
                                  <button 
                                    className="btn btn-sm btn-success p-1 d-flex align-items-center justify-content-center gap-1 px-2"
                                    onClick={() => handleUpdateCampaignStatus(camp.id, 'active')}
                                    title="Approve & Activate Campaign"
                                    style={{ borderRadius: '8px', fontSize: '0.8rem' }}
                                  >
                                    <MdCheck size={18} /> Approve
                                  </button>
                                )}

                                <button 
                                  className="btn btn-sm btn-outline-primary p-1 d-flex align-items-center justify-content-center"
                                  onClick={() => handleOpenEditModal(camp)}
                                  title="Edit Campaign"
                                  style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                                >
                                  <MdEdit size={16} />
                                </button>

                                {camp.status === 'active' && (
                                  <button 
                                    className="btn btn-sm btn-outline-danger p-1 d-flex align-items-center justify-content-center"
                                    onClick={() => handleUpdateCampaignStatus(camp.id, 'rejected')}
                                    title="Reject / Deactivate Campaign"
                                    style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                                  >
                                    <MdClose size={18} />
                                  </button>
                                )}

                                <button 
                                  className="btn btn-sm btn-outline-danger p-1 d-flex align-items-center justify-content-center"
                                  onClick={() => handleDeleteCampaign(camp.id, camp.businessName)}
                                  title="Delete Campaign"
                                  style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                                >
                                  <MdDelete size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Billing Ledger Tab */}
            {activeTab === 'billing' && (
              <div className="table-responsive">
                {details.invoices?.length === 0 ? (
                  <div className="text-center py-5 text-secondary">No billing transactions recorded.</div>
                ) : (
                  <table className="table align-middle table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Invoice No</th>
                        <th>Purchase Date</th>
                        <th>Billing Cycle</th>
                        <th>Total Price</th>
                        <th className="text-center">Ledger File</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.invoices.map((inv: any) => (
                        <tr key={inv.id}>
                          <td className="fw-bold" style={{ color: '#1e293b' }}>{inv.invoiceNumber}</td>
                          <td>{new Date(inv.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td>
                            <span className="badge bg-light text-dark text-capitalize border" style={{ borderRadius: '6px', fontSize: '0.8rem', padding: '5px 10px' }}>
                              {inv.tier}
                            </span>
                          </td>
                          <td className="fw-bold text-dark">₹{inv.totalAmount}</td>
                          <td className="text-center">
                            <a 
                              href={`/invoice/${inv.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 py-1 px-3"
                              style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                            >
                              <MdVisibility /> View &amp; Print
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ADMIN ADD / EDIT CAMPAIGN MODAL WITH COLLAGE MAKER */}
      {showModal && (
        <div className="admin-modal-overlay d-flex align-items-center justify-content-center" style={{ zIndex: 1060, position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
          <div className="admin-modal bg-white" style={{ maxWidth: '800px', width: '90%', borderRadius: '24px', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header border-0 pb-2 d-flex justify-content-between align-items-center">
              <h3 className="fw-bold mb-0" style={{ color: '#111c44' }}>
                {editingPromo ? 'Edit Business Campaign' : 'Add Campaign For Business'}
              </h3>
              <button className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
            </div>
            
            <form onSubmit={handleSaveCampaign}>
              <div className="modal-body py-3">
                {errorMsg && (
                  <div className="alert alert-danger border-0 mb-3 p-3" style={{ borderRadius: '12px' }}>
                    <i className="bi bi-exclamation-octagon-fill me-2" />
                    {errorMsg}
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Owner Email *</label>
                    <input type="email" className="form-control px-3 py-2" style={{ borderRadius: '10px' }} value={formData.userEmail} onChange={(e) => setFormData({...formData, userEmail: e.target.value})} required readOnly />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Business Name *</label>
                    <input type="text" className="form-control px-3 py-2" style={{ borderRadius: '10px' }} value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Business Category *</label>
                    <input type="text" className="form-control px-3 py-2" style={{ borderRadius: '10px' }} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Campaign Tagline / Purpose</label>
                    <input type="text" className="form-control px-3 py-2" style={{ borderRadius: '10px' }} value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Dynamic Button Text (CTA Label) *</label>
                    <input type="text" className="form-control px-3 py-2" style={{ borderRadius: '10px' }} value={formData.ctaLabel} onChange={(e) => setFormData({...formData, ctaLabel: e.target.value})} placeholder="e.g. Visit Website, Book Consultation, Learn More" required />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>CTA Destination Link / Website URL *</label>
                    <input type="url" className="form-control px-3 py-2" style={{ borderRadius: '10px' }} value={formData.businessContactDetails} onChange={(e) => setFormData({...formData, businessContactDetails: e.target.value})} placeholder="https://yourbusiness.com" required />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Offer Pill / Badge Text</label>
                    <input type="text" className="form-control px-3 py-2" style={{ borderRadius: '10px' }} value={formData.offerTag} onChange={(e) => setFormData({...formData, offerTag: e.target.value})} />
                  </div>

                  {/* COLLAGE MAKER COMPONENT */}
                  <div className="col-md-12">
                    <CollageMaker
                      files={bannerFiles}
                      onFilesChange={setBannerFiles}
                      urls={existingImageUrls}
                      onUrlsChange={setExistingImageUrls}
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Campaign Description</label>
                    <textarea 
                      name="description" 
                      className="form-control px-3 py-2" 
                      style={{ borderRadius: '10px' }}
                      rows={3}
                      value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-outline-secondary px-4 py-2" style={{ borderRadius: '12px' }} onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-primary px-4 py-2 fw-semibold" style={{ borderRadius: '12px' }} disabled={submitting}>
                  {submitting ? 'Saving...' : editingPromo ? 'Update Campaign' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
