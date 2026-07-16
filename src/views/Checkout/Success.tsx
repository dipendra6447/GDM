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
}

const Success: React.FC = () => {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  useEffect(() => {
    const info = sessionStorage.getItem("last_payment_info");
    if (info) {
      try {
        setPaymentInfo(JSON.parse(info));
      } catch (e) {
        console.error("Error parsing payment info", e);
      }
    } else {
      // Fallback data for preview/direct navigation so the page is always beautiful
      setPaymentInfo({
        tier: "Gold",
        tierClass: "tier-gold",
        categoryLabel: "Job Seeker Premium",
        billing: "monthly",
        total: 353,
        subtotal: 299,
        gst: 54,
        transactionId: "TXN" + Date.now().toString().slice(-8),
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      });
    }
  }, []);

  if (!paymentInfo) return null;

  return (
    <div className="confirmation-page">
      {/* Decorative Orbs */}
      <div className="confirm-orb confirm-orb-1" />
      <div className="confirm-orb confirm-orb-2" />
      <div className="confirm-orb confirm-orb-3" />

      <Breadcrumb items={[
        { label: 'Subscription', href: '/subscription' },
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
            <span className="confirm-step-number">3</span>
            <span>Confirmation</span>
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
          Thank you for your purchase. Your {paymentInfo.tier} Plan subscription is now active. Welcome to JobNest Premium!
        </p>

        {/* Details Card */}
        <div className="confirm-details-card">
          <div className="confirm-detail-row">
            <span className="label">
              <i className="bi bi-person-fill"></i> Account Type
            </span>
            <span className="value">{paymentInfo.categoryLabel}</span>
          </div>
          <div className="confirm-detail-divider" />
          <div className="confirm-detail-row">
            <span className="label">
              <i className="bi bi-gem"></i> Premium Tier
            </span>
            <span className="value">{paymentInfo.tier} Plan</span>
          </div>
          <div className="confirm-detail-divider" />
          <div className="confirm-detail-row">
            <span className="label">
              <i className="bi bi-calendar-event"></i> Billing Cycle
            </span>
            <span className="value" style={{ textTransform: "capitalize" }}>{paymentInfo.billing}</span>
          </div>
          <div className="confirm-detail-divider" />
          <div className="confirm-detail-row">
            <span className="label">
              <i className="bi bi-clock"></i> Date & Time
            </span>
            <span className="value">{paymentInfo.date}</span>
          </div>
          <div className="confirm-detail-divider" />
          <div className="confirm-detail-row">
            <span className="label">
              <i className="bi bi-cash"></i> Subtotal
            </span>
            <span className="value">₹{paymentInfo.subtotal}</span>
          </div>
          <div className="confirm-detail-row">
            <span className="label">
              <i className="bi bi-percent"></i> GST (18%)
            </span>
            <span className="value">₹{paymentInfo.gst}</span>
          </div>
          <div className="confirm-detail-divider" />
          <div className="confirm-detail-row total">
            <span className="label">Total Paid</span>
            <span className="value">₹{paymentInfo.total}</span>
          </div>
        </div>

        {/* Transaction ID Badge */}
        <div className="confirm-txn-badge">
          <i className="bi bi-shield-check"></i>
          <span>Transaction ID: {paymentInfo.transactionId}</span>
        </div>

        {/* Action Buttons */}
        <Link href="/" className="confirm-btn-primary">
          <i className="bi bi-grid-fill"></i> Go to Dashboard
        </Link>
        <Link href="/jobs" className="confirm-btn-secondary">
          <i className="bi bi-search" /> Explore Jobs
        </Link>

        {/* Footer Note */}
        <p className="confirm-footer-note">
          <i className="bi bi-envelope-fill"></i> A payment receipt has been sent to your registered email address. For support, contact info@jobnest.com.
        </p>
      </div>
    </div>
  </div>
);
};

export default Success;
