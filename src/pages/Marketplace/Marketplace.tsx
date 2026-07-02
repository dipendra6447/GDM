"use client";
import React, { useState } from 'react';
import './Marketplace.css';

// Components
import MarketplaceHeader from '../../components/MarketplaceHeader/MarketplaceHeader';
import MarketplaceHero from '../../components/MarketplaceHero/MarketplaceHero';
import CategoryNav, { CategoryKey } from '../../components/CategoryNav/CategoryNav';
import FilterBar from '../../components/FilterBar/FilterBar';
import TopPicksSection from '../../components/TopPicksSection/TopPicksSection';
import RecentlyPosted from '../../components/RecentlyPosted/RecentlyPosted';
import MapWidget from '../../components/MapWidget/MapWidget';
import TrendingSearches from '../../components/TrendingSearches/TrendingSearches';
import ProfilePromo from '../../components/ProfilePromo/ProfilePromo';
import ValueProps from '../../components/ValueProps/ValueProps';
import MarketplaceStats from '../../components/MarketplaceStats/MarketplaceStats';
import MobileBottomNav from '../../components/MobileBottomNav/MobileBottomNav';
import Newsletter from '../../components/Newsletter/Newsletter';
// Data
import {
  topPicks,
  recentlyPosted,
  trendingSearches,
} from '../../utils/mockOpportunities';

const HEADER_HEIGHT = 74;

const Marketplace: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');

  return (
    <>
      {/* Sticky Header */}
      <MarketplaceHeader />

      <main
        className="mp-page"
        style={{ paddingTop: `${HEADER_HEIGHT}px` }}
      >
        {/* ── Top Section ── */}
        <section className="mp-top-section" aria-label="Discover opportunities">
          <div className="container">
            <MarketplaceHero />
            <CategoryNav
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
            <FilterBar />
          </div>
        </section>

        {/* ── Main Content Area (2 columns) ── */}
        <section className="mp-content-area" aria-label="Opportunities and sidebar">
          <div className="container">
            <div className="mp-two-col">
              {/* Left: Main content */}
              <div className="mp-main-col">
                <TopPicksSection opportunities={topPicks} />
                <RecentlyPosted items={recentlyPosted} />
                <ValueProps />
              </div>

              {/* Right: Sidebar */}
              <aside className="mp-sidebar-col" aria-label="Sidebar widgets">
                <div className="mp-sidebar-sticky">
                  <MapWidget />
                  <TrendingSearches items={trendingSearches} />
                  <ProfilePromo />
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ── Statistics ── */}
        <MarketplaceStats />

        {/* ── Newsletter (reused) ── */}
        <Newsletter />
      </main>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </>
  );
};

export default Marketplace;
