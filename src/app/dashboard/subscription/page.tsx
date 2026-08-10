"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import { useAuth } from '@/hooks/useAuth';

export default function SubscriptionPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [invoicesList, setInvoicesList] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [postedJobsCount, setPostedJobsCount] = useState<number>(0);
  const [error, setError] = useState('');
  const [activeRole, setActiveRole] = useState<number>(1);

  const isJobSeeker = user?.roles?.includes(1);
  const isEmployer = user?.roles?.includes(2);
  const isBusinessPromoter = user?.roles?.includes(3);

  const getBillingPrice = (sub: any) => {
    if (!sub) return 'N/A';
    if (sub.billingCycle === 'daily') return `₹${sub.planDailyPrice}/day`;
    if (sub.billingCycle === 'weekly') return `₹${sub.planWeeklyPrice}/week`;
    return `₹${sub.planMonthlyPrice}/month`;
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view subscription details');
      setLoading(false);
      return;
    }
    try {
      const fetchDashboardUrl = isJobSeeker 
        ? '/api/dashboard/job-seeker' 
        : null;

      const promises: Promise<any>[] = [
        fetch('/api/subscriptions/my', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/invoices/my', { headers: { Authorization: `Bearer ${token}` } })
      ];

      if (fetchDashboardUrl) {
        promises.push(fetch(fetchDashboardUrl, { headers: { Authorization: `Bearer ${token}` } }));
      }
      if (isEmployer) {
        promises.push(fetch('/api/jobs/employer/me', { headers: { Authorization: `Bearer ${token}` } }));
      }

      const responses = await Promise.all(promises);
      const subsJson = await responses[0].json();
      const invoicesJson = await responses[1].json();
      
      let dashboardJson: any = { success: false, data: null };
      let jobsJson: any = { success: false, data: [] };

      let nextIndex = 2;
      if (fetchDashboardUrl && responses[nextIndex]) {
        dashboardJson = await responses[nextIndex].json();
        nextIndex++;
      }
      if (isEmployer && responses[nextIndex]) {
        jobsJson = await responses[nextIndex].json();
      }

      if (subsJson.success) {
        setSubscriptions(subsJson.data || []);
      }
      if (invoicesJson.success) {
        setInvoicesList(invoicesJson.data || []);
      }
      if (dashboardJson.success) {
        setStats(dashboardJson.data?.stats || null);
      }
      if (jobsJson.success) {
        setPostedJobsCount(jobsJson.data?.length || 0);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch subscription data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const roleParam = searchParams.get('role');
      if (roleParam) {
        setActiveRole(parseInt(roleParam, 10));
      } else if (user) {
        setActiveRole(user.roles?.[0] || 1);
      }
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="dashboard-content-wrapper" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner-border text-primary my-5" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-content-wrapper" style={{ padding: '2rem' }}>
        <h2 className="mb-4">My Subscription</h2>
        <div className="alert alert-danger">Please log in to view subscription.</div>
      </div>
    );
  }

  if (!isJobSeeker && !isEmployer && !isBusinessPromoter) {
    return (
      <div className="dashboard-content-wrapper" style={{ padding: '2rem' }}>
        <h2 className="mb-4">My Subscription</h2>
        <div className="alert alert-danger">
          Access Denied. You do not have permission to view subscriptions here.
        </div>
      </div>
    );
  }

  // Active Job Seeker subscription
  const activeSeekerSub = subscriptions.find(
    (sub) => sub.subscriptionType === 'job_seeker' && sub.status === 'active' && new Date(sub.expiresAt) > new Date()
  );

  // Active Employer subscription
  const activeEmployerSub = subscriptions.find(
    (sub) => sub.subscriptionType === 'job_poster' && sub.status === 'active' && new Date(sub.expiresAt) > new Date()
  );

  // Active Business Promoter subscription
  const activePromoterSub = subscriptions.find(
    (sub) => sub.subscriptionType === 'business_promoter' && sub.status === 'active' && new Date(sub.expiresAt) > new Date()
  );

  const appliedCount = stats?.totalApplications || 0;
  const freeLimit = 3;

  return (
    <div className="dashboard-content-wrapper" style={{ padding: '2rem' }}>
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'My Subscription' }]} className="mb-3" />

      <h2 className="mb-4" style={{ fontWeight: 600 }}>My Subscription</h2>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {/* JOB SEEKER SUBSCRIPTION VIEW */}
      {activeRole === 1 && isJobSeeker && (
        <div className="row g-4 mb-5">
          <div className="col-lg-6">
            {activeSeekerSub ? (
              <div 
                className="card text-white p-4" 
                style={{ 
                  borderRadius: '16px', 
                  background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)', 
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
              >
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <span 
                      className="badge mb-2" 
                      style={{ 
                        backgroundColor: '#D4AF37', 
                        color: '#0A0A0A', 
                        fontWeight: 600,
                        boxShadow: '0 0 10px rgba(212, 175, 55, 0.4)' 
                      }}
                    >
                      ✨ {activeSeekerSub.planName ? activeSeekerSub.planName.toUpperCase() : 'PREMIUM'} MEMBER
                    </span>
                    <h3 className="mb-1" style={{ color: '#D4AF37', fontWeight: 700 }}>Job Seeker {activeSeekerSub.planName || 'Premium'}</h3>
                    <p className="text-secondary text-capitalize mb-0" style={{ fontSize: '0.9rem' }}>Tier: {activeSeekerSub.planTier || activeSeekerSub.tier} Plan</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="mb-1" style={{ fontSize: '0.8rem', color: '#B0B0B0' }}>Billing Price</p>
                    <h4 style={{ fontWeight: 700, margin: 0, color: '#FFFFFF', fontSize: '1.4rem' }}>
                      {getBillingPrice(activeSeekerSub)}
                    </h4>
                  </div>
                </div>

                <hr style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }} />

                <div className="mb-4 text-secondary">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="bi bi-check-circle-fill text-success"></i>
                    <span>Status: <strong className="text-white">Active</strong></span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="bi bi-calendar-event text-warning"></i>
                    <span>Purchased: {new Date(activeSeekerSub.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-clock-history text-danger"></i>
                    <span>Expires: <strong className="text-white">{new Date(activeSeekerSub.expiresAt).toLocaleDateString()}</strong></span>
                  </div>
                </div>

                <Link href="/subscription-light" className="btn btn-outline-warning w-100" style={{ borderRadius: '8px', border: '1px solid #D4AF37', color: '#D4AF37' }}>
                  Manage Subscription
                </Link>
              </div>
            ) : (
              <div className="card p-4" style={{ borderRadius: '16px', background: '#ffffff', border: '1px solid #dee2e6' }}>
                <div className="mb-3">
                  <span className="badge bg-secondary mb-2" style={{ fontWeight: 500 }}>CURRENT PLAN</span>
                  <h3 className="mb-1" style={{ fontWeight: 700 }}>Basic Seeker Plan</h3>
                  <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>Pricing: ₹0 (Free Tier)</p>
                </div>

                <hr />

                <div className="mb-4">
                  <h5 className="mb-2" style={{ fontSize: '0.95rem', fontWeight: 600 }}>Free Job Applications Remaining</h5>
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                    <span className="text-secondary">Used: {appliedCount} of {freeLimit} applications</span>
                    <span className="fw-bold">{appliedCount >= freeLimit ? 'Limit reached' : `${freeLimit - appliedCount} left`}</span>
                  </div>
                  <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                    <div 
                      className={`progress-bar ${appliedCount >= freeLimit ? 'bg-danger' : 'bg-primary'}`} 
                      role="progressbar" 
                      style={{ width: `${Math.min((appliedCount / freeLimit) * 100, 100)}%` }}
                      aria-valuenow={appliedCount} 
                      aria-valuemin={0} 
                      aria-valuemax={freeLimit}
                    ></div>
                  </div>
                  {appliedCount >= freeLimit && (
                    <div className="alert alert-warning mt-3 mb-0 py-2" style={{ fontSize: '0.85rem' }}>
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      You have run out of free job applications. Upgrade to apply to more jobs!
                    </div>
                  )}
                </div>

                <Link href="/subscription-light" className="btn btn-primary w-100" style={{ borderRadius: '8px', padding: '12px', fontWeight: 600 }}>
                  Upgrade to Premium
                </Link>
              </div>
            )}
          </div>

          <div className="col-lg-6">
            <div className="card p-4 h-100" style={{ borderRadius: '16px', background: '#ffffff', border: '1px solid #dee2e6' }}>
              <h4 className="mb-3" style={{ fontWeight: 600 }}>Seeker Premium Benefits</h4>
              <ul className="list-unstyled mb-0" style={{ display: 'grid', gap: '0.75rem' }}>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-circle-fill text-success" style={{ marginTop: '0.15rem' }}></i>
                  <div>
                    <strong>Unlimited Applications</strong>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Apply to as many jobs as you want without restrictions.</p>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-circle-fill text-success" style={{ marginTop: '0.15rem' }}></i>
                  <div>
                    <strong>Priority Visibility & Candidate Badge</strong>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Stand out with high placement and premium badge profiles.</p>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-circle-fill text-success" style={{ marginTop: '0.15rem' }}></i>
                  <div>
                    <strong>Resume Analytics Dashboard</strong>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Track profile views, employer downloads, and metrics.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYER SUBSCRIPTION VIEW */}
      {activeRole === 2 && isEmployer && (
        <div className="row g-4 mb-5">
          <div className="col-lg-6">
            {activeEmployerSub ? (
              <div 
                className="card text-white p-4" 
                style={{ 
                  borderRadius: '16px', 
                  background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)', 
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
              >
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <span 
                      className="badge mb-2" 
                      style={{ 
                        backgroundColor: '#D4AF37', 
                        color: '#0A0A0A', 
                        fontWeight: 600,
                        boxShadow: '0 0 10px rgba(212, 175, 55, 0.4)' 
                      }}
                    >
                      ✨ {activeEmployerSub.planName ? activeEmployerSub.planName.toUpperCase() : 'PROFESSIONAL'} EMPLOYER
                    </span>
                    <h3 className="mb-1" style={{ color: '#D4AF37', fontWeight: 700 }}>Employer {activeEmployerSub.planName || 'Premium'}</h3>
                    <p className="text-secondary text-capitalize mb-0" style={{ fontSize: '0.9rem' }}>Tier: {activeEmployerSub.planTier || activeEmployerSub.tier} Plan</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="mb-1" style={{ fontSize: '0.8rem', color: '#B0B0B0' }}>Billing Price</p>
                    <h4 style={{ fontWeight: 700, margin: 0, color: '#FFFFFF', fontSize: '1.4rem' }}>
                      {getBillingPrice(activeEmployerSub)}
                    </h4>
                  </div>
                </div>

                <hr style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }} />

                <div className="mb-4 text-secondary">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="bi bi-check-circle-fill text-success"></i>
                    <span>Status: <strong className="text-white">Active</strong></span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="bi bi-calendar-event text-warning"></i>
                    <span>Purchased: {new Date(activeEmployerSub.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-clock-history text-danger"></i>
                    <span>Expires: <strong className="text-white">{new Date(activeEmployerSub.expiresAt).toLocaleDateString()}</strong></span>
                  </div>
                </div>

                <Link href="/subscription-light" className="btn btn-outline-warning w-100" style={{ borderRadius: '8px', border: '1px solid #D4AF37', color: '#D4AF37' }}>
                  Manage Subscription
                </Link>
              </div>
            ) : (
              <div className="card p-4" style={{ borderRadius: '16px', background: '#ffffff', border: '1px solid #dee2e6' }}>
                <div className="mb-3">
                  <span className="badge bg-secondary mb-2" style={{ fontWeight: 500 }}>CURRENT PLAN</span>
                  <h3 className="mb-1" style={{ fontWeight: 700 }}>Free Employer Plan</h3>
                  <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>Pricing: ₹0 (Free Tier)</p>
                </div>

                <hr />

                <div className="mb-4">
                  <h5 className="mb-2" style={{ fontSize: '0.95rem', fontWeight: 600 }}>Free Job Postings Remaining</h5>
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                    <span className="text-secondary">Used: {postedJobsCount} of {freeLimit} jobs</span>
                    <span className="fw-bold">{postedJobsCount >= freeLimit ? 'Limit reached' : `${freeLimit - postedJobsCount} left`}</span>
                  </div>
                  <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                    <div 
                      className={`progress-bar ${postedJobsCount >= freeLimit ? 'bg-danger' : 'bg-primary'}`} 
                      role="progressbar" 
                      style={{ width: `${Math.min((postedJobsCount / freeLimit) * 100, 100)}%` }}
                      aria-valuenow={postedJobsCount} 
                      aria-valuemin={0} 
                      aria-valuemax={freeLimit}
                    ></div>
                  </div>
                  {postedJobsCount >= freeLimit && (
                    <div className="alert alert-warning mt-3 mb-0 py-2" style={{ fontSize: '0.85rem' }}>
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      You have run out of free job postings. Upgrade to post more jobs!
                    </div>
                  )}
                </div>

                <Link href="/subscription-light" className="btn btn-primary w-100" style={{ borderRadius: '8px', padding: '12px', fontWeight: 600 }}>
                  Upgrade to Premium
                </Link>
              </div>
            )}
          </div>

          <div className="col-lg-6">
            <div className="card p-4 h-100" style={{ borderRadius: '16px', background: '#ffffff', border: '1px solid #dee2e6' }}>
              <h4 className="mb-3" style={{ fontWeight: 600 }}>Employer Premium Benefits</h4>
              <ul className="list-unstyled mb-0" style={{ display: 'grid', gap: '0.75rem' }}>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-circle-fill text-success" style={{ marginTop: '0.15rem' }}></i>
                  <div>
                    <strong>Unlimited Job Posting</strong>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Post as many jobs as you need to scale your hiring.</p>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-circle-fill text-success" style={{ marginTop: '0.15rem' }}></i>
                  <div>
                    <strong>Featured Jobs & Verification Badge</strong>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Get higher search ranking for your job ads and build candidate trust.</p>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-circle-fill text-success" style={{ marginTop: '0.15rem' }}></i>
                  <div>
                    <strong>Candidate Shortlisting & Analytics</strong>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Access advanced analytics on applicant trends and dashboard shortcuts.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* BUSINESS PROMOTER SUBSCRIPTION VIEW */}
      {activeRole === 3 && isBusinessPromoter && (
        <div className="row g-4 mb-5">
          <div className="col-lg-6">
            {activePromoterSub ? (
              <div 
                className="card text-white p-4" 
                style={{ 
                  borderRadius: '16px', 
                  background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)', 
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
              >
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <span 
                      className="badge mb-2" 
                      style={{ 
                        backgroundColor: '#D4AF37', 
                        color: '#0A0A0A', 
                        fontWeight: 600,
                        boxShadow: '0 0 10px rgba(212, 175, 55, 0.4)' 
                      }}
                    >
                      ✨ {activePromoterSub.planName ? activePromoterSub.planName.toUpperCase() : 'PREMIUM'} BUSINESS
                    </span>
                    <h3 className="mb-1" style={{ color: '#D4AF37', fontWeight: 700 }}>Business {activePromoterSub.planName || 'Premium'}</h3>
                    <p className="text-secondary text-capitalize mb-0" style={{ fontSize: '0.9rem' }}>Tier: {activePromoterSub.planTier || activePromoterSub.tier} Plan</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="mb-1" style={{ fontSize: '0.8rem', color: '#B0B0B0' }}>Billing Price</p>
                    <h4 style={{ fontWeight: 700, margin: 0, color: '#FFFFFF', fontSize: '1.4rem' }}>
                      {getBillingPrice(activePromoterSub)}
                    </h4>
                  </div>
                </div>

                <hr style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }} />

                <div className="mb-4 text-secondary">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="bi bi-check-circle-fill text-success"></i>
                    <span>Status: <strong className="text-white">Active</strong></span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <i className="bi bi-calendar-event text-warning"></i>
                    <span>Purchased: {new Date(activePromoterSub.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-clock-history text-danger"></i>
                    <span>Expires: <strong className="text-white">{new Date(activePromoterSub.expiresAt).toLocaleDateString()}</strong></span>
                  </div>
                </div>

                <Link href="/subscription-light" className="btn btn-outline-warning w-100" style={{ borderRadius: '8px', border: '1px solid #D4AF37', color: '#D4AF37' }}>
                  Manage Subscription
                </Link>
              </div>
            ) : (
              <div className="card p-4" style={{ borderRadius: '16px', background: '#ffffff', border: '1px solid #dee2e6' }}>
                <div className="mb-3">
                  <span className="badge bg-danger-subtle text-danger mb-2" style={{ fontWeight: 500 }}>PLAN REQUIRED</span>
                  <h3 className="mb-1" style={{ fontWeight: 700 }}>No Active Promotion Plan</h3>
                  <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>Business promotions are always paid on JobNest.</p>
                </div>

                <hr />

                <div className="alert alert-warning py-3" style={{ fontSize: '0.88rem' }}>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  You need an active subscription plan to submit or keep business promotions visible.
                </div>

                <Link href="/subscription-light" className="btn btn-primary w-100" style={{ borderRadius: '8px', padding: '12px', fontWeight: 600 }}>
                  Buy Promotion Plan
                </Link>
              </div>
            )}
          </div>

          <div className="col-lg-6">
            <div className="card p-4 h-100" style={{ borderRadius: '16px', background: '#ffffff', border: '1px solid #dee2e6' }}>
              <h4 className="mb-3" style={{ fontWeight: 600 }}>Promoter Plan Features</h4>
              <ul className="list-unstyled mb-0" style={{ display: 'grid', gap: '0.75rem' }}>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-circle-fill text-success" style={{ marginTop: '0.15rem' }}></i>
                  <div>
                    <strong>Homepage Promotion</strong>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Display banners on high traffic pages.</p>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-circle-fill text-success" style={{ marginTop: '0.15rem' }}></i>
                  <div>
                    <strong>Featured Placements & Boost</strong>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Appear at the top of category searches.</p>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-circle-fill text-success" style={{ marginTop: '0.15rem' }}></i>
                  <div>
                    <strong>Lead Generation Support</strong>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Direct contact requests and inquiries from users.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* BILLING / ORDER HISTORY SECTION */}
      <div className="card border-0 shadow-sm p-4 mt-4" style={{ borderRadius: '20px', backgroundColor: '#ffffff' }}>
        <h3 className="fw-bold text-dark mb-4" style={{ fontSize: '1.25rem' }}>Billing &amp; Invoice History</h3>
        
        {invoicesList.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-receipt text-secondary fs-1 mb-2" />
            <p className="text-secondary mb-0">No invoices or billing records found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Date</th>
                  <th>Plan Purchased</th>
                  <th>Amount Paid</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoicesList.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="fw-bold" style={{ color: '#1e293b' }}>{invoice.invoiceNumber}</td>
                    <td className="text-secondary" style={{ fontSize: '0.9rem' }}>
                      {new Date(invoice.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '0.78rem' }}>
                        {invoice.gstNumber ? 'Business Promo' : 'Premium Subscription'}
                      </span>
                    </td>
                    <td className="fw-bold text-dark">₹{invoice.totalAmount}</td>
                    <td>
                      <span className={`badge px-2 py-1 ${
                        invoice.paymentStatus === 'paid' ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'
                      }`} style={{ textTransform: 'capitalize', fontSize: '0.75rem', borderRadius: '6px' }}>
                        {invoice.paymentStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link 
                        href={`/invoice/${invoice.id}`} 
                        target="_blank"
                        className="btn btn-sm btn-outline-primary fw-semibold px-3"
                        style={{ borderRadius: '8px' }}
                      >
                        <i className="bi bi-file-earmark-pdf me-1" /> View Invoice
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

