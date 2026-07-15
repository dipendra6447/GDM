"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function SeekerSubscriptionPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view subscription details');
      setLoading(false);
      return;
    }
    try {
      const [subsRes, dashboardRes] = await Promise.all([
        fetch('/api/subscriptions/my', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/dashboard/job-seeker', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const subsJson = await subsRes.json();
      const dashboardJson = await dashboardRes.json();

      if (subsJson.success) {
        setSubscriptions(subsJson.data || []);
      }
      if (dashboardJson.success) {
        setStats(dashboardJson.data?.stats || null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch subscription data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div className="dashboard-content-wrapper" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ padding: '3rem' }}>Loading subscription details...</div>
      </div>
    );
  }

  const isJobSeeker = user?.roles?.includes(1);

  if (!user) {
    return (
      <div className="dashboard-content-wrapper" style={{ padding: '2rem' }}>
        <h2 className="mb-4">My Subscription</h2>
        <div className="alert alert-danger">Please log in to view subscription.</div>
      </div>
    );
  }

  if (!isJobSeeker) {
    return (
      <div className="dashboard-content-wrapper" style={{ padding: '2rem' }}>
        <h2 className="mb-4">My Subscription</h2>
        <div className="alert alert-danger">
          Access Denied. Only Job Seekers can view seeker subscriptions here.
        </div>
      </div>
    );
  }

  // Find active job_seeker subscription
  const activeSub = subscriptions.find(
    (sub) => sub.subscriptionType === 'job_seeker' && sub.status === 'active' && new Date(sub.expiresAt) > new Date()
  );

  const appliedCount = stats?.totalApplications || 0;
  const freeLimit = 3;

  return (
    <div className="dashboard-content-wrapper" style={{ padding: '2rem' }}>
      {/* Breadcrumb */}
      <div className="dashboard-breadcrumb-wrapper" style={{ padding: '0 0 16px' }}>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0" style={{ fontSize: '0.875rem' }}>
            <li className="breadcrumb-item">
              <Link href="/" className="text-decoration-none" style={{ color: '#2454FF' }}>
                <i className="bi bi-house-fill me-1" />Home
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/dashboard" className="text-decoration-none" style={{ color: '#2454FF' }}>
                Dashboard
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page" style={{ color: '#64748b' }}>
              My Subscription
            </li>
          </ol>
        </nav>
      </div>

      <h2 className="mb-4" style={{ fontWeight: 600 }}>My Subscription</h2>

      {error ? (
        <div className="alert alert-danger">{error}</div>
      ) : activeSub ? (
        /* PREMIUM PLAN VIEW */
        <div className="row g-4">
          <div className="col-lg-6">
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
                    ✨ PREMIUM MEMBER
                  </span>
                  <h3 className="mb-1" style={{ color: '#D4AF37', fontWeight: 700 }}>Job Seeker Premium</h3>
                  <p className="text-secondary text-capitalize mb-0" style={{ fontSize: '0.9rem' }}>Tier: {activeSub.tier} Plan</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="mb-0 text-secondary" style={{ fontSize: '0.8rem' }}>Billing Price</p>
                  <h4 style={{ fontWeight: 700, margin: 0 }}>
                    {activeSub.tier === 'daily' ? '₹29/day' : activeSub.tier === 'weekly' ? '₹99/week' : '₹299/month'}
                  </h4>
                </div>
              </div>

              <hr style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }} />

              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-check-circle-fill text-success"></i>
                  <span>Status: <strong>Active</strong></span>
                </div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-calendar-event text-warning"></i>
                  <span>Purchased: {new Date(activeSub.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-clock-history text-danger"></i>
                  <span>Expires: <strong>{new Date(activeSub.expiresAt).toLocaleDateString()}</strong></span>
                </div>
              </div>

              <Link href="/subscription" className="btn btn-outline-warning w-100" style={{ borderRadius: '8px', border: '1px solid #D4AF37', color: '#D4AF37' }}>
                Manage Subscription
              </Link>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card p-4" style={{ borderRadius: '16px', background: '#ffffff', border: '1px solid #dee2e6' }}>
              <h4 className="mb-3" style={{ fontWeight: 600 }}>Plan Benefits Included</h4>
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
                    <strong>Priority Visibility</strong>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Your applications appear at the top of the employers' list.</p>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-circle-fill text-success" style={{ marginTop: '0.15rem' }}></i>
                  <div>
                    <strong>Featured Candidate Badge</strong>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Get a premium badge on your profile to stand out.</p>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-circle-fill text-success" style={{ marginTop: '0.15rem' }}></i>
                  <div>
                    <strong>Resume Enhancement & Analytics</strong>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Access details about profile views and application stats.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* FREE PLAN VIEW */
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card p-4" style={{ borderRadius: '16px', background: '#ffffff', border: '1px solid #dee2e6' }}>
              <div className="mb-3">
                <span className="badge bg-secondary mb-2" style={{ fontWeight: 500 }}>CURRENT PLAN</span>
                <h3 className="mb-1" style={{ fontWeight: 700 }}>Basic Seeker Plan</h3>
                <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>Pricing: ₹0 (Free Tier)</p>
              </div>

              <hr />

              {/* Progress and Application count */}
              <div className="mb-4">
                <h5 className="mb-2" style={{ fontSize: '0.95rem', fontWeight: 600 }}>Free Job Applications Remaining</h5>
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem' }}>
                  <span className="text-secondary">Used: {appliedCount} of {freeLimit} applications</span>
                  <span className="font-weight-bold">{appliedCount >= freeLimit ? 'Limit reached' : `${freeLimit - appliedCount} left`}</span>
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

              <Link href="/subscription" className="btn btn-primary w-100" style={{ borderRadius: '8px', padding: '12px', fontWeight: 600 }}>
                Upgrade to Premium
              </Link>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card p-4" style={{ borderRadius: '16px', background: '#ffffff', border: '1px solid #dee2e6' }}>
              <h4 className="mb-3" style={{ fontWeight: 600 }}>Basic Features</h4>
              <ul className="list-unstyled mb-0" style={{ display: 'grid', gap: '0.75rem' }}>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-circle-fill text-success" style={{ marginTop: '0.15rem' }}></i>
                  <div>
                    <strong>Search Unlimited Jobs</strong>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Search and look through listings at any time.</p>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-circle-fill text-success" style={{ marginTop: '0.15rem' }}></i>
                  <div>
                    <strong>First 3 Applications Free</strong>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Apply to up to 3 jobs free of charge without any subscriptions.</p>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-circle-fill text-success" style={{ marginTop: '0.15rem' }}></i>
                  <div>
                    <strong>Basic Profile & Apply Tracking</strong>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.85rem' }}>Manage a simple resume profile and see basic applied status.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
