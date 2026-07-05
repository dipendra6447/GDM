"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type BillingPeriod = "daily" | "weekly" | "monthly";

const plans = [
  {
    id: "biz-silver",
    tier: "Silver",
    badge: null,
    tierClass: "tier-silver",
    priceDaily: "₹99",
    priceWeekly: "₹499",
    priceMonthly: "₹1299",
    desc: "Entry-level business visibility",
    features: [
      { text: "Business Listing Promotion", included: true },
      { text: "Search Priority Ranking", included: true },
      { text: "Basic Analytics", included: true },
      { text: "Homepage Featured Placement", included: false },
      { text: "Dedicated Promotion Banner", included: false },
      { text: "Lead Generation Support", included: false },
      { text: "Click Tracking & Reports", included: false },
    ],
    cta: "Get Silver",
    featured: false,
  },
  {
    id: "biz-gold",
    tier: "Gold",
    badge: "✨ Best Choice",
    tierClass: "tier-gold",
    priceDaily: "₹199",
    priceWeekly: "₹899",
    priceMonthly: "₹2499",
    desc: "Maximum brand exposure",
    features: [
      { text: "Everything in Silver", included: true },
      { text: "Homepage Featured Placement", included: true },
      { text: "Dedicated Promotion Banner", included: true },
      { text: "Analytics Dashboard", included: true },
      { text: "Click Tracking & Reports", included: true },
      { text: "Lead Generation Support", included: false },
      { text: "Custom Ad Creative", included: false },
    ],
    cta: "Get Gold",
    featured: true,
  },
  {
    id: "biz-platinum",
    tier: "Platinum",
    badge: "🚀 Maximum Reach",
    tierClass: "tier-platinum",
    priceDaily: "₹349",
    priceWeekly: "₹1499",
    priceMonthly: "₹3999",
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
    cta: "Get Platinum",
    featured: false,
  },
];

const compareRows = [
  { feature: "Business Listing", silver: "✓", gold: "✓ Featured", platinum: "✓ Top Featured" },
  { feature: "Search Ranking Boost", silver: "✓ Basic", gold: "✓ Priority", platinum: "✓ Maximum" },
  { feature: "Homepage Placement", silver: "✗", gold: "✓", platinum: "✓ Premium" },
  { feature: "Promotion Banner", silver: "✗", gold: "✓", platinum: "✓ Custom" },
  { feature: "Analytics Dashboard", silver: "Basic", gold: "✓ Full", platinum: "✓ Advanced" },
  { feature: "Click Tracking", silver: "✗", gold: "✓", platinum: "✓ Detailed" },
  { feature: "Lead Generation", silver: "✗", gold: "✗", platinum: "✓" },
  { feature: "Promotion Manager", silver: "✗", gold: "✗", platinum: "✓ Dedicated" },
];

interface BusinessPromotionPlansProps {
  onRoleSwitch: (role: "jobseeker" | "employer") => void;
  isLight?: boolean;
}

const BusinessPromotionPlans: React.FC<BusinessPromotionPlansProps> = ({ onRoleSwitch, isLight = false }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [showCompare, setShowCompare] = useState(false);

  const getPrice = (p: typeof plans[0]) => {
    if (billing === "daily") return p.priceDaily;
    if (billing === "weekly") return p.priceWeekly;
    return p.priceMonthly;
  };

  const getPeriod = () => {
    if (billing === "daily") return "/day";
    if (billing === "weekly") return "/week";
    return "/month";
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".biz-promo-card", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true },
        opacity: 0,
        scale: 0.93,
        y: 40,
        duration: 0.8,
        stagger: 0.18,
        ease: "back.out(1.2)",
        clearProps: "all",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    document.body.style.overflow = showCompare ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showCompare]);

  const renderCell = (val: string) => {
    if (val === "✓") return <span className="cmp-check">✓</span>;
    if (val === "✗") return <span className="cmp-cross">✗</span>;
    if (val.startsWith("✓")) return <span className="cmp-check-text">{val}</span>;
    return <span className="cmp-plain">{val}</span>;
  };

  return (
    <>
      <section className="pricing-section" ref={sectionRef} id="business-plans">
        <div className="container">
          <div className="pricing-section-title">
            <div className="sub-badge">Promote Your Business</div>
            <h2 className="sub-heading">
              <span className="gold-text">Reach Thousands of Professionals</span>
            </h2>
            <p className="sub-subheading">
              Increase visibility and generate leads with premium business promotion planss.
            </p>
          </div>

          {/* Per-section billing toggle */}
          <div className="section-billing-toggle">
            {(["daily", "weekly", "monthly"] as BillingPeriod[]).map((p) => (
              <button
                key={p}
                className={`sbt-btn${billing === p ? " active" : ""}`}
                onClick={() => setBilling(p)}
                id={`biz-billing-${p}`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="pricing-cards-row three-col">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`pricing-card biz-promo-card${plan.featured ? " featured" : ""} ${plan.tierClass}`}
                id={plan.id}
              >
                {plan.badge && <div className="card-badge">{plan.badge}</div>}
                <div className="card-tier-ribbon">{plan.tier}</div>
                <div className="card-plan-type">Business Promotion</div>
                <div className="card-plan-name">{plan.tier} Plan</div>
                <div className="card-price">
                  <span className="price-amount">{getPrice(plan)}</span>
                  <span className="price-period">{getPeriod()}</span>
                  <p className="price-desc">{plan.desc}</p>
                </div>
                <div className="card-divider" />
                <ul className="feature-list">
                  {plan.features.map((f) => (
                    <li key={f.text} className={`feature-item${f.included ? " included" : ""}`}>
                      <span className={`feature-check ${f.included ? "yes" : "no"}`}>
                        {f.included ? "✓" : "✗"}
                      </span>
                      {f.text}
                    </li>
                  ))}
                </ul>
                <Link href={`/cart?plan=${plan.id}&billing=${billing}`} className={`card-cta-btn${plan.featured ? " primary" : ""}`} id={`${plan.id}-cta`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="admin-note" style={{ marginTop: 12 }}>
            <span>🔐</span> Promotion duration configured &amp; managed by Admin • Auto-expires when period ends
          </p>

          <div className="plan-action-row">
            <button
              className="btn-compare-plans"
              id="biz-compare-btn"
              onClick={() => setShowCompare(true)}
            >
              <span className="compare-icon">⚖</span> Compare Business Plans
            </button>
            <div className="role-switch-inline">
              <span className="role-switch-label">Switch role:</span>
              <button className="role-pill" onClick={() => onRoleSwitch("jobseeker")} id="biz-switch-js">
                🔍 Job Seeker
              </button>
              <button className="role-pill" onClick={() => onRoleSwitch("employer")} id="biz-switch-emp">
                🏢 Employer
              </button>
            </div>
          </div>
        </div>
      </section>

      {showCompare && (
        <div className={`compare-modal-overlay${isLight ? " compare-modal--light" : ""}`} onClick={() => setShowCompare(false)} id="biz-compare-modal">
          <div className={`compare-modal-box${isLight ? " compare-modal--light" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className="compare-modal-header">
              <div>
                <div className="sub-badge" style={{ marginBottom: 8 }}>Business Promotion Plans</div>
                <h3 className="compare-modal-title">Plan <span className="gold-text">Comparison</span></h3>
              </div>
              <button className="compare-modal-close" onClick={() => setShowCompare(false)} id="biz-compare-close" aria-label="Close">✕</button>
            </div>
            <div className="compare-table-scroll">
              <table className="compare-modal-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th className="silver-header">🥈 Silver</th>
                    <th className="gold-header">🥇 Gold</th>
                    <th className="platinum-header">💎 Platinum</th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((row) => (
                    <tr key={row.feature}>
                      <td>{row.feature}</td>
                      <td>{renderCell(row.silver)}</td>
                      <td>{renderCell(row.gold)}</td>
                      <td>{renderCell(row.platinum)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="compare-modal-footer">
              <a href="#business-plans" className="card-cta-btn primary" onClick={() => setShowCompare(false)} id="biz-compare-choose">
                Choose Your Plan
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BusinessPromotionPlans;
