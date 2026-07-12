"use client";
import React from 'react';
import './JobDetailsTabs.css';

type TabKey = 'details' | 'company' | 'reviews' | 'applicants';

interface Tab {
  key: TabKey;
  label: string;
  count?: number;
}

interface Props {
  activeTab: TabKey;
  onTabChange: (tab: string) => void;
  applicantCount?: number;
}

const JobDetailsTabs: React.FC<Props> = ({ activeTab, onTabChange, applicantCount = 0 }) => {
  const tabs: Tab[] = [
    { key: 'details', label: 'Job Details' },
    { key: 'company', label: 'Company' },
    { key: 'reviews', label: 'Reviews', count: 0 },
    { key: 'applicants', label: 'Applicants', count: applicantCount },
  ];

  return (
    <nav className="jdt-tabs" aria-label="Job details tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`jdt-tab ${activeTab === tab.key ? 'jdt-tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === tab.key}
          id={`jdt-tab-${tab.key}`}
          type="button"
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="jdt-count">({tab.count})</span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default JobDetailsTabs;
