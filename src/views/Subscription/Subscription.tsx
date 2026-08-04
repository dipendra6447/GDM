"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
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
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";

interface RoleSwitchState {
  open: boolean;
  from: UserRole;
  to: UserRole;
}

const Subscription: React.FC = () => {
  const { user, activeRole } = useAuth();
  const searchParams = useSearchParams();

  const [selectedRole, setSelectedRole] = useState<UserRole>("jobseeker");
  const [roleSwitch, setRoleSwitch] = useState<RoleSwitchState>({
    open: false,
    from: "jobseeker",
    to: "employer",
  });

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/admin/subscription-plans");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setPlans(json.data);
        }
      } catch (err) {
        console.error("Error fetching pricing plans:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

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

  const seekerPlans = plans.filter((p) => p.roleTarget === "job_seeker" && p.isActive);
  const employerPlans = plans.filter((p) => p.roleTarget === "job_poster" && p.isActive);
  const businessPlans = plans.filter((p) => p.roleTarget === "business_promoter" && p.isActive);

  return (
    <div className="subscription-page">
      <Breadcrumb items={[{ label: 'Subscription & Pricing' }]} />
      <main style={{ paddingTop: "0" }}>
        {/* 1. Hero Section */}
        <PricingHero />

        {/* Stats Strip */}
        <StatsStrip />

        {/* Section Divider */}
        <div className="sub-section-divider" />

        {/* Luxury Black & Gold Role Selector Tabs */}
        <div className="container mt-4 mb-4 text-center" id="plans">
          <div className="sub-badge mb-3">
            ✨ Choose Your Membership Category
          </div>
          <div
            className="d-inline-flex p-1 rounded-4 shadow-lg"
            style={{
              background: "rgba(17, 17, 17, 0.9)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
            }}
          >
            <button
              type="button"
              onClick={() => handleRoleTabChange("jobseeker")}
              className="btn px-4 py-2.5 fw-bold transition-all"
              style={{
                borderRadius: "12px",
                fontSize: "0.95rem",
                background: selectedRole === "jobseeker" ? "linear-gradient(135deg, #D4AF37, #B8860B)" : "transparent",
                color: selectedRole === "jobseeker" ? "#000000" : "#FFFFFF",
                border: "none",
                boxShadow: selectedRole === "jobseeker" ? "0 4px 15px rgba(212, 175, 55, 0.3)" : "none",
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
                background: selectedRole === "employer" ? "linear-gradient(135deg, #D4AF37, #B8860B)" : "transparent",
                color: selectedRole === "employer" ? "#000000" : "#FFFFFF",
                border: "none",
                boxShadow: selectedRole === "employer" ? "0 4px 15px rgba(212, 175, 55, 0.3)" : "none",
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
                background: selectedRole === "business" ? "linear-gradient(135deg, #D4AF37, #B8860B)" : "transparent",
                color: selectedRole === "business" ? "#000000" : "#FFFFFF",
                border: "none",
                boxShadow: selectedRole === "business" ? "0 4px 15px rgba(212, 175, 55, 0.3)" : "none",
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
            onRoleSwitch={(from, to) => openRoleSwitch(from, to)}
            dbPlans={seekerPlans}
            loading={loading}
          />
        )}

        {selectedRole === "employer" && (
          <EmployerPlans
            onRoleSwitch={(from, to) => openRoleSwitch(from, to)}
            dbPlans={employerPlans}
            loading={loading}
          />
        )}

        {selectedRole === "business" && (
          <BusinessPromotionPlans
            onRoleSwitch={(from, to) => openRoleSwitch(from, to)}
            dbPlans={businessPlans}
            loading={loading}
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

export default Subscription;
