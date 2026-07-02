"use client";
import React, { useState } from "react";
import "../../styles/subscription.css";
import PricingHero from "../../components/PricingHero/PricingHero";
import JobSeekerPlans from "../../components/JobSeekerPlans/JobSeekerPlans";
import EmployerPlans from "../../components/EmployerPlans/EmployerPlans";
import BusinessPromotionPlans from "../../components/BusinessPromotionPlans/BusinessPromotionPlans";
import ComparisonTable from "../../components/ComparisonTable/ComparisonTable";
import PremiumBenefits from "../../components/PremiumBenefits/PremiumBenefits";
import Testimonials from "../../components/Testimonials/Testimonials";
import FAQ from "../../components/FAQ/FAQ";
import SubscriptionCTA from "../../components/SubscriptionCTA/SubscriptionCTA";
import StatsStrip from "../../components/StatsStrip/StatsStrip";
import RoleSwitcherModal, { UserRole } from "../../components/RoleSwitcherModal/RoleSwitcherModal";

interface RoleSwitchState {
  open: boolean;
  from: UserRole;
  to: UserRole;
}

const Subscription: React.FC = () => {
  const [roleSwitch, setRoleSwitch] = useState<RoleSwitchState>({
    open: false,
    from: "jobseeker",
    to: "employer",
  });

  const openRoleSwitch = (from: UserRole, to: UserRole) => {
    setRoleSwitch({ open: true, from, to });
  };

  const closeRoleSwitch = () => {
    setRoleSwitch((prev) => ({ ...prev, open: false }));
  };

  const confirmRoleSwitch = () => {
    setRoleSwitch((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="subscription-page">
      <main style={{ paddingTop: "0" }}>
        {/* 1. Hero */}
        <PricingHero />

        {/* Stats Strip */}
        <StatsStrip />

        {/* Section Divider */}
        <div className="sub-section-divider" />

        {/* 2. Job Seeker Plans — with per-section billing + compare popup + role switch trigger */}
        <JobSeekerPlans
          onRoleSwitch={(to) => openRoleSwitch("jobseeker", to)}
        />

        {/* Section Divider */}
        <div className="sub-section-divider" />

        {/* 3. Employer Plans — with per-section billing + compare popup + role switch trigger */}
        <EmployerPlans
          onRoleSwitch={(to) => openRoleSwitch("employer", to)}
        />

        {/* Section Divider */}
        <div className="sub-section-divider" />

        {/* 4. Business Promotion Plans — with per-section billing + compare popup + role switch trigger */}
        <BusinessPromotionPlans
          onRoleSwitch={(to) => openRoleSwitch("business", to)}
        />

        {/* Section Divider */}
        <div className="sub-section-divider" />

        {/* 5. Overall Comparison Table */}
        <ComparisonTable />

        {/* Section Divider */}
        <div className="sub-section-divider" />

        {/* 6. Premium Benefits */}
        <PremiumBenefits />

        {/* Section Divider */}
        <div className="sub-section-divider" />

        {/* 7. Testimonials */}
        <Testimonials />

        {/* Section Divider */}
        <div className="sub-section-divider" />

        {/* 8. FAQ */}
        <FAQ />

        {/* Section Divider */}
        <div className="sub-section-divider" />

        {/* 9. CTA */}
        <SubscriptionCTA />
      </main>

      {/* Role Switcher Modal — rendered at page level */}
      {roleSwitch.open && (
        <RoleSwitcherModal
          currentRole={roleSwitch.from}
          targetRole={roleSwitch.to}
          onConfirm={confirmRoleSwitch}
          onCancel={closeRoleSwitch}
        />
      )}
    </div>
  );
};

export default Subscription;
