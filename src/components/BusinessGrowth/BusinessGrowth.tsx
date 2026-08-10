"use client";
import React from "react";
import Link from "next/link";
import "./BusinessGrowth.css";

interface FeatureItem {
  iconClass: string;
  title: string;
  description: string;
  themeColor: string;
}

const BusinessGrowth: React.FC = () => {
  const features: FeatureItem[] = [
    {
      iconClass: "bi bi-briefcase-fill",
      title: "Post Jobs Instantly",
      description: "Create and publish job listings in minutes.",
      themeColor: "purple",
    },
    {
      iconClass: "bi bi-search",
      title: "Find the Right Talent",
      description: "Search and filter qualified candidates fast.",
      themeColor: "green",
    },
    {
      iconClass: "bi bi-person-badge-fill",
      title: "Manage Applications",
      description: "Track, review, and manage all applications easily.",
      themeColor: "blue",
    },
    {
      iconClass: "bi bi-megaphone-fill",
      title: "Promote Your Business",
      description: "Increase visibility and attract more customers.",
      themeColor: "orange",
    },
    {
      iconClass: "bi bi-shop",
      title: "Showcase Services",
      description: "List services and get discovered by more people.",
      themeColor: "pink",
    },
    {
      iconClass: "bi bi-bar-chart-line-fill",
      title: "Powerful Analytics",
      description: "Measure performance and make smarter decisions.",
      themeColor: "indigo",
    },
  ];

  return (
    <section className="growth-section section-padding" id="business-growth">
      <div className="container">
        {/* Header Block */}
        <div className="growth-header-block text-center">
          <div className="growth-badge">
            <i className="bi bi-briefcase-fill"></i>
            <span>Built for Business Growth</span>
          </div>
          <h2 className="growth-title">
            Why Businesses Choose <span className="growth-brand">GoDiscoverMe</span>
          </h2>
          <p className="growth-subtitle">
            Everything you need to hire, promote, and grow — all in one powerful platform.
          </p>
        </div>

        {/* Features Row */}
        <div className="growth-features-grid">
          {features.map((feat, index) => (
            <div key={index} className="growth-feature-col">
              <div className={`growth-icon-wrap theme-${feat.themeColor}`}>
                <i className={feat.iconClass}></i>
              </div>
              <h3 className="growth-feature-title">{feat.title}</h3>
              <p className="growth-feature-desc">{feat.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA Box */}
        <div className="growth-cta-box">
          <div className="growth-cta-left">
            <div className="growth-cta-icon">
              <i className="bi bi-rocket-takeoff-fill"></i>
            </div>
            <div className="growth-cta-text">
              <h4 className="growth-cta-title">
                Join thousands of businesses growing faster with GoDiscoverMe.
              </h4>
              <p className="growth-cta-desc">
                Post jobs, promote your business, and connect with the right people today.
              </p>
            </div>
          </div>
          <div className="growth-cta-right">
            <Link href="/register?role=employer" className="growth-btn btn-primary-blue">
              <i className="bi bi-shop"></i> Register Your Business
            </Link>
            <Link href="/employer/post-job" className="growth-btn btn-outline-blue">
              <i className="bi bi-briefcase-fill"></i> Post a Job Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BusinessGrowth;
