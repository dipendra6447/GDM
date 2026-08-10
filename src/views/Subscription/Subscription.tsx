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
  const { user, isLoggedIn, activeRole } = useAuth();
  const searchParams = useSearchParams();

  const [selectedRole, setSelectedRole] = useState<UserRole>("jobseeker");
  const [roleSwitch, setRoleSwitch] = useState<RoleSwitchState>({
    open: false,
    from: "jobseeker",
    to: "employer",
  });

  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Compute available role access for current user (or guest)
  const hasJobSeekerRole = !isLoggedIn || (user?.roles?.includes(1) ?? true);
  const hasEmployerRole = !isLoggedIn || (user?.roles?.includes(2) ?? false);
  const hasBusinessRole = !isLoggedIn || (user?.roles?.includes(3) ?? false);

  const availableRoleCount = [hasJobSeekerRole, hasEmployerRole, hasBusinessRole].filter(Boolean).length;

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans");
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

  const userRolesKey = user?.roles?.join(",") || "";

  useEffect(() => {
    if (isLoggedIn && user?.roles?.length) {
      if (activeRole && user.roles.includes(activeRole)) {
        if (activeRole === 2) setSelectedRole("employer");
        else if (activeRole === 3) setSelectedRole("business");
        else setSelectedRole("jobseeker");
      } else {
        const firstRole = user.roles[0];
        if (firstRole === 2) setSelectedRole("employer");
        else if (firstRole === 3) setSelectedRole("business");
        else setSelectedRole("jobseeker");
      }
    } else {
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
      }
    }
  }, [searchParams, activeRole, isLoggedIn, userRolesKey]);

  const handleRoleTabChange = (role: UserRole) => {
    if (!isLoggedIn) {
      setSelectedRole(role);
      return;
    }

    if (role === "jobseeker" && hasJobSeekerRole) setSelectedRole("jobseeker");
    if (role === "employer" && hasEmployerRole) setSelectedRole("employer");
    if (role === "business" && hasBusinessRole) setSelectedRole("business");
  };

  const openRoleSwitch = (from: UserRole, to: UserRole) => {
    setRoleSwitch({ open: true, from, to });
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

        {/* Luxury Black & Gold Role Selector Tabs — Dynamically rendered for assigned user roles */}
        <div className="container mt-4 mb-4 text-center" id="plans">
          <div className="sub-badge mb-3">
            {isLoggedIn
              ? `✨ Plans for Your Account (${user?.roles?.length || 1} Role${(user?.roles?.length || 1) > 1 ? 's' : ''})`
              : '✨ Choose Your Membership Category'}
          </div>

          {availableRoleCount > 1 ? (
            <div
              className="d-inline-flex p-1 rounded-4 shadow-lg"
              style={{
                background: "rgba(17, 17, 17, 0.9)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
              }}
            >
              {hasJobSeekerRole && (
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
              )}

              {hasEmployerRole && (
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
              )}

              {hasBusinessRole && (
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
              )}
            </div>
          ) : (
            <div className="sub-badge" style={{ fontSize: '1.05rem', padding: '10px 24px', borderRadius: '30px' }}>
              {selectedRole === "employer"
                ? '🏢 Membership Plans for Employers'
                : selectedRole === "business"
                ? '🚀 Membership Plans for Business Promoters'
                : '👨‍💻 Membership Plans for Job Seekers'}
            </div>
          )}
        </div>

        {/* Conditionally Render Selected Role Pricing Plans */}
        {selectedRole === "jobseeker" && (
          <JobSeekerPlans
            onRoleSwitch={(from, to) => openRoleSwitch(from as UserRole, to as UserRole)}
            dbPlans={seekerPlans}
            loading={loading}
          />
        )}

        {selectedRole === "employer" && (
          <EmployerPlans
            onRoleSwitch={(from, to) => openRoleSwitch(from as UserRole, to as UserRole)}
            dbPlans={employerPlans}
            loading={loading}
          />
        )}

        {selectedRole === "business" && (
          <BusinessPromotionPlans
            onRoleSwitch={(from, to) => openRoleSwitch(from as UserRole, to as UserRole)}
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

        {/* Role Switcher Modal Popup */}
        {roleSwitch.open && (
          <RoleSwitcherModal
            currentRole={roleSwitch.from}
            targetRole={roleSwitch.to}
            onConfirm={() => {
              setSelectedRole(roleSwitch.to);
              setRoleSwitch((prev) => ({ ...prev, open: false }));
            }}
            onCancel={() => setRoleSwitch((prev) => ({ ...prev, open: false }))}
          />
        )}
      </main>
    </div>
  );
};

export default Subscription;
