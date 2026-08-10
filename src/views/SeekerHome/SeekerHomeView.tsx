"use client";
import React, { useState, useEffect } from "react";
import "../Home/Home.css";
import Hero from "@/components/Hero/Hero";
import CategorySection from "@/components/CategorySection/CategorySection";
import TrendingJobs from "@/components/TrendingJobs/TrendingJobs";
import StatsBanner from "@/components/StatsBanner/StatsBanner";
import PromotedBusinesses from "@/components/PromotedBusinesses/PromotedBusinesses";
import BusinessGrowth from "@/components/BusinessGrowth/BusinessGrowth";
import DiscoverJobs from "@/components/DiscoverJobs/DiscoverJobs";
import BlogSection from "@/components/BlogSection/BlogSection";
import AdPromotion from "@/components/AdPromotion/AdPromotion";
import AdBanner from "@/components/AdBanner/AdBanner";
import ProfileSidebar from "@/components/ProfileSidebar/ProfileSidebar";
import { useAuth } from "@/hooks/useAuth";

const NAVBAR_HEIGHT = 80;

const SeekerHomeView: React.FC = () => {
  const [bannerVisible, setBannerVisible] = useState(true);
  const { isLoggedIn, user } = useAuth();

  return (
    <>
      <div className="sticky-header">
        <AdPromotion
          bannerVisible={bannerVisible}
          onBannerClose={() => setBannerVisible(false)}
        />
      </div>

      <main style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
        <Hero />
        {isLoggedIn ? (
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
                <AdBanner />
                <div className="container p-0">
                  <PromotedBusinesses variant="home" />
                </div>
                <BusinessGrowth />
                <DiscoverJobs />
                <BlogSection />
              </div>
            </div>
          </div>
        ) : (
          <>
            <CategorySection />
            <TrendingJobs />
            <AdBanner />
            <div className="container">
              <PromotedBusinesses variant="home" />
            </div>
            <BusinessGrowth />
            <DiscoverJobs />
            <StatsBanner />
            <BlogSection />
          </>
        )}
      </main>
    </>
  );
};

export default SeekerHomeView;
