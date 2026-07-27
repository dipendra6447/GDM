"use client";
import React, { useState } from "react";
import Link from "next/link";
import EmployerHero from "@/components/EmployerHome/EmployerHero";
import EmployerProfileSidebar from "@/components/EmployerHome/EmployerProfileSidebar";
import EmployerCandidateSearch from "@/components/EmployerHome/EmployerCandidateSearch";
import EmployerBenefitsSection from "@/components/EmployerHome/EmployerBenefitsSection";
import PromotedBusinesses from "@/components/PromotedBusinesses/PromotedBusinesses";
import BlogSection from "@/components/BlogSection/BlogSection";
import AdPromotion from "@/components/AdPromotion/AdPromotion";
import AdBanner from "@/components/AdBanner/AdBanner";
import { useAuth } from "@/hooks/useAuth";
import "./EmployerHomeView.css";

const BANNER_HEIGHT = 46;
const NAVBAR_HEIGHT = 80;

interface EmployerHomeViewProps {
  onSwitchRole?: (roleId: number) => void;
}

const EmployerHomeView: React.FC<EmployerHomeViewProps> = ({ onSwitchRole }) => {
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

      <main className="emp-home-main" style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
        {/* Employer Hero Banner */}
        <EmployerHero />

        {/* Dynamic Split Layout for Logged-In Employer or General Container */}
        {isLoggedIn ? (
          <div className="container home-split-layout mt-5">
            <div className="row g-4 align-items-start">
              {/* Left Sidebar: Employer Profile Sidebar */}
              <aside className="col-lg-3 d-none d-lg-block sticky-sidebar" style={{ maxWidth: '300px' }}>
                <EmployerProfileSidebar onSwitchRole={onSwitchRole} />
              </aside>

              {/* Right Main Content */}
              <div className="col-lg-9 col-12 home-main-content">
                {/* Candidates Showcase */}
                <EmployerCandidateSearch />

                {/* 750x150 Ad Banner */}
                <AdBanner />

                {/* Why Employers Choose JobNest */}
                <EmployerBenefitsSection />

                {/* Featured Promoted Businesses */}
                <div className="container p-0 my-5">
                  <PromotedBusinesses variant="home" />
                </div>

                {/* Employer Blog & Hiring Guides */}
                <BlogSection />
              </div>
            </div>
          </div>
        ) : (
          <>
            <EmployerCandidateSearch />
            <AdBanner />
            <EmployerBenefitsSection />
            <div className="container my-5">
              <PromotedBusinesses variant="home" />
            </div>
            <BlogSection />
          </>
        )}
      </main>
    </>
  );
};

export default EmployerHomeView;
