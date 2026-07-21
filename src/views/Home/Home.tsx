"use client";
import React, { useState, useEffect } from "react";
import "./Home.css";
import Hero from "../../components/Hero/Hero";
import CategorySection from "../../components/CategorySection/CategorySection";
import TrendingJobs from "../../components/TrendingJobs/TrendingJobs";
import StatsBanner from "../../components/StatsBanner/StatsBanner";
import PromotedBusinesses from "../../components/PromotedBusinesses/PromotedBusinesses";
import DiscoverJobs from "../../components/DiscoverJobs/DiscoverJobs";
import BlogSection from "../../components/BlogSection/BlogSection";
import AdPromotion from "../../components/AdPromotion/AdPromotion";
import ProfileSidebar from "../../components/ProfileSidebar/ProfileSidebar";
import EmployerHomeView from "../EmployerHome/EmployerHomeView";
import { useAuth } from "../../hooks/useAuth";
import { useSearchParams, useRouter } from "next/navigation";

const NAVBAR_HEIGHT = 80;

const Home: React.FC = () => {
  const [bannerVisible, setBannerVisible] = useState(true);
  const { isLoggedIn, user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Active Role state: 1 = Job Seeker, 2 = Employer
  const [activeRole, setActiveRole] = useState<number>(1);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === '2' || roleParam === 'employer') {
      setActiveRole(2);
    } else if (roleParam === '1' || roleParam === 'jobseeker') {
      setActiveRole(1);
    } else if (user?.roles?.length) {
      // Default to employer if primary role is 2, else 1
      if (user.roles.includes(2) && !user.roles.includes(1)) {
        setActiveRole(2);
      } else {
        const savedRole = localStorage.getItem('activeHomeRole');
        if (savedRole) setActiveRole(Number(savedRole));
      }
    }
  }, [searchParams, user]);

  const handleSwitchRole = (roleId: number) => {
    setActiveRole(roleId);
    localStorage.setItem('activeHomeRole', roleId.toString());
    const params = new URLSearchParams(window.location.search);
    params.set('role', roleId.toString());
    router.push(`/?${params.toString()}`);
  };

  return (
    <>
      <div className="sticky-header">
        <AdPromotion
          bannerVisible={bannerVisible}
          onBannerClose={() => setBannerVisible(false)}
        />
      </div>

      {/* Role Switcher Floating Bar for Logged-In Users */}
      {isLoggedIn && (
        <div 
          className="role-mode-switcher-bar bg-dark text-white py-2 px-3 d-flex justify-content-center align-items-center gap-3"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            borderRadius: '50px',
            border: '1px solid rgba(212,175,55,0.4)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            background: 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <span className="small text-secondary fw-semibold">View Mode:</span>
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn ${activeRole === 1 ? 'btn-primary fw-bold' : 'btn-outline-secondary text-white'}`}
              style={{ borderRadius: '50px 0 0 50px', fontSize: '0.8rem' }}
              onClick={() => handleSwitchRole(1)}
            >
              <i className="bi bi-person me-1" /> Job Seeker
            </button>
            <button
              type="button"
              className={`btn ${activeRole === 2 ? 'btn-warning fw-bold text-dark' : 'btn-outline-secondary text-white'}`}
              style={{ borderRadius: '0 50px 50px 0', fontSize: '0.8rem' }}
              onClick={() => handleSwitchRole(2)}
            >
              <i className="bi bi-briefcase-fill me-1" /> Employer
            </button>
          </div>
        </div>
      )}

      {/* ── 1. ANONYMOUS USER VIEW ── */}
      {!isLoggedIn && (
        <main style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
          <Hero />
          <CategorySection />
          <TrendingJobs />
          <div className="container">
            <PromotedBusinesses variant="home" />
          </div>
          <DiscoverJobs />
          <StatsBanner />
          <BlogSection />
        </main>
      )}

      {/* ── 2. JOB SEEKER MODE ── */}
      {isLoggedIn && activeRole === 1 && (
        <main style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
          <Hero />
          <div className="container home-split-layout mt-5">
            <div className="row g-4 align-items-start">
              {/* Left Profile Sidebar */}
              <aside className="col-lg-3 d-none d-lg-block sticky-sidebar" style={{ maxWidth: '300px' }}>
                <ProfileSidebar />
              </aside>

              {/* Right Main Content */}
              <div className="col-lg-9 col-12 home-main-content">
                <CategorySection />
                <TrendingJobs />
                <div className="container p-0">
                  <PromotedBusinesses variant="home" />
                </div>
                <DiscoverJobs />
                <BlogSection />
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── 3. EMPLOYER MODE ── */}
      {isLoggedIn && activeRole === 2 && (
        <EmployerHomeView onSwitchRole={handleSwitchRole} />
      )}
    </>
  );
};

export default Home;
