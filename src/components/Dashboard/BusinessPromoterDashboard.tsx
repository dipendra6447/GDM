"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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

export default function BusinessPromoterDashboard() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>({ impressions: 0, clicks: 0, spent: 0, ctr: 0, cpc: 0 });

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    purpose: '',
    bannerUrl: '',
    businessDescription: '',
    businessContactDetails: '',
    foundationDate: '',
  });

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
  const pendingPromosCount = promotions.filter(p => p.status === 'pending_approval').length;
  const draftPromosCount = promotions.filter(p => p.status === 'draft').length;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
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
      if (activeSub?.id) {
        bodyData.append('subscriptionId', activeSub.id);
      }
      if (bannerFile) {
        bodyData.append('banner', bannerFile);
      }

      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: bodyData,
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setShowModal(false);
        setBannerFile(null);
        setFormData({
          businessName: '',
          category: '',
          purpose: '',
          bannerUrl: '',
          businessDescription: '',
          businessContactDetails: '',
          foundationDate: '',
        });
        fetchDashboardData();
      } else {
        setErrorMsg(result.message || 'Failed to submit campaign.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

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
          value={`₹${totals.spent}`} 
          icon="bi-currency-rupee" 
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
          value={`₹${totals.cpc}`} 
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

      {/* Campaign List Section */}
      <div className="dash-recommended-section mt-5">
        <h3 className="d-flex justify-content-between align-items-center fw-bold text-dark mb-4">
          My Campaigns
          <button 
            onClick={() => setShowModal(true)} 
            className="btn btn-primary px-4 py-2 fw-semibold" 
            style={{ borderRadius: '12px', background: '#4318ff', border: 'none' }}
          >
            <i className="bi bi-plus-lg me-2" />Launch Campaign
          </button>
        </h3>

        {promotions.length === 0 ? (
          <div className="card border-0 shadow-sm p-5 text-center" style={{ borderRadius: '20px', backgroundColor: '#ffffff' }}>
            <i className="bi bi-megaphone text-secondary fs-1 mb-3" />
            <h5 className="fw-bold mb-1" style={{ color: '#1e293b' }}>No Campaigns Yet</h5>
            <p className="text-secondary mb-4">Create your first ad banner to promote your services on JobNest.</p>
            <div>
              <button 
                onClick={() => setShowModal(true)} 
                className="btn btn-outline-primary px-4 py-2" 
                style={{ borderRadius: '10px' }}
              >
                Launch Campaign
              </button>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {promotions.map((promo) => (
              <div className="col-lg-4 col-md-6" key={promo.id}>
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '20px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                  {promo.bannerUrl ? (
                    <img 
                      src={promo.bannerUrl} 
                      alt="Campaign Banner" 
                      style={{ width: '100%', height: '150px', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center bg-light text-secondary" style={{ height: '150px' }}>
                      <i className="bi bi-image fs-1 mb-1" />
                      <span style={{ fontSize: '0.8rem' }}>No Banner Uploaded</span>
                    </div>
                  )}
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                      <h4 className="fw-bold mb-0 text-truncate" style={{ fontSize: '1.1rem', color: '#1e293b' }}>
                        {promo.businessName}
                      </h4>
                      <span className={`badge px-2 py-1 ${
                        promo.status === 'active' ? 'bg-success-subtle text-success border border-success' :
                        promo.status === 'pending_approval' ? 'bg-warning-subtle text-warning border border-warning' :
                        promo.status === 'expired' ? 'bg-danger-subtle text-danger border border-danger' : 
                        'bg-light text-secondary border border-secondary'
                      }`} style={{ borderRadius: '8px', textTransform: 'capitalize', fontSize: '0.75rem' }}>
                        {promo.status?.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-secondary flex-grow-1 mb-4" style={{ fontSize: '0.88rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {promo.purpose || 'No campaign goals declared yet.'}
                    </p>

                    <div className="d-flex justify-content-between align-items-center pt-3 border-top border-light">
                      <span className="badge bg-primary-subtle text-primary px-3 py-2 fw-semibold" style={{ borderRadius: '8px', fontSize: '0.75rem' }}>
                        <i className="bi bi-tag-fill me-1" /> {promo.category}
                      </span>
                      <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                        {new Date(promo.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Promotion Modal Popup */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(17, 28, 68, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 p-3" style={{ borderRadius: '24px', backgroundColor: '#ffffff', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
                <div className="modal-header border-0 pb-0">
                  <h4 className="modal-title fw-bold" style={{ color: '#111c44' }}>Create Promotion Campaign</h4>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
                </div>
                
                <form onSubmit={handleCreateCampaign}>
                  <div className="modal-body py-4">
                    
                    {errorMsg && (
                      <div className="alert alert-danger border-0 mb-4 p-3" style={{ borderRadius: '12px' }}>
                        <i className="bi bi-exclamation-octagon-fill me-2" />
                        {errorMsg}
                      </div>
                    )}

                    {!activeSub && (
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
                          placeholder="Your Brand Name" 
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
                        </select>
                      </div>

                      <div className="col-md-12">
                        <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Campaign Goal / Purpose</label>
                        <input 
                          type="text" 
                          name="purpose" 
                          className="form-control px-3 py-2" 
                          style={{ borderRadius: '10px' }}
                          placeholder="e.g. Expand our enterprise software sales, Promote summer discounts" 
                          value={formData.purpose} 
                          onChange={handleInputChange} 
                        />
                      </div>

                      <div className="col-md-12">
                        <label className="form-label fw-semibold text-secondary" style={{ fontSize: '0.85rem' }}>Banner Image *</label>
                        <div className="border border-dashed p-3 text-center" style={{ borderRadius: '12px', borderStyle: 'dashed', cursor: 'pointer', position: 'relative', background: '#f8fafc' }}>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="position-absolute top-0 start-0 w-100 h-100 opacity-0" 
                            style={{ cursor: 'pointer' }}
                            onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                          />
                          <i className="bi bi-image fs-2 text-secondary mb-2 d-block" />
                          {bannerFile ? (
                            <span className="fw-bold text-primary" style={{ fontSize: '0.88rem' }}>{bannerFile.name}</span>
                          ) : (
                            <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Click or drag a banner image here to upload</span>
                          )}
                        </div>
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
                      {submitting ? 'Submitting...' : activeSub ? 'Submit for Approval' : 'Save as Draft'}
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
