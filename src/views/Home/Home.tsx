"use client";
import React, { useState } from "react";
import "./Home.css";
import Hero from "../../components/Hero/Hero";
import CategorySection from "../../components/CategorySection/CategorySection";
import TrendingJobs from "../../components/TrendingJobs/TrendingJobs";
import StatsBanner from "../../components/StatsBanner/StatsBanner";
import PromotionCards from "../../components/PromotionCards/PromotionCards";
import PromotedBusinesses from "../../components/PromotedBusinesses/PromotedBusinesses";
import SpecialPromotions from "../../components/SpecialPromotions/SpecialPromotions";
import DiscoverJobs from "../../components/DiscoverJobs/DiscoverJobs";
import HiringBanner from "../../components/HiringBanner/HiringBanner";
import BlogSection from "../../components/BlogSection/BlogSection";
import BrowseJobs from "../../components/BrowseJobs/BrowseJobs";
import AdPromotion from "../../components/AdPromotion/AdPromotion";
import JoinCommunity from "../../components/JoinCommunity/JoinCommunity";
import ProfileSidebar from "../../components/ProfileSidebar/ProfileSidebar";
import { useAuth } from "../../hooks/useAuth";

const BANNER_HEIGHT = 46; // px — keep in sync with AdPromotion.css min-height
const NAVBAR_HEIGHT = 80; // px — keep in sync with --navbar-height variable

const Home: React.FC = () => {
  const [bannerVisible, setBannerVisible] = useState(true);
  const { isLoggedIn } = useAuth();

  const headerHeight = (bannerVisible ? BANNER_HEIGHT : 0) + NAVBAR_HEIGHT;

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
              {/* Left Sidebar (Sticky, hidden on mobile, max 300px) */}
              <aside className="col-lg-3 d-none d-lg-block sticky-sidebar" style={{ maxWidth: '300px' }}>
                <ProfileSidebar />
              </aside>

              {/* Right Main Content */}
              <div className="col-lg-9 col-12 home-main-content">
                <CategorySection />
                <TrendingJobs />
                {/* <PromotionCards /> */}
                <div className="container p-0">
                  <PromotedBusinesses variant="home" />
                </div>
                {/* <SpecialPromotions /> */}
                <DiscoverJobs />
                {/* <JoinCommunity /> */}
                {/* <HiringBanner /> */}
                <BlogSection />
                {/* <BrowseJobs /> */}
              </div>
            </div>
          </div>
        ) : (
          <>
            <CategorySection />
            <TrendingJobs />
            {/* <PromotionCards /> */}
            <div className="container">
              <PromotedBusinesses variant="home" />
            </div>
            {/* <SpecialPromotions /> */}
            <DiscoverJobs />
            {/* <JoinCommunity /> */}
            {/* <HiringBanner /> */}
            <BlogSection />
            {/* <BrowseJobs /> */}
          </>
        )}
      </main>
    </>
  );
};

export default Home;
