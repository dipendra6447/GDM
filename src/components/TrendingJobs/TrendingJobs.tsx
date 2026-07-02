"use client";
import React, { useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import "./TrendingJobs.css";
import JobCard from "./JobCard";

import jobFullstack from "../../assets/images/jobs/job-fullstack.png";
import jobMarketing from "../../assets/images/jobs/job-marketing.png";
import jobUiux from "../../assets/images/jobs/job-uiux.png";
import jobAnalyst from "../../assets/images/jobs/job-analyst.png";
import jobDevops from "../../assets/images/jobs/job-devops.png";
import jobProduct from "../../assets/images/jobs/job-product.png";

export interface Job {
  id: number;
  title: string;
  company: string;
  companyLogo: string; // bootstrap icon class
  location: string;
  type: string;
  salary: string;
  cardBg: string; // soft bg color for the image area
  illustrationImg: any;
  tags: string[];
  applyBtnColor: string; // hex color for the Apply Now button
  category: string;
}

const jobs: Job[] = [
  {
    id: 1,
    title: "Full Stack Developer",
    company: "Tech Solutions Inc.",
    companyLogo: "bi-building",
    location: "Bangalore, India",
    type: "Full-time",
    salary: "₹12 – ₹20 LPA",
    cardBg: "#EEF0FF",
    illustrationImg: jobFullstack,
    tags: ["React", "Node.js", "MongoDB"],
    applyBtnColor: "#7B3EFF",
    category: "Technology",
  },
  {
    id: 2,
    title: "Digital Marketing Manager",
    company: "BrandBoost Pvt. Ltd.",
    companyLogo: "bi-building",
    location: "Mumbai, India",
    type: "Full-time",
    salary: "₹8 – ₹15 LPA",
    cardBg: "#EDFCF2",
    illustrationImg: jobMarketing,
    tags: ["SEO", "Google Ads", "Analytics"],
    applyBtnColor: "#14B87A",
    category: "Marketing",
  },
  {
    id: 3,
    title: "UI/UX Designer",
    company: "Creative Minds Studio",
    companyLogo: "bi-building",
    location: "Delhi, India",
    type: "Full-time",
    salary: "₹6 – ₹12 LPA",
    cardBg: "#EBF4FF",
    illustrationImg: jobUiux,
    tags: ["Figma", "UI Design", "Prototyping"],
    applyBtnColor: "#2454FF",
    category: "Design",
  },
  {
    id: 4,
    title: "Data Analyst",
    company: "Data Insights",
    companyLogo: "bi-building",
    location: "Hyderabad, India",
    type: "Full-time",
    salary: "₹7 – ₹13 LPA",
    cardBg: "#FFF6ED",
    illustrationImg: jobAnalyst,
    tags: ["SQL", "Excel", "Power BI"],
    applyBtnColor: "#F59E0B",
    category: "Technology",
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "CloudTech Systems",
    companyLogo: "bi-building",
    location: "Pune, India",
    type: "Full-time",
    salary: "₹10 – ₹18 LPA",
    cardBg: "#EDFCF2",
    illustrationImg: jobDevops,
    tags: ["AWS", "Docker", "Kubernetes"],
    applyBtnColor: "#14B87A",
    category: "Technology",
  },
  {
    id: 6,
    title: "Product Manager",
    company: "InnovateTech",
    companyLogo: "bi-building",
    location: "Bengaluru, India",
    type: "Full-time",
    salary: "₹15 – ₹25 LPA",
    cardBg: "#F6EEFF",
    illustrationImg: jobProduct,
    tags: ["Roadmap", "Agile", "Strategy"],
    applyBtnColor: "#7B3EFF",
    category: "Business",
  },
];

const filterTabs = [
  "All Jobs",
  "Technology",
  "Marketing",
  "Design",
  "Business",
  "Finance",
  "Healthcare",
  "Data Science",
];

const statsItems = [
  {
    icon: "bi-graph-up-arrow",
    label: "High Demand",
    sub: "Jobs with high market demand",
  },
  {
    icon: "bi-buildings",
    label: "Top Companies",
    sub: "Opportunities at leading companies",
  },
  {
    icon: "bi-cash-coin",
    label: "Competitive Salaries",
    sub: "Best pay for your skills",
  },
  {
    icon: "bi-rocket-takeoff",
    label: "Career Growth",
    sub: "Build a successful career",
  },
];

const TrendingJobs: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState("All Jobs");

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const filteredJobs =
    activeFilter === "All Jobs"
      ? jobs
      : jobs.filter((j) => j.category === activeFilter);

  return (
    <section
      className="trending-section section-padding-sm"
      id="trending"
      aria-label="Trending jobs"
    >
      <div className="container">
        {/* ── Centered heading ── */}
        <div className="trending-header text-center mb-4">
          <h2 className="trending-title">Most Trending Jobs</h2>
          <p className="trending-subtitle">
            Explore the most in-demand jobs and kick-start your career today
          </p>
          <div className="trending-divider">
            <span></span>
            <i className="bi bi-circle-fill"></i>
            <span></span>
          </div>
        </div>

        {/* ── Filter tabs ── */}
        <div
          className="trending-filters mb-4"
          role="tablist"
          aria-label="Job category filters"
        >
          {filterTabs.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeFilter === tab}
              className={`trend-filter-btn${
                activeFilter === tab ? " active" : ""
              }`}
              onClick={() => setActiveFilter(tab)}
              id={`filter-tab-${tab.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {tab === "All Jobs" && <i className="bi bi-grid-fill me-2"></i>}
              {tab === "Technology" && (
                <i className="bi bi-code-slash me-2"></i>
              )}
              {tab === "Marketing" && <i className="bi bi-megaphone me-2"></i>}
              {tab === "Design" && <i className="bi bi-brush me-2"></i>}
              {tab === "Business" && <i className="bi bi-briefcase me-2"></i>}
              {tab === "Finance" && (
                <i className="bi bi-currency-dollar me-2"></i>
              )}
              {tab === "Healthcare" && (
                <i className="bi bi-heart-pulse me-2"></i>
              )}
              {tab === "Data Science" && (
                <i className="bi bi-database me-2"></i>
              )}
              {tab}
            </button>
          ))}
        </div>

        {/* ── Embla Carousel ── */}
        <div
          className="trend-embla"
          ref={emblaRef}
          aria-label="Trending jobs carousel"
        >
          <div className="trend-embla-container">
            {filteredJobs.map((job) => (
              <div className="trend-embla-slide" key={job.id}>
                <JobCard job={job} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Carousel nav + View All ── */}
        <div className="trending-controls mt-4">
          <button
            className="trend-nav-btn"
            onClick={scrollPrev}
            aria-label="Previous jobs"
            id="trend-prev-btn"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          <a href="#" className="btn-outline-custom" id="view-all-jobs-btn">
            View All Trending Jobs <i className="bi bi-arrow-right ms-2"></i>
          </a>
          <button
            className="trend-nav-btn"
            onClick={scrollNext}
            aria-label="Next jobs"
            id="trend-next-btn"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>

        {/* ── Stats footer ── */}
        <div className="trending-stats mt-5">
          {statsItems.map((stat) => (
            <div className="trending-stat-item" key={stat.label}>
              <i className={`bi ${stat.icon} trending-stat-icon`}></i>
              <div>
                <div className="trending-stat-label">{stat.label}</div>
                <div className="trending-stat-sub">{stat.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingJobs;
