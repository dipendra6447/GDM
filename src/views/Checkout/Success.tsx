"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import "../../styles/confirmation.css";

interface PaymentInfo {
  tier: string;
  tierClass: string;
  categoryLabel: string;
  billing: string;
  total: number;
  subtotal: number;
  gst: number;
  transactionId: string;
  date: string;
  invoiceId?: string | null;
}

const Success: React.FC = () => {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const info = sessionStorage.getItem("last_payment_info");
    if (info) {
      try {
        setPaymentInfo(JSON.parse(info));
        setLoading(false);
        return;
      } catch (e) {
        console.error("Error parsing payment info from sessionStorage", e);
      }
    }

    // Dynamic backend fetch if sessionStorage is not present
    const fetchLatestPayment = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [invRes, subRes] = await Promise.all([
          fetch('/api/invoices/my', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/subscriptions/my', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const invJson = await invRes.json();
        const subJson = await subRes.json();

        if (invJson.success && Array.isArray(invJson.data) && invJson.data.length > 0) {
          // Get most recent invoice
          const latestInv = invJson.data[0];
          const activeSub = Array.isArray(subJson.data) 
            ? subJson.data.find((s: any) => s.id === latestInv.subscriptionId) || subJson.data[0] 
            : null;

          const subType = activeSub?.subscriptionType || 'job_seeker';
          const categoryLabel = 
            subType === 'job_poster' ? 'Employer Premium' :
            subType === 'business_promoter' ? 'Business Promoter Plan' :
            'Job Seeker Premium';

          const rawTier = (activeSub?.tier || 'monthly').toLowerCase();
          let tier = 'Gold';
          let tierClass = 'tier-gold';
          if (rawTier.includes('platinum') || rawTier.includes('monthly')) {
            tier = 'Platinum';
            tierClass = 'tier-platinum';
          } else if (rawTier.includes('silver') || rawTier.includes('daily')) {
            tier = 'Silver';
            tierClass = 'tier-silver';
          }

          setPaymentInfo({
            tier,
            tierClass,
            categoryLabel,
            billing: activeSub?.tier || 'monthly',
            subtotal: latestInv.amount,
            gst: latestInv.tax,
            total: latestInv.totalAmount,
            transactionId: latestInv.invoiceNumber || ("TXN" + Date.now().toString().slice(-8)),
            invoiceId: latestInv.id,
            date: new Date(latestInv.createdAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })
          });
        }
      } catch (err) {
        console.error("Error fetching dynamic invoice and subscription info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPayment();
  }, []);

  if (loading) {
    return (
      <div className="confirmation-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-warning my-5" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading confirmation details...</span>
        </div>
      </div>
    );
  }

  // Fallback info if nothing was returned
  const infoData: PaymentInfo = paymentInfo || {
    tier: "Gold",
    tierClass: "tier-gold",
    categoryLabel: "Job Seeker Premium",
    billing: "monthly",
    total: 353,
    subtotal: 299,
    gst: 54,
    transactionId: "TXN" + Date.now().toString().slice(-8),
    date: new Date().toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  };

  return (
    <div className="confirmation-page">
      {/* Decorative Orbs */}
      <div className="confirm-orb confirm-orb-1" />
      <div className="confirm-orb confirm-orb-2" />
      <div className="confirm-orb confirm-orb-3" />

      <Breadcrumb items={[
        { label: 'Subscription', href: '/subscription-light' },
        { label: 'Checkout', href: '/checkout' },
        { label: 'Payment Confirmed' },
      ]} />

      <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "32px" }}>
        <div className="confirm-card">
          {/* Steps Indicator */}
          <div className="confirm-steps">
            <div className="confirm-step">
              <span className="confirm-step-number" style={{ background: "#14B87A", borderColor: "#14B87A", boxShadow: "0 4px 16px rgba(20, 184, 122, 0.25)" }}>✓</span>
              <span style={{ color: "#14B87A" }}>Cart</span>
            </div>
            <div className="confirm-step-connector" style={{ background: "#14B87A" }} />
            <div className="confirm-step">
              <span className="confirm-step-number" style={{ background: "#14B87A", borderColor: "#14B87A", boxShadow: "0 4px 16px rgba(20, 184, 122, 0.25)" }}>✓</span>
              <span style={{ color: "#14B87A" }}>Payment</span>
            </div>
            <div className="confirm-step-connector" style={{ background: "#14B87A" }} />
            <div className="confirm-step">
              <span className="confirm-step-number" style={{ background: "#D4AF37", borderColor: "#D4AF37", boxShadow: "0 4px 16px rgba(212, 175, 55, 0.3)" }}>3</span>
              <span style={{ color: "#D4AF37", fontWeight: 700 }}>Confirmation</span>
            </div>
          </div>

          {/* Success Icon */}
          <div className="confirm-icon-wrap">
            <div className="confirm-icon-circle">
              <span className="confirm-icon-check">✓</span>
            </div>
          </div>

          <h1 className="confirm-heading">Payment Successful!</h1>
          <p className="confirm-subtext">
            Thank you for your purchase. Your {infoData.tier} Plan subscription is now active. Welcome to JobNest Premium!
          </p>

          {/* Details Card */}
          <div className="confirm-details-card">
            <div className="confirm-detail-row">
              <span className="label">
                <i className="bi bi-person-fill"></i> Account Type
              </span>
              <span className="value">{infoData.categoryLabel}</span>
            </div>
            <div className="confirm-detail-divider" />
            <div className="confirm-detail-row">
              <span className="label">
                <i className="bi bi-gem"></i> Premium Tier
              </span>
              <span className="value">{infoData.tier} Plan</span>
            </div>
            <div className="confirm-detail-divider" />
            <div className="confirm-detail-row">
              <span className="label">
                <i className="bi bi-calendar-event"></i> Billing Cycle
              </span>
              <span className="value" style={{ textTransform: "capitalize" }}>{infoData.billing}</span>
            </div>
            <div className="confirm-detail-divider" />
            <div className="confirm-detail-row">
              <span className="label">
                <i className="bi bi-clock"></i> Date & Time
              </span>
              <span className="value">{infoData.date}</span>
            </div>
            <div className="confirm-detail-divider" />
            <div className="confirm-detail-row">
              <span className="label">
                <i className="bi bi-cash"></i> Subtotal
              </span>
              <span className="value">${infoData.subtotal}</span>
            </div>
            <div className="confirm-detail-row">
              <span className="label">
                <i className="bi bi-percent"></i> Sales Tax (18%)
              </span>
              <span className="value">${infoData.gst}</span>
            </div>
            <div className="confirm-detail-divider" />
            <div className="confirm-detail-row total">
              <span className="label">Total Paid</span>
              <span className="value">${infoData.total}</span>
            </div>
          </div>

          {/* Transaction ID Badge */}
          <div className="confirm-txn-badge">
            <i className="bi bi-shield-check"></i>
            <span>Transaction ID: {infoData.transactionId}</span>
          </div>

          {/* Action Buttons */}
          <div className="d-flex flex-column gap-2 w-100 mt-4">
            {infoData.invoiceId && (
              <Link href={`/invoice/${infoData.invoiceId}`} className="confirm-btn-primary" style={{ textDecoration: 'none' }}>
                <i className="bi bi-file-earmark-pdf-fill"></i> View & Download Invoice
              </Link>
            )}
            <Link href="/dashboard" className="confirm-btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
              <i className="bi bi-grid-fill me-2"></i> Go to Dashboard
            </Link>
            <Link href="/jobs" className="confirm-btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
              <i className="bi bi-search me-2" /> Explore Jobs
            </Link>
          </div>

          {/* Footer Note */}
          <p className="confirm-footer-note">
            <i className="bi bi-envelope-fill"></i> A payment receipt has been generated and saved to your account. For support, contact info@jobnest.com.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Success;
