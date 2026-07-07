"use client";
import React, { useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { useCart, BillingPeriod, PlanCategory, CartItem } from "../../hooks/CartContext";
import "../../styles/cart.css";

/* ── Plan registry: maps plan IDs to full details ── */
const PLANS_REGISTRY: Record<string, Omit<CartItem, "billing">> = {
  /* Job Seeker Plans */
  "js-silver": {
    id: "js-silver", tier: "Silver", tierClass: "tier-silver", category: "jobseeker",
    categoryLabel: "Job Seeker", badge: null, featured: false,
    priceDaily: "₹29", priceWeekly: "₹149", priceMonthly: "₹399",
    desc: "Perfect for active job seekers",
    features: [
      { text: "Search Unlimited Jobs", included: true },
      { text: "First 3 Applications Free", included: true },
      { text: "Basic Profile", included: true },
      { text: "Apply Tracking", included: true },
    ],
  },
  "js-gold": {
    id: "js-gold", tier: "Gold", tierClass: "tier-gold", category: "jobseeker",
    categoryLabel: "Job Seeker", badge: "⭐ Most Popular", featured: true,
    priceDaily: "₹59", priceWeekly: "₹299", priceMonthly: "₹799",
    desc: "Unlimited applications & more",
    features: [
      { text: "Everything in Silver", included: true },
      { text: "Unlimited Applications", included: true },
      { text: "Priority Profile Visibility", included: true },
      { text: "Featured Candidate Badge", included: true },
      { text: "Application Analytics", included: true },
    ],
  },
  "js-platinum": {
    id: "js-platinum", tier: "Platinum", tierClass: "tier-platinum", category: "jobseeker",
    categoryLabel: "Job Seeker", badge: "👑 Best Value", featured: false,
    priceDaily: "₹99", priceWeekly: "₹499", priceMonthly: "₹1299",
    desc: "Maximum career acceleration",
    features: [
      { text: "Everything in Gold", included: true },
      { text: "Resume Enhancement", included: true },
      { text: "Premium Support 24/7", included: true },
      { text: "Early Access Jobs", included: true },
      { text: "Career Coaching Session", included: true },
      { text: "LinkedIn Profile Boost", included: true },
      { text: "Dedicated Account Manager", included: true },
    ],
  },
  /* Employer Plans */
  "emp-silver": {
    id: "emp-silver", tier: "Silver", tierClass: "tier-silver", category: "employer",
    categoryLabel: "Employer", badge: null, featured: false,
    priceDaily: "₹49", priceWeekly: "₹249", priceMonthly: "₹699",
    desc: "For growing startups",
    features: [
      { text: "Post Up To 3 Jobs Free", included: true },
      { text: "Company Profile", included: true },
      { text: "Basic Applicant Management", included: true },
    ],
  },
  "emp-gold": {
    id: "emp-gold", tier: "Gold", tierClass: "tier-gold", category: "employer",
    categoryLabel: "Employer", badge: "🏆 Recommended", featured: true,
    priceDaily: "₹99", priceWeekly: "₹499", priceMonthly: "₹1299",
    desc: "For scaling teams",
    features: [
      { text: "Everything in Silver", included: true },
      { text: "Unlimited Job Posting", included: true },
      { text: "Featured Job Listings", included: true },
      { text: "Recruitment Dashboard", included: true },
      { text: "Candidate Shortlisting", included: true },
    ],
  },
  "emp-platinum": {
    id: "emp-platinum", tier: "Platinum", tierClass: "tier-platinum", category: "employer",
    categoryLabel: "Employer", badge: "👑 Enterprise", featured: false,
    priceDaily: "₹199", priceWeekly: "₹899", priceMonthly: "₹2499",
    desc: "For enterprise hiring",
    features: [
      { text: "Everything in Gold", included: true },
      { text: "Company Verification Badge", included: true },
      { text: "Priority Support 24/7", included: true },
      { text: "AI Candidate Matching", included: true },
      { text: "Bulk Job Import", included: true },
      { text: "Custom Branding", included: true },
      { text: "Dedicated Account Manager", included: true },
    ],
  },
  /* Business Promotion Plans */
  "biz-silver": {
    id: "biz-silver", tier: "Silver", tierClass: "tier-silver", category: "business",
    categoryLabel: "Business Promotion", badge: null, featured: false,
    priceDaily: "₹99", priceWeekly: "₹499", priceMonthly: "₹1299",
    desc: "Entry-level business visibility",
    features: [
      { text: "Business Listing Promotion", included: true },
      { text: "Search Priority Ranking", included: true },
      { text: "Basic Analytics", included: true },
    ],
  },
  "biz-gold": {
    id: "biz-gold", tier: "Gold", tierClass: "tier-gold", category: "business",
    categoryLabel: "Business Promotion", badge: "✨ Best Choice", featured: true,
    priceDaily: "₹199", priceWeekly: "₹899", priceMonthly: "₹2499",
    desc: "Maximum brand exposure",
    features: [
      { text: "Everything in Silver", included: true },
      { text: "Homepage Featured Placement", included: true },
      { text: "Dedicated Promotion Banner", included: true },
      { text: "Analytics Dashboard", included: true },
      { text: "Click Tracking & Reports", included: true },
    ],
  },
  "biz-platinum": {
    id: "biz-platinum", tier: "Platinum", tierClass: "tier-platinum", category: "business",
    categoryLabel: "Business Promotion", badge: "🚀 Maximum Reach", featured: false,
    priceDaily: "₹349", priceWeekly: "₹1499", priceMonthly: "₹3999",
    desc: "Enterprise-grade promotion",
    features: [
      { text: "Everything in Gold", included: true },
      { text: "Lead Generation Support", included: true },
      { text: "Custom Ad Creative", included: true },
      { text: "Multi-Platform Promotion", included: true },
      { text: "Dedicated Promotion Manager", included: true },
      { text: "A/B Testing", included: true },
      { text: "ROI Reports", included: true },
    ],
  },
};

const getCategoryIcon = (cat: PlanCategory) => {
  switch (cat) {
    case "jobseeker": return "🔍";
    case "employer": return "🏢";
    case "business": return "📣";
  }
};

const Cart: React.FC = () => {
  const searchParams = useSearchParams();
  const { item, addToCart, removeFromCart, updateBilling, getPrice, getPriceNum, getBillingLabel } = useCart();
  const pageRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  /* ── Populate cart from URL params on first load ── */
  useEffect(() => {
    if (hasInitialized.current || !searchParams) return;
    const planId = searchParams.get("plan");
    const billing = (searchParams.get("billing") || "monthly") as BillingPeriod;

    if (planId && PLANS_REGISTRY[planId]) {
      addToCart({ ...PLANS_REGISTRY[planId], billing });
      hasInitialized.current = true;
    }
  }, [searchParams, addToCart]);

  /* ── GSAP animations ── */
  // useEffect(() => {
  //   if (!pageRef.current) return;
  //   const ctx = gsap.context(() => {
  //     gsap.from(".cart-header", { opacity: 0, y: 30, duration: 0.6, ease: "power3.out" });
  //     gsap.from(".cart-item-card", { opacity: 0, y: 40, duration: 0.7, delay: 0.15, ease: "power3.out" });
  //     gsap.from(".cart-summary", { opacity: 0, y: 40, duration: 0.7, delay: 0.3, ease: "power3.out" });
  //   }, pageRef);
  //   return () => ctx.revert();
  // }, [item]);

  /* ── Price calculations ── */
  const subtotal = getPriceNum();
  const gst = useMemo(() => Math.round(subtotal * 0.18), [subtotal]);
  const total = subtotal + gst;

  /* ── If cart is empty ── */
  if (!item) {
    return (
      <div className="cart-page" ref={pageRef}>
        <div className="cart-glow-orb cart-glow-orb-1" />
        <div className="cart-glow-orb cart-glow-orb-2" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="cart-empty">
            <span className="cart-empty-icon">🛒</span>
            <h2>Your Cart is Empty</h2>
            <p>Explore our premium subscription plans and unlock unlimited opportunities with JobNest.</p>
            <Link href="/subscription" className="cart-empty-cta" id="cart-empty-browse">
              Browse Plans <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page" ref={pageRef}>
      {/* Decorative Glow */}
      <div className="cart-glow-orb cart-glow-orb-1" />
      <div className="cart-glow-orb cart-glow-orb-2" />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Breadcrumb */}
        <div className="cart-breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-separator">›</span>
          <Link href="/subscription">Pricing</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Cart</span>
        </div>

        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-left">
            <h1>Your Cart</h1>
            <span className="cart-item-count">1</span>
          </div>
          <Link href="/subscription" className="cart-continue-shopping" id="cart-continue-shopping">
            ← Continue Shopping
          </Link>
        </div>

        {/* Main Layout */}
        <div className="cart-layout">
          {/* Cart Item */}
          <div className="cart-item-card" id="cart-item">
            <div className="cart-item-top">
              <div className="cart-item-info">
                <div className="cart-item-category">
                  {getCategoryIcon(item.category)} {item.categoryLabel}
                </div>
                <div className="cart-item-name">{item.tier} Plan</div>
                <div className="cart-item-desc">{item.desc}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className={`cart-tier-badge ${item.tierClass}`}>
                  {item.tier === "Silver" && "🥈"}
                  {item.tier === "Gold" && "🥇"}
                  {item.tier === "Platinum" && "💎"}
                  {item.tier}
                </span>
                <button
                  className="cart-item-remove"
                  onClick={removeFromCart}
                  id="cart-remove-item"
                >
                  <i className="bi bi-trash3" /> Remove
                </button>
              </div>
            </div>

            {/* Billing Toggle */}
            <div className="cart-billing-section">
              <div className="cart-billing-label">Billing Period</div>
              <div className="cart-billing-toggle">
                {(["daily", "weekly", "monthly"] as BillingPeriod[]).map((period) => (
                  <button
                    key={period}
                    className={`cart-billing-btn${item.billing === period ? " active" : ""}`}
                    onClick={() => updateBilling(period)}
                    id={`cart-billing-${period}`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="cart-price-display">
              <span className="cart-price-amount">{getPrice()}</span>
              <span className="cart-price-period">{getBillingLabel()}</span>
            </div>

            {/* Features */}
            <div className="cart-features-section">
              <div className="cart-features-title">Plan Features</div>
              <div className="cart-features-grid">
                {item.features.map((f) => (
                  <div key={f.text} className={`cart-feature-item${f.included ? " included" : ""}`}>
                    <span className={`cart-feature-check ${f.included ? "yes" : "no"}`}>
                      {f.included ? "✓" : "✗"}
                    </span>
                    {f.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="cart-summary" id="cart-summary">
            <div className="cart-summary-title">
              <span className="summary-icon">📋</span> Order Summary
            </div>

            <div className="cart-summary-row">
              <span className="label">{item.tier} Plan ({item.categoryLabel})</span>
              <span className="value">{getPrice()}</span>
            </div>

            <div className="cart-summary-row">
              <span className="label">Billing</span>
              <span className="value" style={{ textTransform: "capitalize" }}>{item.billing}</span>
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-summary-row">
              <span className="label">Subtotal</span>
              <span className="value">₹{subtotal}</span>
            </div>

            <div className="cart-summary-row">
              <span className="label">GST (18%)</span>
              <span className="value">₹{gst}</span>
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-summary-total">
              <span className="label">Total</span>
              <span className="value">₹{total}</span>
            </div>

            {/* Promo Code */}
            <div className="cart-promo">
              <div className="cart-promo-input-wrapper">
                <input
                  type="text"
                  className="cart-promo-input"
                  placeholder="Promo code"
                  id="cart-promo-input"
                />
                <button className="cart-promo-btn" id="cart-promo-apply">Apply</button>
              </div>
            </div>

            {/* Checkout Button */}
            <Link href="/checkout" className="cart-checkout-btn" id="cart-checkout-btn">
              Proceed to Checkout <span>→</span>
            </Link>

            {/* Security */}
            <div className="cart-security">
              <i className="bi bi-shield-lock-fill" />
              <span>256-bit SSL Encrypted • Secure Payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
