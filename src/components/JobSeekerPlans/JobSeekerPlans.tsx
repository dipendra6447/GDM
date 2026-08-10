"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "../RoleSwitcherModal/RoleSwitcherModal";

gsap.registerPlugin(ScrollTrigger);

type BillingPeriod = "daily" | "weekly" | "monthly";

const plans = [
  {
    id: "js-silver",
    tier: "Silver",
    badge: null,
    tierClass: "tier-silver",
    priceDaily: "₹29",
    priceWeekly: "₹99",
    priceMonthly: "₹299",
    desc: "Perfect for active job seekers",
    features: [
      { text: "Search Unlimited Jobs", included: true },
      { text: "First 3 Applications Free", included: true },
      { text: "Basic Profile", included: true },
      { text: "Apply Tracking", included: true },
      { text: "Unlimited Applications", included: false },
      { text: "Priority Visibility", included: false },
      { text: "Analytics Dashboard", included: false },
    ],
    cta: "Get Silver",
    featured: false,
  },
  {
    id: "js-gold",
    tier: "Gold",
    badge: "⭐ Most Popular",
    tierClass: "tier-gold",
    priceDaily: "₹59",
    priceWeekly: "₹199",
    priceMonthly: "₹599",
    desc: "Unlimited applications & priority",
    features: [
      { text: "Everything in Silver", included: true },
      { text: "Unlimited Applications", included: true },
      { text: "Priority Profile Visibility", included: true },
      { text: "Featured Candidate Badge", included: true },
      { text: "Application Analytics", included: true },
      { text: "Resume Enhancement", included: false },
      { text: "Premium Support", included: false },
    ],
    cta: "Get Gold",
    featured: true,
  },
  {
    id: "js-platinum",
    tier: "Platinum",
    badge: "👑 Best Value",
    tierClass: "tier-platinum",
    priceDaily: "₹99",
    priceWeekly: "₹299",
    priceMonthly: "₹899",
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
    cta: "Get Platinum",
    featured: false,
  },
];

// Comparison data
const compareRows = [
  { feature: "Job Applications", silver: "First 3 Free", gold: "✓ Unlimited", platinum: "✓ Unlimited" },
  { feature: "Profile Visibility", silver: "Basic", gold: "✓ Priority", platinum: "✓ Featured" },
  { feature: "Candidate Badge", silver: "✗", gold: "✓", platinum: "✓ Premium" },
  { feature: "Analytics Dashboard", silver: "✗", gold: "✓", platinum: "✓ Advanced" },
  { feature: "Resume Enhancement", silver: "✗", gold: "✗", platinum: "✓" },
  { feature: "Career Coaching", silver: "✗", gold: "✗", platinum: "✓" },
  { feature: "Priority Support", silver: "✗", gold: "✓", platinum: "✓ 24/7" },
  { feature: "Early Access Jobs", silver: "✗", gold: "✗", platinum: "✓" },
];

interface JobSeekerPlansProps {
  onRoleSwitch: (from: UserRole, to: UserRole) => void;
  isLight?: boolean;
  dbPlans?: any[];
  loading?: boolean;
}

const getDynamicPlans = (dbPlans: any[], billing: BillingPeriod) => {
  // Sort by monthlyPrice to ensure correct order
  const sortedPlans = [...dbPlans].sort((a, b) => a.monthlyPrice - b.monthlyPrice);
  
  return sortedPlans.map(plan => {
    // Transform DB features list to the UI format (assumed all in list are included)
    const featuresList = plan.features ? plan.features.map((f: string) => ({
      text: f,
      included: true
    })) : [];

    let badge = null;
    if (plan.isPopular) badge = "⭐ Most Popular";
    else if (plan.isBestValue) badge = "👑 Best Value";

    return {
      id: plan.id,
      tier: plan.name,
      badge,
      tierClass: `tier-${plan.tier.toLowerCase()}`,
      priceDaily: `₹${plan.dailyPrice}`,
      priceWeekly: `₹${plan.weeklyPrice}`,
      priceMonthly: `₹${plan.monthlyPrice}`,
      desc: plan.tier === "free" ? "Perfect for active entry" : plan.tier === "plus" ? "Unlimited applications & more" : "Maximum career acceleration",
      features: featuresList,
      cta: plan.tier === "free" ? "Current Plan" : `Get ${plan.name}`,
      featured: plan.isPopular
    };
  });
};

const JobSeekerPlans: React.FC<JobSeekerPlansProps> = ({ onRoleSwitch, isLight = false, dbPlans = [], loading = false }) => {
  const { user, isLoggedIn, activeRole } = useAuth();
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [showCompare, setShowCompare] = useState(false);

  const renderedPlans = dbPlans.length > 0 ? getDynamicPlans(dbPlans, billing) : plans;

  const handleSelectPlan = (e: React.MouseEvent, planId: string) => {
    e.preventDefault();
    if (!isLoggedIn || !user) {
      router.push(`/login?redirect=${encodeURIComponent(`/cart?plan=${planId}&billing=${billing}`)}`);
      return;
    }
    if (activeRole !== 1) {
      const currentRoleKey: UserRole = activeRole === 2 ? "employer" : "business";
      onRoleSwitch(currentRoleKey, "jobseeker");
      return;
    }
    router.push(`/cart?plan=${planId}&billing=${billing}`);
  };

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
      gsap.from(".js-plan-card", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
        },
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

  // Trap body scroll when compare modal open
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
      <section className="pricing-section" ref={sectionRef} id="plans">
        <div className="container">
          <div className="pricing-section-title">
            <div className="sub-badge">For Job Seekers</div>
            <h2 className="sub-heading">
              <span className="gold-text">Apply Without Limitations</span>
            </h2>
            <p className="sub-subheading">
              Choose your power level and accelerate your career journey.
            </p>
          </div>

          {/* Per-section billing toggle */}
          <div className="section-billing-toggle">
            {(["daily", "weekly", "monthly"] as BillingPeriod[]).map((p) => (
              <button
                key={p}
                className={`sbt-btn${billing === p ? " active" : ""}`}
                onClick={() => setBilling(p)}
                id={`js-billing-${p}`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Three-tier cards */}
          <div className="pricing-cards-row three-col">
            {renderedPlans.map((plan) => (
              <div
                key={plan.id}
                className={`pricing-card js-plan-card${plan.featured ? " featured" : ""} ${plan.tierClass}`}
                id={plan.id}
              >
                {plan.badge && <div className="card-badge">{plan.badge}</div>}
                <div className="card-tier-ribbon">{plan.tier}</div>
                <div className="card-plan-type">Job Seeker</div>
                <div className="card-plan-name">{plan.tier} Plan</div>
                <div className="card-price">
                  <span className="price-amount">{getPrice(plan)}</span>
                  <span className="price-period">{getPeriod()}</span>
                  <p className="price-desc">{plan.desc}</p>
                </div>
                <div className="card-divider" />
                <ul className="feature-list">
                  {plan.features.map((f: any) => (
                    <li key={f.text} className={`feature-item${f.included ? " included" : ""}`}>
                      <span className={`feature-check ${f.included ? "yes" : "no"}`}>
                        {f.included ? "✓" : "✗"}
                      </span>
                      {f.text}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={(e) => handleSelectPlan(e, plan.id)}
                  className={`card-cta-btn${plan.featured ? " primary" : ""}`}
                  id={`${plan.id}-cta`}
                >
                  {plan.cta}
                </button>
                <p className="plan-tc-link">
                  <Link href="/terms" target="_blank">Terms &amp; Conditions apply</Link>
                </p>
              </div>
            ))}
          </div>

          {/* Compare + Role Switch row */}
          <div className="plan-action-row">
            <button
              className="btn-compare-plans"
              id="js-compare-btn"
              onClick={() => setShowCompare(true)}
            >
              <span className="compare-icon">⚖</span> Compare Job Seeker Plans
            </button>
            <div className="role-switch-inline">
              <span className="role-switch-label">Switch role:</span>
              <button className="role-pill" onClick={() => onRoleSwitch("jobseeker", "employer")} id="js-switch-employer">
                🏢 Employer
              </button>
              <button className="role-pill" onClick={() => onRoleSwitch("jobseeker", "business")} id="js-switch-business">
                📣 Business
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Compare Modal */}
      {showCompare && (
        <div className={`compare-modal-overlay${isLight ? " compare-modal--light" : ""}`} onClick={() => setShowCompare(false)} id="js-compare-modal">
          <div className={`compare-modal-box${isLight ? " compare-modal--light" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className="compare-modal-header">
              <div>
                <div className="sub-badge" style={{ marginBottom: 8 }}>Job Seeker Plans</div>
                <h3 className="compare-modal-title">Plan <span className="gold-text">Comparison</span></h3>
              </div>
              <button className="compare-modal-close" onClick={() => setShowCompare(false)} id="js-compare-close" aria-label="Close">✕</button>
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
              <a href="#plans" className="card-cta-btn primary" onClick={() => setShowCompare(false)} id="js-compare-choose">
                Choose Your Plan
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobSeekerPlans;
