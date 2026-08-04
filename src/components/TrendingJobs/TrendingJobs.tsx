"use client";
import React, { useCallback, useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import "./TrendingJobs.css";
import JobCard from "./JobCard";
import SkeletonJobCard from "./SkeletonJobCard";

export interface Job {
  id: string;
  slug: string;
  title: string;
  companyName: string;
  location: string;
  jobType: string;
  salaryRange: string;
  category: string;
  tags?: string[];
  applyBtnColor?: string;
}

const DEFAULT_COLORS = ["#7B3EFF", "#14B87A", "#2454FF", "#F59E0B"];

// Icon map for common category names
const CATEGORY_ICONS: Record<string, string> = {
  "technology": "bi-code-slash",
  "it & software": "bi-code-slash",
  "marketing": "bi-megaphone",
  "design": "bi-brush",
  "business": "bi-briefcase",
  "finance": "bi-currency-dollar",
  "healthcare": "bi-heart-pulse",
  "data science": "bi-database",
  "education": "bi-mortarboard",
  "engineering": "bi-gear",
  "sales": "bi-cart",
  "customer support": "bi-headset",
  "media & entertainment": "bi-play-circle",
  "hospitality": "bi-cup-hot",
  "logistics": "bi-truck",
  "human resources": "bi-people",
  "legal": "bi-briefcase",
};

function getCategoryIcon(name: string): string {
  return CATEGORY_ICONS[name.toLowerCase().trim()] || "bi-tag";
}

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
  const [filterTabs, setFilterTabs] = useState<string[]>(["All Jobs"]);
  const [dbJobs, setDbJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Fetch dynamic categories from admin-managed DB
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories/job");
        if (!res.ok) return;
        const json = await res.json().catch(() => null);
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const categoryNames = json.data.map((c: any) => c.name);
          setFilterTabs(["All Jobs", ...categoryNames]);
        }
      } catch (err) {
        console.error("Failed to fetch job categories for filter tabs:", err);
      }
    };
    fetchCategories();

    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs?limit=12");
        if (!res.ok) {
          console.warn("API /api/jobs returned status:", res.status);
          return;
        }
        const json = await res.json().catch(() => null);
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          // Map to interface, handling missing fields
          const mapped = json.data.map((j: any, i: number) => ({
            id: j.id,
            slug: j.slug || j.id,
            title: j.title,
            companyName: j.companyName || "Company Name Hidden",
            location: j.location || "Location Not Provided",
            jobType: j.jobType || "Full-time",
            salaryRange: j.salaryRange || "Competitive",
            category: j.category || "Other",
            tags: j.skills ? j.skills.split(',').map((s:string) => s.trim()).filter(Boolean) : [],
            applyBtnColor: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
          }));
          setDbJobs(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch trending jobs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs =
    activeFilter === "All Jobs"
      ? dbJobs
      : dbJobs.filter((j) => j.category === activeFilter);

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
              <i className={`bi ${tab === "All Jobs" ? "bi-grid-fill" : getCategoryIcon(tab)} me-2`}></i>
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div className="trend-embla-slide" key={`skeleton-${index}`}>
                  <SkeletonJobCard />
                </div>
              ))
            ) : filteredJobs.length === 0 ? (
              <div className="text-center w-100 py-5 text-muted">
                <i className="bi bi-info-circle fs-3 d-block mb-2"></i>
                No trending jobs found in this category.
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div className="trend-embla-slide" key={job.id}>
                  <JobCard job={job} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Carousel nav + View All ── */}
        <div className="trending-controls mt-4">
          <button
            className="trend-nav-btn"
            onClick={scrollPrev}
            aria-label="Previous jobs"
            id="trend-prev-btn"
            disabled={isLoading}
            style={isLoading ? { opacity: 0.5, cursor: "not-allowed" } : {}}
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
            disabled={isLoading}
            style={isLoading ? { opacity: 0.5, cursor: "not-allowed" } : {}}
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
