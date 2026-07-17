'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { MdStorefront, MdVisibility, MdCheck, MdClose, MdArrowBack } from 'react-icons/md';
import { api } from '@/lib/adminApi';
import PageHeader from '@/components/admin/Common/PageHeader';

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

  const handleUpdateCampaignStatus = async (promoId: string, status: string) => {
    if (!window.confirm(`Are you sure you want to mark this campaign as ${status}?`)) return;
    try {
      await api.patch(`/admin/promotions/${promoId}/status`, { status });
      fetchDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to update campaign status');
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
              <div className="table-responsive">
                {details.campaigns?.length === 0 ? (
                  <div className="text-center py-5 text-secondary">No marketing campaigns created yet.</div>
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
                                  src={camp.bannerUrl} 
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
                            <span className={`badge ${
                              camp.status === 'active' ? 'bg-success-subtle text-success border border-success' : 
                              camp.status === 'pending_approval' ? 'bg-warning-subtle text-warning border border-warning' : 
                              'bg-light text-secondary border'
                            }`} style={{ textTransform: 'capitalize', borderRadius: '6px', fontSize: '0.8rem', padding: '6px 12px' }}>
                              {camp.status?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="text-center">
                            {camp.status === 'pending_approval' ? (
                              <div className="d-flex justify-content-center gap-2">
                                <button 
                                  className="btn btn-sm btn-success p-1 d-flex align-items-center justify-content-center"
                                  onClick={() => handleUpdateCampaignStatus(camp.id, 'active')}
                                  title="Approve Campaign"
                                  style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                                >
                                  <MdCheck size={18} />
                                </button>
                                <button 
                                  className="btn btn-sm btn-danger p-1 d-flex align-items-center justify-content-center"
                                  onClick={() => handleUpdateCampaignStatus(camp.id, 'rejected')}
                                  title="Reject Campaign"
                                  style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                                >
                                  <MdClose size={18} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-muted" style={{ fontSize: '0.85rem' }}>No Action Required</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
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
    </div>
  );
}
