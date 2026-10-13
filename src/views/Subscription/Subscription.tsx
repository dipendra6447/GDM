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
        if (activeRole === 2) {
          setSelectedRole("employer");
        } else if (activeRole === 3) {
          setSelectedRole("business");
        } else {
          setSelectedRole("jobseeker");
        }
      } else {
        const firstRole = user.roles[0];
        if (firstRole === 2) {
          setSelectedRole("employer");
        } else if (firstRole === 3) {
          setSelectedRole("business");
        } else {
          setSelectedRole("jobseeker");
        }
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

  const handleRoleSelect = (targetRole: UserRole) => {
    if (!isLoggedIn) {
      setSelectedRole(targetRole);
      const el = document.getElementById("plans");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (targetRole === "jobseeker") {
      if (hasJobSeekerRole) {
        setSelectedRole("jobseeker");
      } else {
        openRoleSwitch(selectedRole, "jobseeker");
      }
    } else if (targetRole === "employer") {
      if (hasEmployerRole) {
        setSelectedRole("employer");
      } else {
        openRoleSwitch(selectedRole, "employer");
      }
    } else if (targetRole === "business") {
      if (hasBusinessRole) {
        setSelectedRole("business");
      } else {
        openRoleSwitch(selectedRole, "business");
      }
    }
  };

  const openRoleSwitch = (from: UserRole, to: UserRole) => {
    if (!isLoggedIn) {
      setSelectedRole(to);
      const el = document.getElementById("plans");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setRoleSwitch({ open: true, from, to });
  };

  const seekerPlans = plans.filter((p) => p.roleTarget === "job_seeker" && p.isActive);
  const employerPlans = plans.filter((p) => p.roleTarget === "job_poster" && p.isActive);
  const businessPlans = plans.filter((p) => p.roleTarget === "business_promoter" && p.isActive);

  return (
    <div className="subscription-page">
      <Breadcrumb items={[{ label: "Subscription & Pricing" }]} />
      <main style={{ paddingTop: "0" }}>
        {/* 1. Hero Section */}
        <PricingHero />

        {/* 2. Stats Strip */}
        <StatsStrip />

        {/* Section Divider */}
        <div className="sub-section-divider" />

        {/* 3. Three User Plan Switcher: 1. Job Seekers, 2. Employer, 3. Business */}
        <div className="container mt-2 mb-4 text-center" id="plans">
          <div className="triple-role-switcher" role="tablist" aria-label="User Plans">
            <button
              type="button"
              role="tab"
              aria-selected={selectedRole === "jobseeker"}
              onClick={() => handleRoleSelect("jobseeker")}
              className={`role-segment-btn ${selectedRole === "jobseeker" ? "active" : ""}`}
              id="role-tab-jobseeker"
              aria-label="1. Job Seekers"
            >
              <div className="role-segment-icon">👤</div>
              <div>
                <div className="role-segment-title">1. Job Seekers</div>
                <div className="role-segment-sub">
                  Find jobs, build profile & apply
                </div>
              </div>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={selectedRole === "employer"}
              onClick={() => handleRoleSelect("employer")}
              className={`role-segment-btn ${selectedRole === "employer" ? "active" : ""}`}
              id="role-tab-employer"
              aria-label="2. Employer"
            >
              <div className="role-segment-icon">🏢</div>
              <div>
                <div className="role-segment-title">2. Employer</div>
                <div className="role-segment-sub">
                  Post jobs, hire talent & manage candidates
                </div>
              </div>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={selectedRole === "business"}
              onClick={() => handleRoleSelect("business")}
              className={`role-segment-btn ${selectedRole === "business" ? "active" : ""}`}
              id="role-tab-business"
              aria-label="3. Business"
            >
              <div className="role-segment-icon">🚀</div>
              <div>
                <div className="role-segment-title">3. Business</div>
                <div className="role-segment-sub">
                  Promote brand, gain reach & generate leads
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 4. Pricing Plans Rendering */}
        <div id="pricing-plans-display">
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
        </div>

        {/* Section Divider */}
        <div className="sub-section-divider" />

        {/* 5. One Platform. Multiple Ways to Grow. (Benefits Grid) */}
        <PremiumBenefits />

        <div className="sub-section-divider" />

        {/* 6. Comparison Table */}
        <ComparisonTable />

        <div className="sub-section-divider" />

        {/* 7. FAQ Section */}
        <FAQ />

        <div className="sub-section-divider" />

        {/* 8. Testimonials Section */}
        <Testimonials />

        <div className="sub-section-divider" />

        {/* 9. Bottom CTA Section */}
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
