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

// Default plans matching Business Plans from the reference design mockup
const defaultPlans = [
  {
    id: "biz-starter",
    tier: "Business",
    icon: "🏬",
    iconBoxClass: "icon-box-blue",
    badge: null,
    tierClass: "tier-business",
    priceDaily: "$4.99",
    priceWeekly: "$12.99",
    priceMonthly: "$29.99",
    desc: "Get discovered and start growing your business.",
    features: [
      { text: "Business profile", included: true },
      { text: "Post jobs", included: true },
      { text: "Find candidates", included: true },
      { text: "Showcase services", included: true },
      { text: "Promote your business", included: true },
      { text: "Customer discovery", included: true },
      { text: "Basic analytics", included: true },
    ],
    cta: "Get Started →",
    featured: false,
  },
  {
    id: "biz-pro",
    tier: "Business Pro",
    icon: "👑",
    iconBoxClass: "icon-box-blue",
    badge: "★ Most Popular",
    tierClass: "tier-business-pro",
    priceDaily: "$9.99",
    priceWeekly: "$24.99",
    priceMonthly: "$59.99",
    desc: "Reach more people and opportunities.",
    features: [
      { text: "Everything in Business", included: true },
      { text: "More job postings", included: true },
      { text: "Enhanced business promotion", included: true },
      { text: "Increased visibility", included: true },
      { text: "Advanced candidate discovery", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Promotional tools", included: true },
    ],
    cta: "Choose Business Pro →",
    featured: true,
  },
  {
    id: "biz-enterprise",
    tier: "Enterprise",
    icon: "🏢",
    iconBoxClass: "icon-box-cyan",
    badge: null,
    tierClass: "tier-enterprise",
    priceDaily: "Custom",
    priceWeekly: "Custom",
    priceMonthly: "Custom Pricing",
    desc: "Built for organizations with bigger needs.",
    features: [
      { text: "Everything in Business Pro", included: true },
      { text: "Custom solutions", included: true },
      { text: "Higher-volume hiring", included: true },
      { text: "Advanced promotion options", included: true },
      { text: "Dedicated support", included: true },
      { text: "Custom visibility options", included: true },
      { text: "Enterprise capabilities", included: true },
    ],
    cta: "Contact Us →",
    featured: false,
  },
];

const compareRows = [
  { feature: "Business Profile", business: "✓", pro: "✓", ent: "✓ Custom" },
  { feature: "Job Postings", business: "Up to 5", pro: "Unlimited", ent: "Unlimited High-Volume" },
  { feature: "Candidate Discovery", business: "Basic", pro: "✓ Advanced", ent: "✓ AI-Powered" },
  { feature: "Business Promotion", business: "Standard", pro: "✓ Enhanced", ent: "✓ Maximum Reach" },
  { feature: "Showcase Services", business: "✓", pro: "✓", ent: "✓" },
  { feature: "Analytics Dashboard", business: "Basic", pro: "✓ Advanced", ent: "✓ Executive" },
  { feature: "Dedicated Support", business: "—", pro: "Priority", ent: "✓ Dedicated Manager" },
];

interface EmployerPlansProps {
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
    else if (plan.isBestValue) badge = "🏢 Enterprise";

    const icon = idx === 0 ? "🏬" : idx === 1 ? "👑" : "🏢";
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
      priceMonthly: plan.monthlyPrice === 0 ? "Free" : `$${plan.monthlyPrice}`,
      desc:
        plan.tier === "free"
          ? "Get discovered and start growing your business."
          : plan.tier === "plus"
          ? "Reach more people and opportunities."
          : "Built for organizations with bigger needs.",
      features: featuresList.length > 0 ? featuresList : (defaultPlans[idx]?.features || []),
      cta: plan.tier === "premium" ? "Contact Us →" : idx === 1 ? "Choose Business Pro →" : "Get Started →",
      featured: plan.isPopular || idx === 1,
    };
  });
};

const EmployerPlans: React.FC<EmployerPlansProps> = ({
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

  const handleSelectPlan = (e: React.MouseEvent, plan: typeof defaultPlans[0] | any) => {
    e.preventDefault();
    if (plan.tier === "Enterprise" || plan.priceMonthly === "Custom Pricing") {
      router.push("/contact?service=enterprise-sales");
      return;
    }
    if (!isLoggedIn || !user) {
      router.push(`/login?redirect=${encodeURIComponent(`/cart?plan=${plan.id}&billing=${billing}`)}`);
      return;
    }
    if (activeRole !== 2 && activeRole !== 3) {
      onRoleSwitch("jobseeker", "employer");
      return;
    }
    router.push(`/cart?plan=${plan.id}&billing=${billing}`);
  };

  const getPrice = (p: typeof defaultPlans[0]) => {
    if (p.priceMonthly === "Custom Pricing") return p.priceMonthly;
    if (billing === "daily") return p.priceDaily;
    if (billing === "weekly") return p.priceWeekly;
    return p.priceMonthly;
  };

  const getPeriod = (p: typeof defaultPlans[0]) => {
    if (p.priceMonthly === "Custom Pricing") return "";
    if (billing === "daily") return "/day";
    if (billing === "weekly") return "/week";
    return "/month";
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".emp-plan-card", {
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
      <section className="pricing-section" ref={sectionRef} id="employer-plans">
        <div className="container">
          <div className="pricing-section-title">
            <div className="sub-eyebrow mb-2">
              <span className="eyebrow-bullet">•</span> 2. EMPLOYER PLANS
            </div>
            <h2 className="sub-heading">Plans to Hire Top Talent</h2>
            <p className="sub-subheading">
              Post jobs, screen candidates, and scale your team with verified recruitment tools.
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
                  id={`emp-billing-${p}`}
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
                className={`pricing-card emp-plan-card${plan.featured ? " featured" : ""} ${plan.tierClass}`}
                id={plan.id}
              >
                <div className="card-top-row">
                  <div className={`card-icon-box ${plan.iconBoxClass || "icon-box-blue"}`}>
                    {plan.icon || "🏬"}
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
              id="emp-compare-btn"
              onClick={() => setShowCompare(true)}
            >
              ⚖ Compare Employer Plans
            </button>
            <div className="role-switch-inline">
              <span className="role-switch-label">Switch role:</span>
              <button
                className="role-pill"
                onClick={() => onRoleSwitch("employer", "jobseeker")}
                id="emp-switch-seeker"
              >
                👤 Job Seekers
              </button>
              <button
                className="role-pill"
                onClick={() => onRoleSwitch("employer", "business")}
                id="emp-switch-business"
              >
                🚀 Business
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
          id="emp-compare-modal"
        >
          <div
            className={`compare-modal-box${isLight ? " compare-modal--light" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="compare-modal-header">
              <div>
                <div className="sub-eyebrow mb-1">Employer Plans</div>
                <h3 className="compare-modal-title">Plan Comparison</h3>
              </div>
              <button
                className="compare-modal-close"
                onClick={() => setShowCompare(false)}
                id="emp-compare-close"
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
                    <th>Business</th>
                    <th>Business Pro</th>
                    <th>Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((row) => (
                    <tr key={row.feature}>
                      <td>{row.feature}</td>
                      <td>{renderCell(row.business)}</td>
                      <td>{renderCell(row.pro)}</td>
                      <td>{renderCell(row.ent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="compare-modal-footer">
              <a
                href="#business-plans"
                className="card-cta-btn primary"
                onClick={() => setShowCompare(false)}
                id="emp-compare-choose"
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

export default EmployerPlans;
