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

const fallbackPlans = [
  {
    id: "biz-basic",
    tier: "Basic Promo",
    icon: "📣",
    iconBoxClass: "icon-box-blue",
    badge: null,
    tierClass: "tier-basic",
    priceDaily: "$1.99",
    priceWeekly: "$9.99",
    priceMonthly: "$29.99",
    desc: "Entry-level visibility for local business growth.",
    features: [
      { text: "Business Listing Promotion", included: true },
      { text: "Search Priority Ranking", included: true },
      { text: "Basic Analytics Dashboard", included: true },
      { text: "Homepage Featured Placement", included: false },
      { text: "Dedicated Promotion Banner", included: false },
      { text: "Lead Generation Support", included: false },
      { text: "Multi-Location Exposure", included: false },
    ],
    cta: "Get Basic Promo →",
    featured: false,
  },
  {
    id: "biz-pro-promo",
    tier: "Pro Promo",
    icon: "👑",
    iconBoxClass: "icon-box-blue",
    badge: "★ Most Popular",
    tierClass: "tier-pro",
    priceDaily: "$4.99",
    priceWeekly: "$19.99",
    priceMonthly: "$59.99",
    desc: "Maximum brand exposure and featured placement.",
    features: [
      { text: "Everything in Basic Promo", included: true },
      { text: "Homepage Featured Placement", included: true },
      { text: "Dedicated Promotion Banner", included: true },
      { text: "Advanced Analytics & Clicks", included: true },
      { text: "Lead Generation Inquiries", included: true },
      { text: "5 Business Locations", included: true },
      { text: "Priority Customer Support", included: true },
    ],
    cta: "Choose Pro Promo →",
    featured: true,
  },
  {
    id: "biz-enterprise-promo",
    tier: "Enterprise Promo",
    icon: "🏢",
    iconBoxClass: "icon-box-cyan",
    badge: null,
    tierClass: "tier-enterprise",
    priceDaily: "Custom",
    priceWeekly: "Custom",
    priceMonthly: "Custom Pricing",
    desc: "Full-scale corporate promotion and campaign support.",
    features: [
      { text: "Everything in Pro Promo", included: true },
      { text: "Unlimited Promotion Banners", included: true },
      { text: "Unlimited Business Locations", included: true },
      { text: "Dedicated Campaign Manager", included: true },
      { text: "Custom Ad Creative & A/B Testing", included: true },
      { text: "Multi-Platform Syndication", included: true },
      { text: "Executive ROI Reports", included: true },
    ],
    cta: "Contact Us →",
    featured: false,
  },
];

const compareRows = [
  { feature: "Business Listing", basic: "✓", pro: "✓ Featured", ent: "✓ Top Featured" },
  { feature: "Search Ranking Boost", basic: "✓ Basic", pro: "✓ Priority", ent: "✓ Maximum" },
  { feature: "Homepage Placement", basic: "—", pro: "✓", ent: "✓ Premium" },
  { feature: "Promotion Banner", basic: "—", pro: "✓", ent: "✓ Custom" },
  { feature: "Analytics Dashboard", basic: "Basic", pro: "✓ Full", ent: "✓ Advanced" },
  { feature: "Lead Generation", basic: "—", pro: "✓", ent: "✓ Dedicated" },
  { feature: "Promotion Manager", basic: "—", pro: "—", ent: "✓ Dedicated" },
];

interface BusinessPromotionPlansProps {
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
    else if (plan.isBestValue) badge = "🚀 Best Value";

    const icon = idx === 0 ? "📣" : idx === 1 ? "👑" : "🏢";
    const iconBoxClass = idx === 0 ? "icon-box-blue" : idx === 1 ? "icon-box-blue" : "icon-box-cyan";

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
        plan.tier === "basic"
          ? "Entry-level visibility for local business growth."
          : plan.tier === "plus"
          ? "Maximum brand exposure and featured placement."
          : "Full-scale corporate promotion and campaign support.",
      features: featuresList.length > 0 ? featuresList : (fallbackPlans[idx]?.features || []),
      cta: plan.tier === "premium" ? "Contact Us →" : idx === 1 ? "Choose Pro Promo →" : "Get Started →",
      featured: plan.isPopular || idx === 1,
    };
  });
};

const BusinessPromotionPlans: React.FC<BusinessPromotionPlansProps> = ({
  onRoleSwitch,
  isLight = false,
  dbPlans = [],
}) => {
  const { user, isLoggedIn, activeRole } = useAuth();
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [showCompare, setShowCompare] = useState(false);

  const renderedPlans = dbPlans.length > 0 ? getDynamicPlans(dbPlans, billing) : fallbackPlans;

  const handleSelectPlan = (e: React.MouseEvent, plan: typeof fallbackPlans[0] | any) => {
    e.preventDefault();
    if (plan.tier === "Enterprise Promo" || plan.priceMonthly === "Custom Pricing") {
      router.push("/contact?service=enterprise-sales");
      return;
    }
    if (!isLoggedIn || !user) {
      router.push(`/login?redirect=${encodeURIComponent(`/cart?plan=${plan.id}&billing=${billing}`)}`);
      return;
    }
    if (activeRole !== 3) {
      const currentRoleKey: UserRole = activeRole === 2 ? "employer" : "jobseeker";
      onRoleSwitch(currentRoleKey, "business");
      return;
    }
    router.push(`/cart?plan=${plan.id}&billing=${billing}`);
  };

  const getPrice = (p: typeof fallbackPlans[0]) => {
    if (p.priceMonthly === "Custom Pricing") return p.priceMonthly;
    if (billing === "daily") return p.priceDaily;
    if (billing === "weekly") return p.priceWeekly;
    return p.priceMonthly;
  };

  const getPeriod = (p: typeof fallbackPlans[0]) => {
    if (p.priceMonthly === "Custom Pricing") return "";
    if (billing === "daily") return "/day";
    if (billing === "weekly") return "/week";
    return "/month";
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".biz-plan-card", {
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
      <section className="pricing-section" ref={sectionRef} id="business-promotion-plans">
        <div className="container">
          <div className="pricing-section-title">
            <div className="sub-eyebrow mb-2">
              <span className="eyebrow-bullet">•</span> 3. BUSINESS PLANS
            </div>
            <h2 className="sub-heading">Plans to Grow Your Business</h2>
            <p className="sub-subheading">
              Homepage promotion, featured business placement, search ranking boost, and lead generation support.
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
                  id={`biz-billing-${p}`}
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
                className={`pricing-card biz-plan-card${plan.featured ? " featured" : ""} ${plan.tierClass}`}
                id={plan.id}
              >
                <div className="card-top-row">
                  <div className={`card-icon-box ${plan.iconBoxClass || "icon-box-blue"}`}>
                    {plan.icon || "📣"}
                  </div>
                  {plan.badge && <div className="card-badge">{plan.badge}</div>}
                </div>

                <div className="card-plan-name">{plan.tier}</div>

                <div className="card-price">
                  <span className="price-amount">{getPrice(plan)}</span>
                  {getPeriod(plan) && <span className="price-period">{getPeriod(plan)}</span>}
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
                  onClick={(e) => handleSelectPlan(e, plan)}
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
              id="biz-compare-btn"
              onClick={() => setShowCompare(true)}
            >
              ⚖ Compare Business Plans
            </button>
            <div className="role-switch-inline">
              <span className="role-switch-label">Switch role:</span>
              <button
                className="role-pill"
                onClick={() => onRoleSwitch("business", "jobseeker")}
                id="biz-switch-seeker"
              >
                👤 Job Seekers
              </button>
              <button
                className="role-pill"
                onClick={() => onRoleSwitch("business", "employer")}
                id="biz-switch-employer"
              >
                🏢 Employer
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
          id="biz-compare-modal"
        >
          <div
            className={`compare-modal-box${isLight ? " compare-modal--light" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="compare-modal-header">
              <div>
                <div className="sub-eyebrow mb-1">Business Promotion Plans</div>
                <h3 className="compare-modal-title">Plan Comparison</h3>
              </div>
              <button
                className="compare-modal-close"
                onClick={() => setShowCompare(false)}
                id="biz-compare-close"
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
                    <th>Basic</th>
                    <th>Pro</th>
                    <th>Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((row) => (
                    <tr key={row.feature}>
                      <td>{row.feature}</td>
                      <td>{renderCell(row.basic)}</td>
                      <td>{renderCell(row.pro)}</td>
                      <td>{renderCell(row.ent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="compare-modal-footer">
              <a
                href="#business-promotion-plans"
                className="card-cta-btn primary"
                onClick={() => setShowCompare(false)}
                id="biz-compare-choose"
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

export default BusinessPromotionPlans;
