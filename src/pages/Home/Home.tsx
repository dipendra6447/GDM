"use client";
import React, { useState } from "react";
import "./Home.css";
import Hero from "../../components/Hero/Hero";
import CategorySection from "../../components/CategorySection/CategorySection";
import TrendingJobs from "../../components/TrendingJobs/TrendingJobs";
import StatsBanner from "../../components/StatsBanner/StatsBanner";
import PromotionCards from "../../components/PromotionCards/PromotionCards";
import SpecialPromotions from "../../components/SpecialPromotions/SpecialPromotions";
import DiscoverJobs from "../../components/DiscoverJobs/DiscoverJobs";
import HiringBanner from "../../components/HiringBanner/HiringBanner";
import BlogSection from "../../components/BlogSection/BlogSection";
import BrowseJobs from "../../components/BrowseJobs/BrowseJobs";
import AdPromotion from "../../components/AdPromotion/AdPromotion";

const BANNER_HEIGHT = 46; // px — keep in sync with AdPromotion.css min-height
const NAVBAR_HEIGHT = 80; // px — keep in sync with --navbar-height variable

const Home: React.FC = () => {
  const [bannerVisible, setBannerVisible] = useState(true);

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
        <CategorySection />
        <TrendingJobs />
        {/* <StatsBanner /> */}
        <PromotionCards />
        <SpecialPromotions />
        <DiscoverJobs />
        <HiringBanner />
        <BlogSection />
        <BrowseJobs />
      </main>
    </>
  );
};

export default Home;
