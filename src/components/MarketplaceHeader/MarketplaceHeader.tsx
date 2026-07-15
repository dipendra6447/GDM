"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './MarketplaceHeader.css';

const MarketplaceHeader: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState(() => searchParams.get('keyword') || '');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    setSearchValue(searchParams.get('keyword') || '');
  }, [searchParams]);

  const triggerSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue.trim()) {
      params.set('keyword', searchValue.trim());
    } else {
      params.delete('keyword');
    }
    params.set('page', '1');
    router.push(`/jobs?${params.toString()}`);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`mp-header ${scrolled ? 'mp-header-scrolled' : ''}`}
      role="banner"
      id="marketplace-header"
    >
      <div className="mp-header-inner">
        {/* Search Bar */}
        <div className={`mp-search-wrapper ${searchFocused ? 'mp-search-focused' : ''}`}>
          <i className="bi bi-search mp-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="mp-search-input"
            placeholder="Search jobs, businesses, services, gigs..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                triggerSearch();
              }
            }}
            aria-label="Search opportunities"
            id="mp-global-search"
          />
          {searchValue && (
            <button
              className="mp-search-clear"
              onClick={() => setSearchValue('')}
              aria-label="Clear search"
              type="button"
            >
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>

        {/* Search Button */}
        <button className="mp-search-btn" type="button" id="mp-search-submit" onClick={triggerSearch}>
          Search
        </button>

        {/* Location Selector */}
        <button className="mp-location-btn" type="button" id="mp-location-selector">
          <i className="bi bi-geo-alt-fill mp-location-icon" />
          <span className="mp-location-text">Dayton, OH</span>
          <i className="bi bi-chevron-down mp-location-chevron" />
        </button>

        {/* Save Search */}
        <button className="mp-save-search" type="button" id="mp-save-search">
          <i className="bi bi-bookmark" />
          <span>Save Search</span>
        </button>

        {/* Right Actions */}
        <div className="mp-header-actions">
          <button
            className="mp-action-btn mp-notification-btn"
            type="button"
            aria-label="Notifications"
            id="mp-notifications"
          >
            <i className="bi bi-bell" />
            <span className="mp-badge-count">5</span>
          </button>
          <button
            className="mp-action-btn"
            type="button"
            aria-label="Messages"
            id="mp-messages"
          >
            <i className="bi bi-chat-dots" />
          </button>
          <button
            className="mp-action-btn mp-avatar-btn"
            type="button"
            aria-label="Profile"
            id="mp-profile"
          >
            <div className="mp-avatar">
              <i className="bi bi-person-fill" />
            </div>
          </button>
          <div className="mp-theme-toggle" aria-hidden="true">
            <span className="mp-theme-icon mp-theme-dark">
              <i className="bi bi-moon-fill" />
            </span>
            <span className="mp-theme-icon mp-theme-light">
              <i className="bi bi-brightness-high-fill" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MarketplaceHeader;
