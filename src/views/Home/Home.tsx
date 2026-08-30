"use client";
import React, { useState, useEffect } from "react";
import "./Home.css";
import Hero from "../../components/Hero/Hero";
import PersonaCards from "../../components/PersonaCards/PersonaCards";
import CategorySection from "../../components/CategorySection/CategorySection";
import TrendingJobs from "../../components/TrendingJobs/TrendingJobs";
import StatsBanner from "../../components/StatsBanner/StatsBanner";
import PromotedBusinesses from "../../components/PromotedBusinesses/PromotedBusinesses";
import BusinessGrowth from "../../components/BusinessGrowth/BusinessGrowth";
import DiscoverJobs from "../../components/DiscoverJobs/DiscoverJobs";
import BlogSection from "../../components/BlogSection/BlogSection";
import AdPromotion from "../../components/AdPromotion/AdPromotion";
import AdBanner from "../../components/AdBanner/AdBanner";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/navigation";

const NAVBAR_HEIGHT = 80;

const Home: React.FC = () => {
  const [bannerVisible, setBannerVisible] = useState(true);
  const { isLoggedIn, activeRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      if (activeRole === 2) {
        router.replace('/employer');
      } else if (activeRole === 3) {
        router.replace('/dashboard');
      } else {
        router.replace('/seeker');
      }
    }
  }, [isLoggedIn, activeRole, isLoading, router]);

  if (isLoading || isLoggedIn) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#08090E' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="sticky-header">
        <AdPromotion
          bannerVisible={bannerVisible}
          onBannerClose={() => setBannerVisible(false)}
        />
      </div>

      {/* ── ANONYMOUS USER DEFAULT HOME VIEW ── */}
      <main style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
        <Hero />
        <PersonaCards />
        <TrendingJobs />
        <CategorySection />
        <AdBanner />
        <div className="container">
          <PromotedBusinesses variant="home" />
        </div>
        <BusinessGrowth />
        <DiscoverJobs />
        <StatsBanner />
        <BlogSection />
      </main>
    </>
  );
};

export default Home;
