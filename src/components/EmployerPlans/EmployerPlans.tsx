"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type BillingPeriod = "daily" | "weekly" | "monthly";

const plans = [
  {
    id: "emp-silver",
    tier: "Silver",
    badge: null,
    tierClass: "tier-silver",
    priceDaily: "₹49",
    priceWeekly: "₹249",
    priceMonthly: "₹699",
    desc: "For growing startups",
    features: [
      { text: "Post Up To 3 Jobs Free", included: true },
      { text: "Company Profile", included: true },
      { text: "Basic Applicant Management", included: true },
      { text: "Featured Job Listings", included: false },
      { text: "Unlimited Job Posts", included: false },
      { text: "Recruitment Dashboard", included: false },
      { text: "Candidate Shortlisting", included: false },
    ],
    cta: "Get Silver",
    featured: false,
  },
  {
    id: "emp-gold",
    tier: "Gold",
    badge: "🏆 Recommended",
    tierClass: "tier-gold",
    priceDaily: "₹99",
    priceWeekly: "₹499",
    priceMonthly: "₹1299",
    desc: "For scaling teams",
    features: [
      { text: "Everything in Silver", included: true },
      { text: "Unlimited Job Posting", included: true },
      { text: "Featured Job Listings", included: true },
      { text: "Recruitment Dashboard", included: true },
      { text: "Candidate Shortlisting", included: true },
      { text: "Company Verification Badge", included: false },
      { text: "Priority Support", included: false },
    ],
    cta: "Get Gold",
    featured: true,
  },
  {
    id: "emp-platinum",
    tier: "Platinum",
    badge: "👑 Enterprise",
    tierClass: "tier-platinum",
    priceDaily: "₹199",
    priceWeekly: "₹899",
    priceMonthly: "₹2499",
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
    cta: "Get Platinum",
    featured: false,
  },
];

const compareRows = [
  { feature: "Job Postings", silver: "Up to 3", gold: "✓ Unlimited", platinum: "✓ Unlimited" },
  { feature: "Featured Listings", silver: "✗", gold: "✓", platinum: "✓ Priority" },
  { feature: "Applicant Management", silver: "Basic", gold: "✓ Full", platinum: "✓ AI-Powered" },
  { feature: "Candidate Shortlisting", silver: "✗", gold: "✓", platinum: "✓ Smart" },
  { feature: "Recruitment Dashboard", silver: "✗", gold: "✓", platinum: "✓ Advanced" },
  { feature: "Verification Badge", silver: "✗", gold: "✗", platinum: "✓" },
  { feature: "Custom Branding", silver: "✗", gold: "✗", platinum: "✓" },
  { feature: "Priority Support", silver: "✗", gold: "✓", platinum: "✓ 24/7" },
];

interface EmployerPlansProps {
  onRoleSwitch: (role: "jobseeker" | "business") => void;
  isLight?: boolean;
}

const EmployerPlans: React.FC<EmployerPlansProps> = ({ onRoleSwitch, isLight = false }) => {
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
      gsap.from(".emp-plan-card", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true },
        opacity: 0,
        y: 60,
        duration: 0.7,
        stagger: 0.2,
        ease: "power3.out",
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
      <section
        className="pricing-section"
        ref={sectionRef}
        id="employer-plans"
        style={{ background: "linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 100%)" }}
      >
        <div className="container">
          <div className="pricing-section-title">
            <div className="sub-badge">For Employers</div>
            <h2 className="sub-heading">
              <span className="gold-text">Find Top Talent Faster</span>
            </h2>
            <p className="sub-subheading">
              Post unlimited jobs and streamline your entire recruitment pipeline.
            </p>
          </div>

          {/* Per-section billing toggle */}
          <div className="section-billing-toggle">
            {(["daily", "weekly", "monthly"] as BillingPeriod[]).map((p) => (
              <button
                key={p}
                className={`sbt-btn${billing === p ? " active" : ""}`}
                onClick={() => setBilling(p)}
                id={`emp-billing-${p}`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="pricing-cards-row three-col">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`pricing-card emp-plan-card${plan.featured ? " featured" : ""} ${plan.tierClass}`}
                id={plan.id}
              >
                {plan.badge && <div className="card-badge">{plan.badge}</div>}
                <div className="card-tier-ribbon">{plan.tier}</div>
                <div className="card-plan-type">Employer</div>
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

          <div className="plan-action-row">
            <button
              className="btn-compare-plans"
              id="emp-compare-btn"
              onClick={() => setShowCompare(true)}
            >
              <span className="compare-icon">⚖</span> Compare Employer Plans
            </button>
            <div className="role-switch-inline">
              <span className="role-switch-label">Switch role:</span>
              <button className="role-pill" onClick={() => onRoleSwitch("jobseeker")} id="emp-switch-js">
                🔍 Job Seeker
              </button>
              <button className="role-pill" onClick={() => onRoleSwitch("business")} id="emp-switch-biz">
                📣 Business
              </button>
            </div>
          </div>
        </div>
      </section>

      {showCompare && (
        <div className={`compare-modal-overlay${isLight ? " compare-modal--light" : ""}`} onClick={() => setShowCompare(false)} id="emp-compare-modal">
          <div className={`compare-modal-box${isLight ? " compare-modal--light" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className="compare-modal-header">
              <div>
                <div className="sub-badge" style={{ marginBottom: 8 }}>Employer Plans</div>
                <h3 className="compare-modal-title">Plan <span className="gold-text">Comparison</span></h3>
              </div>
              <button className="compare-modal-close" onClick={() => setShowCompare(false)} id="emp-compare-close" aria-label="Close">✕</button>
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
              <a href="#employer-plans" className="card-cta-btn primary" onClick={() => setShowCompare(false)} id="emp-compare-choose">
                Choose Your Plan
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployerPlans;
