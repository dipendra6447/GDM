"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import StatCard from './StatCard';
import BusinessAdCard from '../BusinessAdCard/BusinessAdCard';
import CollageMaker from '../CollageMaker/CollageMaker';
import AdBanner from '@/components/AdBanner/AdBanner';

export default function BusinessPromoterDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') || 'overview';

  const [promotions, setPromotions] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>({ impressions: 0, clicks: 0, spent: 0, ctr: 0, cpc: 0 });

  // Campaign Filter State
  const [campaignFilter, setCampaignFilter] = useState<'all' | 'active' | 'pending_approval' | 'draft' | 'expired'>('all');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bannerFiles, setBannerFiles] = useState<(File | null)[]>([null, null, null]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    purpose: '',
    offerTag: '🔥 Free Consultation — Limited Slots',
    ctaLabel: 'Visit Website',
    businessContactDetails: '', // Website CTA Destination Link
    businessDescription: '',
    foundationDate: '',
  });

  // Delete Confirmation Modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleOpenCreateModal = () => {
    setEditingPromo(null);
    setFormData({
      businessName: '',
      category: '',
      purpose: '',
      offerTag: '🔥 Free Consultation — Limited Slots',
      ctaLabel: 'Visit Website',
      businessContactDetails: '',
      businessDescription: '',
      foundationDate: '',
    });
    setBannerFiles([null, null, null]);
    setExistingImageUrls([]);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEditModal = (promo: any) => {
    setEditingPromo(promo);
    setFormData({
      businessName: promo.businessName || '',
      category: promo.category || '',
      purpose: promo.purpose || '',
      offerTag: promo.offerTag || '🔥 Free Consultation — Limited Slots',
      ctaLabel: promo.ctaLabel || 'Visit Website',
      businessContactDetails: promo.businessContactDetails || '',
      businessDescription: promo.businessDescription || '',
      foundationDate: promo.foundationDate ? new Date(promo.foundationDate).toISOString().split('T')[0] : '',
    });
    setBannerFiles([null, null, null]);
    const parsedUrls = promo.bannerUrl 
      ? promo.bannerUrl.split(',').map((u: string) => u.trim()).filter(Boolean)
      : [];
    setExistingImageUrls(parsedUrls);
    setErrorMsg('');
    setShowModal(true);
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      setLoading(true);
      const [promosRes, subsRes, catsRes, analyticsRes] = await Promise.all([
        fetch('/api/promotions/my', { headers }),
        fetch('/api/subscriptions/my', { headers }),
        fetch('/api/categories/business'),
        fetch('/api/promotions/analytics', { headers })
      ]);

      if (promosRes.ok) {
        const promosJson = await promosRes.json();
        if (promosJson.success) setPromotions(promosJson.data);
      }

      if (subsRes.ok) {
        const subsJson = await subsRes.json();
        if (subsJson.success) setSubscriptions(subsJson.data);
      }

      if (catsRes.ok) {
        const catsJson = await catsRes.json();
        if (catsJson.success) setCategories(catsJson.data);
      }

      if (analyticsRes.ok) {
        const analyticsJson = await analyticsRes.json();
        if (analyticsJson.success) {
          setChartData(analyticsJson.data.chartData || []);
          setTotals(analyticsJson.data.totals || { impressions: 0, clicks: 0, spent: 0, ctr: 0, cpc: 0 });
        }
      }
    } catch (err) {
      console.error('Error loading promoter dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const activeSub = subscriptions.find(s => 
    s.subscriptionType === 'business_promoter' && 
    s.status === 'active' && 
    new Date(s.expiresAt) > new Date()
  );

  const activePromosCount = promotions.filter(p => p.status === 'active').length;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.category) {
      setErrorMsg('Business name and category are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('token');
      const bodyData = new FormData();
      bodyData.append('businessName', formData.businessName);
      bodyData.append('category', formData.category);
      bodyData.append('purpose', formData.purpose);
      bodyData.append('businessDescription', formData.businessDescription);
      bodyData.append('businessContactDetails', formData.businessContactDetails);
      bodyData.append('foundationDate', formData.foundationDate);
      bodyData.append('offerTag', formData.offerTag);
      bodyData.append('ctaLabel', formData.ctaLabel);

      if (!editingPromo && activeSub?.id) {
        bodyData.append('subscriptionId', activeSub.id);
      }

      // Attach collage images or existing URLs
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

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: bodyData,
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setShowModal(false);
        setEditingPromo(null);
        setBannerFiles([null, null, null]);
        setFormData({
          businessName: '',
          category: '',
          purpose: '',
          offerTag: '🔥 Free Consultation — Limited Slots',
          ctaLabel: 'Visit Website',
          businessContactDetails: '',
          businessDescription: '',
          foundationDate: '',
        });
        fetchDashboardData();
        router.push('/dashboard?tab=campaigns');
      } else {
        setErrorMsg(result.message || 'Failed to save campaign.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteCampaign = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/promotions/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setDeleteTarget(null);
        fetchDashboardData();
      } else {
        alert(json.message || 'Failed to delete campaign');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred while deleting');
    } finally {
      setDeleting(false);
    }
  };

  const filteredPromotions = campaignFilter === 'all'
    ? promotions
    : promotions.filter(p => p.status === campaignFilter);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="business-promoter-dashboard">
      
      {/* Expiry / Warning Alert Banner */}
      {!activeSub && (
        <div className="alert alert-warning border-warning bg-transparent text-warning p-3 mb-4 d-flex justify-content-between align-items-center" style={{ borderRadius: '16px' }}>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill fs-5" />
            <div>
              <span className="fw-bold">No Active Promotion Subscription:</span> You need an active subscription to make your ad campaigns live. Any new campaigns will be saved as drafts.
            </div>
          </div>
          <Link href="/subscription-light" className="btn btn-sm btn-warning text-dark fw-bold px-3 py-1" style={{ borderRadius: '8px' }}>
            Buy Plan
          </Link>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          {/* Overview Stat Cards */}
          <div className="dash-stats-grid mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <StatCard 
              title="Active Ads" 
              value={activePromosCount} 
              icon="bi-megaphone-fill" 
              colorScheme="green" 
            />
            <StatCard 
              title="Total Spent" 
              value={`$${totals.spent}`} 
              icon="bi-currency-dollar" 
              colorScheme="orange" 
            />
            <StatCard 
              title="Avg CTR" 
              value={`${totals.ctr}%`} 
              icon="bi-percent" 
              colorScheme="blue" 
            />
            <StatCard 
              title="Avg CPC" 
              value={`$${totals.cpc}`} 
              icon="bi-graph-up-arrow" 
              colorScheme="purple" 
            />
            <StatCard 
              title="Impressions" 
              value={totals.impressions} 
              icon="bi-eye-fill" 
              colorScheme="cyan" 
            />
            <StatCard 
              title="Active Subscription" 
              value={activeSub ? activeSub.tier.toUpperCase() : 'NONE'} 
              icon="bi-shield-check" 
              colorScheme="purple" 
            />
          </div>

          {/* Analytics Chart Section */}
          <div className="row g-4 mb-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '20px', backgroundColor: '#ffffff' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="fw-bold mb-0" style={{ fontSize: '1.25rem', color: '#1e293b' }}>Promotions Reach &amp; Clicks</h3>
                  <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Last 6 Months</span>
                </div>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="impressions" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 8 }} name="Impressions" />
                      <Line type="monotone" dataKey="clicks" stroke="#4318ff" strokeWidth={3} activeDot={{ r: 6 }} name="Clicks" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* 750x150 Ad Banner */}
          <div className="mb-4">
            <AdBanner />
          </div>
        </>
      )}

      {/* MY CAMPAIGNS TAB */}
      {activeTab === 'campaigns' && (
        <div className="dash-recommended-section mt-2">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold text-dark mb-1">My Campaigns</h3>
              <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>Manage all your promotional campaigns, status, and details</p>
            </div>
            <button 
              onClick={handleOpenCreateModal} 
              className="btn btn-primary px-4 py-2 fw-semibold mt-2 mt-md-0 d-flex align-items-center gap-2" 
              style={{ borderRadius: '12px', background: '#4318ff', border: 'none' }}
            >
              <i className="bi bi-plus-circle-fill" />
              Launch Campaign
            </button>
          </div>

          {/* Campaign Status Filter Tabs */}
          <div className="d-flex gap-2 mb-4 flex-wrap pb-2">
            {(['all', 'active', 'pending_approval', 'draft', 'expired'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setCampaignFilter(st)}
                className={`btn btn-sm px-3 py-2 fw-semibold text-capitalize ${
                  campaignFilter === st ? 'btn-primary' : 'btn-light text-secondary'
                }`}
                style={{ borderRadius: '10px' }}
              >
                {st === 'pending_approval' ? 'Pending Approval' : st}
              </button>
            ))}
          </div>

          {filteredPromotions.length === 0 ? (
            <div className="card border-0 shadow-sm p-5 text-center" style={{ borderRadius: '20px', backgroundColor: '#ffffff' }}>
              <i className="bi bi-megaphone text-secondary fs-1 mb-3" />
              <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>No Campaigns Found</h5>
              <p className="text-secondary mb-4">Create your first ad banner to promote your services on JobNest.</p>
              <div>
                <button 
                  onClick={handleOpenCreateModal} 
                  className="btn btn-primary px-4 py-2 fw-semibold" 
                  style={{ borderRadius: '12px', background: '#4318ff', border: 'none' }}
                >
                  <i className="bi bi-plus-circle-fill me-2" /> Launch Campaign
                </button>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {filteredPromotions.map((promo) => (
                <BusinessAdCard
                  key={promo.id}
                  businessName={promo.businessName}
                  category={promo.category || 'IT SERVICES'}
                  purpose={promo.purpose || 'Transform Your Business With Technology'}
                  description={promo.businessDescription}
                  offerTag={promo.offerTag || '🔥 Free Consultation — Limited Slots'}
                  ctaLabel={promo.ctaLabel || 'Visit Website'}
                  bannerUrl={promo.bannerUrl}
                  ctaHref={promo.businessContactDetails || '#'}
                  status={promo.status}
                  onEdit={() => handleOpenEditModal(promo)}
                  onDelete={() => setDeleteTarget({ id: promo.id, name: promo.businessName })}
                  statusBadge={
                    <span className={`badge px-2 py-1 ${
                      promo.status === 'active' ? 'bg-success-subtle text-success border border-success' :
                      promo.status === 'pending_approval' ? 'bg-warning-subtle text-warning border border-warning' :
                      promo.status === 'expired' ? 'bg-danger-subtle text-danger border border-danger' : 
                      'bg-light text-secondary border border-secondary'
                    }`} style={{ borderRadius: '8px', textTransform: 'capitalize', fontSize: '0.75rem' }}>
                      {promo.status?.replace('_', ' ')}
                    </span>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="mt-3">
          <h3 className="fw-bold text-dark mb-4">Campaign Analytics &amp; Reach Performance</h3>
          
          <div className="dash-stats-grid mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <StatCard title="Impressions" value={totals.impressions} icon="bi-eye-fill" colorScheme="cyan" />
            <StatCard title="Total Clicks" value={totals.clicks} icon="bi-cursor-fill" colorScheme="blue" />
            <StatCard title="Avg CTR" value={`${totals.ctr}%`} icon="bi-percent" colorScheme="green" />
            <StatCard title="Avg CPC" value={`$${totals.cpc}`} icon="bi-graph-up-arrow" colorScheme="purple" />
          </div>

          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '20px', backgroundColor: '#ffffff' }}>
            <h4 className="fw-bold mb-3" style={{ fontSize: '1.1rem' }}>Performance Breakdown</h4>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="impressions" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 8 }} name="Impressions" />
                  <Line type="monotone" dataKey="clicks" stroke="#4318ff" strokeWidth={3} activeDot={{ r: 6 }} name="Clicks" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(17, 28, 68, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 p-4" style={{ borderRadius: '20px', backgroundColor: '#ffffff' }}>
                <div className="text-center py-2">
                  <div className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-danger-subtle text-danger rounded-circle" style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-exclamation-triangle-fill fs-3" />
                  </div>
                  <h4 className="fw-bold text-dark mb-2">Delete Campaign?</h4>
                  <p className="text-secondary mb-4" style={{ fontSize: '0.9rem' }}>
                    Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? This action cannot be undone and will permanently remove your promotional listing.
                  </p>
                  <div className="d-flex justify-content-center gap-3">
                    <button
                      type="button"
                      className="btn btn-light px-4 py-2 fw-semibold"
                      style={{ borderRadius: '10px' }}
                      onClick={() => setDeleteTarget(null)}
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger px-4 py-2 fw-semibold"
                      style={{ borderRadius: '10px' }}
                      onClick={confirmDeleteCampaign}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Yes, Delete Campaign'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ zIndex: 1055, backgroundColor: '#111c44', opacity: 0.4 }}></div>
        </>
      )}

      {/* Create / Edit Promotion Modal Popup */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(17, 28, 68, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 p-3" style={{ borderRadius: '24px', backgroundColor: '#ffffff', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
                <div className="modal-header border-0 pb-0">
                  <h4 className="modal-title fw-bold" style={{ color: '#111c44' }}>
                    {editingPromo ? 'Edit Promotion Campaign' : 'Create Promotion Campaign'}
                  </h4>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
                </div>
                
                <form onSubmit={handleSaveCampaign}>
                  <div className="modal-body py-4">
                    
                    {errorMsg && (
                      <div className="alert alert-danger border-0 mb-4 p-3" style={{ borderRadius: '12px' }}>
                        <i className="bi bi-exclamation-octagon-fill me-2" />
                        {errorMsg}
                      </div>
                    )}

                    {!activeSub && !editingPromo && (
                      <div className="alert alert-info border-0 mb-4 p-3 d-flex align-items-start gap-2" style={{ borderRadius: '12px', background: 'rgba(67, 24, 255, 0.05)', color: '#4318ff' }}>
                        <i className="bi bi-info-circle-fill mt-1" />
                        <div style={{ fontSize: '0.85rem' }}>
                          You do not have an active subscription. This campaign will be created as a <strong>Draft</strong>. You can activate it later after buying a plan.
                        </div>
                      </div>
                    )}

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Business Name *</label>
                        <input 
                          type="text" 
                          name="businessName" 
                          className="form-control px-3 py-2" 
                          style={{ borderRadius: '10px' }}
                          placeholder="e.g. TechNova Solutions" 
                          value={formData.businessName} 
                          onChange={handleInputChange} 
                          required 
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Business Category *</label>
                        <select 
                          name="category" 
                          className="form-select px-3 py-2" 
                          style={{ borderRadius: '10px' }}
                          value={formData.category} 
                          onChange={handleInputChange} 
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                          <option value="IT SERVICES">IT SERVICES</option>
                          <option value="HEALTH & WELLNESS">HEALTH & WELLNESS</option>
                          <option value="EDUCATION & COACHING">EDUCATION & COACHING</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Campaign Tagline / Purpose</label>
                        <input 
                          type="text" 
                          name="purpose" 
                          className="form-control px-3 py-2" 
                          style={{ borderRadius: '10px' }}
                          placeholder="e.g. Transform Your Business With Technology" 
                          value={formData.purpose} 
                          onChange={handleInputChange} 
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                          <i className="bi bi-cursor-fill me-1 text-primary" /> Dynamic Button Text (CTA Label) *
                        </label>
                        <input 
                          type="text" 
                          name="ctaLabel" 
                          className="form-control px-3 py-2" 
                          style={{ borderRadius: '10px' }}
                          placeholder="e.g. Visit Website, Book Consultation, Learn More, Claim Offer" 
                          value={formData.ctaLabel} 
                          onChange={handleInputChange} 
                          required
                        />
                      </div>

                      <div className="col-md-12">
                        <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>
                          <i className="bi bi-link-45deg me-1 text-primary" /> CTA Destination Link / Website URL *
                        </label>
                        <input 
                          type="url" 
                          name="businessContactDetails" 
                          className="form-control px-3 py-2" 
                          style={{ borderRadius: '10px' }}
                          placeholder="https://yourbusiness.com/landing-page" 
                          value={formData.businessContactDetails} 
                          onChange={handleInputChange} 
                          required
                        />
                      </div>

                      <div className="col-md-12">
                        <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Offer Pill / Badge Text</label>
                        <input 
                          type="text" 
                          name="offerTag" 
                          className="form-control px-3 py-2" 
                          style={{ borderRadius: '10px' }}
                          placeholder="e.g. 🔥 Free Consultation — Limited Slots" 
                          value={formData.offerTag} 
                          onChange={handleInputChange} 
                        />
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
                          name="businessDescription" 
                          className="form-control px-3 py-2" 
                          style={{ borderRadius: '10px' }}
                          rows={3}
                          placeholder="Write a brief overview of what this campaign is about..." 
                          value={formData.businessDescription} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-0 pt-0">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary px-4 py-2" 
                      style={{ borderRadius: '12px' }}
                      onClick={() => setShowModal(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary px-4 py-2 fw-semibold" 
                      style={{ borderRadius: '12px', background: '#4318ff', border: 'none' }}
                      disabled={submitting}
                    >
                      {submitting ? 'Saving...' : editingPromo ? 'Update Campaign' : activeSub ? 'Submit for Approval' : 'Save as Draft'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ zIndex: 1040, backgroundColor: '#111c44', opacity: 0.4 }}></div>
        </>
      )}

    </div>
  );
}
