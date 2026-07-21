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
import { useSearchParams } from "next/navigation";

const NAVBAR_HEIGHT = 80;

const Home: React.FC = () => {
  const [bannerVisible, setBannerVisible] = useState(true);
  const { isLoggedIn, user } = useAuth();
  const searchParams = useSearchParams();

  // Active Role state: 1 = Job Seeker, 2 = Employer
  const [activeRole, setActiveRole] = useState<number>(1);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === '2' || roleParam === 'employer') {
      setActiveRole(2);
    } else if (roleParam === '1' || roleParam === 'jobseeker') {
      setActiveRole(1);
    } else if (user?.roles?.length) {
      if (user.roles.includes(2) && !user.roles.includes(1)) {
        // Employer only
        setActiveRole(2);
      } else if (user.roles.includes(1) && !user.roles.includes(2)) {
        // Job Seeker only
        setActiveRole(1);
      } else {
        // Dual role or multiple roles: check saved preference
        const savedRole = localStorage.getItem('activeHomeRole');
        if (savedRole) {
          setActiveRole(Number(savedRole));
        } else {
          setActiveRole(user.roles[0] || 1);
        }
      }
    }
  }, [searchParams, user]);

  return (
    <>
      <div className="sticky-header">
        <AdPromotion
          bannerVisible={bannerVisible}
          onBannerClose={() => setBannerVisible(false)}
        />
      </div>

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
        <EmployerHomeView />
      )}
    </>
  );
};

export default Home;
