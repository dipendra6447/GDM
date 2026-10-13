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

// Default fallback plans matching the design mockup exactly
const defaultPlans = [
  {
    id: "js-free",
    tier: "Free",
    icon: "🚀",
    iconBoxClass: "icon-box-violet",
    badge: null,
    tierClass: "tier-free",
    priceDaily: "$0",
    priceWeekly: "$0",
    priceMonthly: "$0",
    desc: "Start exploring and see what's possible.",
    features: [
      { text: "Create your profile", included: true },
      { text: "Discover jobs & opportunities", included: true },
      { text: "Browse businesses & services", included: true },
      { text: "Apply and connect", included: true },
      { text: "Basic networking", included: true },
      { text: "Basic profile visibility", included: true },
    ],
    cta: "Create Free Account →",
    featured: false,
  },
  {
    id: "js-plus",
    tier: "Plus",
    icon: "👑",
    iconBoxClass: "icon-box-blue",
    badge: "★ Most Popular",
    tierClass: "tier-plus",
    priceDaily: "$1.99",
    priceWeekly: "$4.99",
    priceMonthly: "$9.99",
    desc: "Get more tools and visibility to grow your opportunities.",
    features: [
      { text: "Everything in Free", included: true },
      { text: "Enhanced profile", included: true },
      { text: "Promote yourself", included: true },
      { text: "Increased visibility", included: true },
      { text: "Advanced search", included: true },
      { text: "Priority placement", included: true },
      { text: "More networking features", included: true },
    ],
    cta: "Get Plus →",
    featured: true,
  },
  {
    id: "js-pro",
    tier: "Pro",
    icon: "💎",
    iconBoxClass: "icon-box-purple",
    badge: null,
    tierClass: "tier-pro",
    priceDaily: "$3.99",
    priceWeekly: "$8.99",
    priceMonthly: "$19.99",
    desc: "For professionals serious about growth.",
    features: [
      { text: "Everything in Plus", included: true },
      { text: "Maximum profile visibility", included: true },
      { text: "Advanced promotion tools", included: true },
      { text: "Detailed analytics", included: true },
      { text: "Priority discovery", included: true },
      { text: "Exclusive opportunities", included: true },
      { text: "Professional tools & features", included: true },
    ],
    cta: "Get Pro →",
    featured: false,
  },
];

// Comparison table data
const compareRows = [
  { feature: "Create Profile", free: "✓", plus: "✓", pro: "✓" },
  { feature: "Discover Jobs & Opportunities", free: "✓", plus: "✓", pro: "✓" },
  { feature: "Apply / Connect", free: "✓ (First 3 Free)", plus: "✓ Unlimited", pro: "✓ Unlimited" },
  { feature: "Promote Yourself", free: "—", plus: "✓", pro: "✓" },
  { feature: "Enhanced Visibility", free: "—", plus: "✓", pro: "✓" },
  { feature: "Advanced Search", free: "—", plus: "✓", pro: "✓" },
  { feature: "Analytics", free: "Basic", plus: "Standard", pro: "Advanced" },
  { feature: "Priority Placement", free: "—", plus: "—", pro: "✓" },
];

interface JobSeekerPlansProps {
  onRoleSwitch: (from: UserRole, to: UserRole) => void;
  isLight?: boolean;
  dbPlans?: any[];
  loading?: boolean;
}

const getDynamicPlans = (dbPlans: any[], billing: BillingPeriod) => {
  const sortedPlans = [...dbPlans].sort((a, b) => a.monthlyPrice - b.monthlyPrice);

  return sortedPlans.map((plan, idx) => {
    const featuresList = plan.features
      ? plan.features.map((f: string) => ({ text: f, included: true }))
      : [];

    let badge = null;
    if (plan.isPopular) badge = "★ Most Popular";
    else if (plan.isBestValue) badge = "💎 Best Value";

    const icon = idx === 0 ? "🚀" : idx === 1 ? "👑" : "💎";
    const iconBoxClass = idx === 0 ? "icon-box-violet" : idx === 1 ? "icon-box-blue" : "icon-box-purple";

    return {
      id: plan.id,
      tier: plan.name,
      icon,
      iconBoxClass,
      badge,
      tierClass: `tier-${plan.tier.toLowerCase()}`,
      priceDaily: `$${plan.dailyPrice}`,
      priceWeekly: `$${plan.weeklyPrice}`,
      priceMonthly: `$${plan.monthlyPrice}`,
      desc:
        plan.tier === "free"
          ? "Start exploring and see what's possible."
          : plan.tier === "plus"
          ? "Get more tools and visibility to grow your opportunities."
          : "For professionals serious about growth.",
      features: featuresList.length > 0 ? featuresList : (defaultPlans[idx]?.features || []),
      cta: plan.tier === "free" ? "Create Free Account →" : `Get ${plan.name} →`,
      featured: plan.isPopular || idx === 1,
    };
  });
};

const JobSeekerPlans: React.FC<JobSeekerPlansProps> = ({
  onRoleSwitch,
  isLight = false,
  dbPlans = [],
}) => {
  const { user, isLoggedIn, activeRole } = useAuth();
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [showCompare, setShowCompare] = useState(false);

  const renderedPlans = dbPlans.length > 0 ? getDynamicPlans(dbPlans, billing) : defaultPlans;

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

  const getPrice = (p: typeof defaultPlans[0]) => {
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
        y: 40,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
        clearProps: "all",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    document.body.style.overflow = showCompare ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showCompare]);

  const renderCell = (val: string) => {
    if (val === "✓") return <span className="cmp-check">✓</span>;
    if (val === "—" || val === "✗") return <span className="cmp-cross">—</span>;
    if (val.startsWith("✓")) return <span className="cmp-check-text">{val}</span>;
    return <span className="cmp-plain">{val}</span>;
  };

  return (
    <>
      <section className="pricing-section" ref={sectionRef} id="personal-plans">
        <div className="container">
          <div className="pricing-section-title">
            <div className="sub-eyebrow mb-2">
              <span className="eyebrow-bullet">•</span> 1. JOB SEEKER PLANS
            </div>
            <h2 className="sub-heading">Plans for Your Next Move</h2>
            <p className="sub-subheading">
              Find work, build your profile, get discovered, and connect with opportunities.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="text-center">
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
          </div>

          {/* Three-tier cards row matching reference image */}
          <div className="pricing-cards-row three-col">
            {renderedPlans.map((plan) => (
              <div
                key={plan.id}
                className={`pricing-card js-plan-card${plan.featured ? " featured" : ""} ${plan.tierClass}`}
                id={plan.id}
              >
                <div className="card-top-row">
                  <div className={`card-icon-box ${plan.iconBoxClass || "icon-box-blue"}`}>
                    {plan.icon || "🚀"}
                  </div>
                  {plan.badge && <div className="card-badge">{plan.badge}</div>}
                </div>

                <div className="card-plan-name">{plan.tier}</div>

                <div className="card-price">
                  <span className="price-amount">{getPrice(plan)}</span>
                  <span className="price-period">{getPeriod()}</span>
                </div>

                <p className="price-desc">{plan.desc}</p>

                <div className="card-divider" />

                <ul className="feature-list">
                  {plan.features.map((f: any) => (
                    <li key={f.text} className={`feature-item${f.included ? " included" : ""}`}>
                      <span className={`feature-check ${f.included ? "yes" : "no"}`}>
                        {f.included ? "✓" : "—"}
                      </span>
                      <span>{f.text}</span>
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
              ⚖ Compare Job Seeker Plans
            </button>
            <div className="role-switch-inline">
              <span className="role-switch-label">Switch role:</span>
              <button
                className="role-pill"
                onClick={() => onRoleSwitch("jobseeker", "employer")}
                id="js-switch-employer"
              >
                🏢 Employer
              </button>
              <button
                className="role-pill"
                onClick={() => onRoleSwitch("jobseeker", "business")}
                id="js-switch-business"
              >
                📣 Business
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Compare Modal */}
      {showCompare && (
        <div
          className={`compare-modal-overlay${isLight ? " compare-modal--light" : ""}`}
          onClick={() => setShowCompare(false)}
          id="js-compare-modal"
        >
          <div
            className={`compare-modal-box${isLight ? " compare-modal--light" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="compare-modal-header">
              <div>
                <div className="sub-eyebrow mb-1">Personal Plans</div>
                <h3 className="compare-modal-title">Feature Comparison</h3>
              </div>
              <button
                className="compare-modal-close"
                onClick={() => setShowCompare(false)}
                id="js-compare-close"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="compare-table-scroll">
              <table className="compare-modal-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Free</th>
                    <th>Plus</th>
                    <th>Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((row) => (
                    <tr key={row.feature}>
                      <td>{row.feature}</td>
                      <td>{renderCell(row.free)}</td>
                      <td>{renderCell(row.plus)}</td>
                      <td>{renderCell(row.pro)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="compare-modal-footer">
              <a
                href="#personal-plans"
                className="card-cta-btn primary"
                onClick={() => setShowCompare(false)}
                id="js-compare-choose"
                style={{ maxWidth: 240 }}
              >
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
