"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import "../../styles/subscription.css";
import "../../styles/subscription-light.css";
import "../Home/Home.css";
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
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";

interface RoleSwitchState {
  open: boolean;
  from: UserRole;
  to: UserRole;
}

const SubscriptionLight: React.FC = () => {
  const { user, activeRole } = useAuth();
  const searchParams = useSearchParams();

  const [selectedRole, setSelectedRole] = useState<UserRole>("jobseeker");
  const [roleSwitch, setRoleSwitch] = useState<RoleSwitchState>({
    open: false,
    from: "jobseeker",
    to: "employer",
  });

  useEffect(() => {
    const roleParam = searchParams.get("role") || searchParams.get("tab") || searchParams.get("type");
    if (roleParam) {
      const lower = roleParam.toLowerCase();
      if (lower === "2" || lower === "employer") {
        setSelectedRole("employer");
      } else if (lower === "3" || lower === "business" || lower === "promoter") {
        setSelectedRole("business");
      } else if (lower === "1" || lower === "seeker" || lower === "jobseeker") {
        setSelectedRole("jobseeker");
      }
    } else if (activeRole) {
      if (activeRole === 2) setSelectedRole("employer");
      else if (activeRole === 3) setSelectedRole("business");
      else setSelectedRole("jobseeker");
    }
  }, [searchParams, activeRole]);

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
  };

  const openRoleSwitch = (from: UserRole, to: UserRole) => {
    setSelectedRole(to);
  };

  return (
    <div className="subscription-page subscription-light-page">
      <Breadcrumb items={[{ label: 'Subscription & Pricing' }]} />
      <main style={{ paddingTop: "0" }}>
        {/* 1. Hero */}
        <PricingHero />

        {/* Stats Strip */}
        <StatsStrip />

        {/* Section Divider */}
        <div className="sub-section-divider" />

        {/* Role Selector Tabs — Light Theme */}
        <div className="container mt-4 mb-4 text-center" id="plans">
          <div className="sub-badge mb-3">
            ✨ Select Pricing Category
          </div>
          <div
            className="d-inline-flex p-1.5 rounded-4 shadow-sm"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(36, 84, 255, 0.15)",
              boxShadow: "0 10px 30px rgba(36, 84, 255, 0.08)"
            }}
          >
            <button
              type="button"
              onClick={() => handleRoleTabChange("jobseeker")}
              className="btn px-4 py-2.5 fw-bold transition-all"
              style={{
                borderRadius: "12px",
                fontSize: "0.95rem",
                background: selectedRole === "jobseeker" ? "linear-gradient(135deg, #2454FF, #4F46E5)" : "transparent",
                color: selectedRole === "jobseeker" ? "#FFFFFF" : "#4B5680",
                border: "none",
                boxShadow: selectedRole === "jobseeker" ? "0 4px 15px rgba(36, 84, 255, 0.3)" : "none",
                fontWeight: 700
              }}
            >
              👨‍💻 Job Seekers
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange("employer")}
              className="btn px-4 py-2.5 fw-bold transition-all"
              style={{
                borderRadius: "12px",
                fontSize: "0.95rem",
                background: selectedRole === "employer" ? "linear-gradient(135deg, #2454FF, #4F46E5)" : "transparent",
                color: selectedRole === "employer" ? "#FFFFFF" : "#4B5680",
                border: "none",
                boxShadow: selectedRole === "employer" ? "0 4px 15px rgba(36, 84, 255, 0.3)" : "none",
                fontWeight: 700
              }}
            >
              🏢 Employers
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabChange("business")}
              className="btn px-4 py-2.5 fw-bold transition-all"
              style={{
                borderRadius: "12px",
                fontSize: "0.95rem",
                background: selectedRole === "business" ? "linear-gradient(135deg, #2454FF, #4F46E5)" : "transparent",
                color: selectedRole === "business" ? "#FFFFFF" : "#4B5680",
                border: "none",
                boxShadow: selectedRole === "business" ? "0 4px 15px rgba(36, 84, 255, 0.3)" : "none",
                fontWeight: 700
              }}
            >
              🚀 Business Promoters
            </button>
          </div>
        </div>

        {/* Conditionally Render Selected Role Pricing Plans */}
        {selectedRole === "jobseeker" && (
          <JobSeekerPlans
            onRoleSwitch={(to) => openRoleSwitch("jobseeker", to)}
            isLight
          />
        )}

        {selectedRole === "employer" && (
          <EmployerPlans
            onRoleSwitch={(to) => openRoleSwitch("employer", to)}
            isLight
          />
        )}

        {selectedRole === "business" && (
          <BusinessPromotionPlans
            onRoleSwitch={(to) => openRoleSwitch("business", to)}
            isLight
          />
        )}

        {/* Section Divider */}
        <div className="sub-section-divider" />

        {/* Overall Comparison Table */}
        <ComparisonTable />

        <div className="sub-section-divider" />
        <PremiumBenefits />
        <div className="sub-section-divider" />
        <Testimonials />
        <div className="sub-section-divider" />
        <FAQ />
        <div className="sub-section-divider" />
        <SubscriptionCTA />
      </main>
    </div>
  );
};

export default SubscriptionLight;
