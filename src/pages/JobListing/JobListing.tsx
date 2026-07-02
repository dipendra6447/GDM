"use client";
import React, { useState } from 'react';
import './JobListing.css';

// Shared components
import MarketplaceHeader from '../../components/MarketplaceHeader/MarketplaceHeader';

import MapWidget from '../../components/MapWidget/MapWidget';
import RefineSearch from '../../components/RefineSearch/RefineSearch';
import SearchResultCard from '../../components/SearchResultCard/SearchResultCard';
import SearchPagination from '../../components/SearchPagination/SearchPagination';
import Newsletter from '../../components/Newsletter/Newsletter';
import MobileBottomNav from '../../components/MobileBottomNav/MobileBottomNav';

// Data
import { mockSearchResults, categoryCounts } from '../../utils/mockSearchResults';

type CategoryTab = 'all' | 'jobs' | 'gigs' | 'businesses' | 'services' | 'events';

interface TabItem {
  key: CategoryTab;
  label: string;
}

const tabs: TabItem[] = [
  { key: 'all', label: 'All' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'gigs', label: 'Gigs' },
  { key: 'businesses', label: 'Businesses' },
  { key: 'services', label: 'Services' },
  { key: 'events', label: 'Events' },
];

const HEADER_HEIGHT = 74;

const JobListing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CategoryTab>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [location, setLocation] = useState('dayton');
  const [distance, setDistance] = useState('25');
  const [jobType, setJobType] = useState('all');
  const [expLevel, setExpLevel] = useState('all');
  const [sortBy, setSortBy] = useState('relevant');

  const totalPages = 16;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Marketplace-style header */}
      <MarketplaceHeader />

      <main
        className="jl2-main"
        style={{ paddingTop: `${HEADER_HEIGHT}px` }}
      >
        <div className="jl2-layout">
          {/* ── Center: Main Content ── */}
          <div className="jl2-center">
            {/* Search Results Header */}
            <div className="jl2-results-header">
              <div className="jl2-results-header-top">

                <div>
                  <h1 className="jl2-search-title">
                    Search results for "<span className="jl2-keyword">marketing manager</span>"
                  </h1>
                  <p className="jl2-search-meta">
                    {categoryCounts.all} results found in <strong>Dayton, OH</strong>
                  </p>
                </div>
              </div>

              {/* Category Tabs */}
              <div className="jl2-tabs-row">
                <div className="jl2-tabs-scroll">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      className={`jl2-tab ${activeTab === tab.key ? 'jl2-tab-active' : ''}`}
                      onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                      type="button"
                      id={`jl2-tab-${tab.key}`}
                    >
                      {tab.label}
                      <span className="jl2-tab-count">
                        ({categoryCounts[tab.key]})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Row */}
              <div className="jl2-filter-row">
                <div className="jl2-filter-selects">
                  <div className="jl2-filter-group">
                    <span className="jl2-filter-label">Location</span>
                    <select
                      className="jl2-filter-select"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      aria-label="Location"
                    >
                      <option value="dayton">Dayton, OH</option>
                      <option value="columbus">Columbus, OH</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>
                  <div className="jl2-filter-group">
                    <span className="jl2-filter-label">Distance</span>
                    <select
                      className="jl2-filter-select"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      aria-label="Distance"
                    >
                      <option value="10">10 miles</option>
                      <option value="25">25 miles</option>
                      <option value="50">50 miles</option>
                    </select>
                  </div>
                  <div className="jl2-filter-group">
                    <span className="jl2-filter-label">Job Type</span>
                    <select
                      className="jl2-filter-select"
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      aria-label="Job Type"
                    >
                      <option value="all">All Types</option>
                      <option value="full">Full-time</option>
                      <option value="part">Part-time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div className="jl2-filter-group">
                    <span className="jl2-filter-label">Experience Level</span>
                    <select
                      className="jl2-filter-select"
                      value={expLevel}
                      onChange={(e) => setExpLevel(e.target.value)}
                      aria-label="Experience Level"
                    >
                      <option value="all">All Levels</option>
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior Level</option>
                    </select>
                  </div>
                  <div className="jl2-filter-group">
                    <span className="jl2-filter-label">Sort by</span>
                    <select
                      className="jl2-filter-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      aria-label="Sort by"
                    >
                      <option value="relevant">Most Relevant</option>
                      <option value="newest">Newest</option>
                      <option value="salary">Highest Salary</option>
                    </select>
                  </div>
                </div>
                <button className="jl2-filter-btn" type="button">
                  <i className="bi bi-funnel" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Search Results List */}
            <div className="jl2-results-list" role="list" aria-label="Search results">
              {mockSearchResults.map((result) => (
                <SearchResultCard key={result.id} result={result} />
              ))}
            </div>

            {/* Pagination */}
            <SearchPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>

          {/* ── Right Sidebar ── */}
          <aside className="jl2-right-sidebar" aria-label="Map and filters">
            <div className="jl2-right-sticky">
              {/* Map — rename title */}
              <div className="jl2-map-wrapper">
                <MapWidget />
              </div>
              <RefineSearch />
            </div>
          </aside>
        </div>

        {/* Newsletter & Footer (full width) */}
        <Newsletter />
      </main>
      <MobileBottomNav />
    </>
  );
};

export default JobListing;
