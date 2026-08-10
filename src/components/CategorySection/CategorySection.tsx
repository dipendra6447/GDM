"use client";
import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import "./CategorySection.css";

// Accent color palette
const ACCENT_COLORS = [
  "#7B3EFF", "#14B87A", "#F59E0B", "#2454FF", "#EC4899", "#06B6D4"
];

// Fallback images
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=200&auto=format&fit=crop&q=80";

interface CategoryData {
  id: string;
  name: string;
  imageUrl: string | null;
}

// Sparkline & Metadata configurations matching the mockup
const CATEGORY_META: Record<string, { jobs: string; trend: string; color: string; path: string }> = {
  "technology & software": { jobs: "12,540 Jobs", trend: "↑ 24%", color: "#7B3EFF", path: "M 2 24 L 10 18 L 18 25 L 26 21 L 34 26 L 42 19 L 50 24 L 58 17 L 66 21 L 74 15 L 82 20 L 90 14 L 98 17" },
  "technology": { jobs: "12,540 Jobs", trend: "↑ 24%", color: "#7B3EFF", path: "M 2 24 L 10 18 L 18 25 L 26 21 L 34 26 L 42 19 L 50 24 L 58 17 L 66 21 L 74 15 L 82 20 L 90 14 L 98 17" },
  
  "healthcare & medicine": { jobs: "8,231 Jobs", trend: "↑ 18%", color: "#14B87A", path: "M 2 22 L 12 16 L 22 24 L 32 18 L 42 22 L 52 14 L 62 20 L 72 15 L 82 18 L 92 12 L 98 15" },
  "healthcare": { jobs: "8,231 Jobs", trend: "↑ 18%", color: "#14B87A", path: "M 2 22 L 12 16 L 22 24 L 32 18 L 42 22 L 52 14 L 62 20 L 72 15 L 82 18 L 92 12 L 98 15" },
  
  "finance & banking": { jobs: "5,621 Jobs", trend: "↑ 12%", color: "#2454FF", path: "M 2 25 L 15 22 L 28 26 L 40 18 L 52 23 L 65 15 L 78 20 L 90 12 L 98 14" },
  "finance": { jobs: "5,621 Jobs", trend: "↑ 12%", color: "#2454FF", path: "M 2 25 L 15 22 L 28 26 L 40 18 L 52 23 L 65 15 L 78 20 L 90 12 L 98 14" },
  
  "education & academia": { jobs: "4,231 Jobs", trend: "↑ 9%", color: "#EC4899", path: "M 2 23 L 14 18 L 26 24 L 38 19 L 50 22 L 62 14 L 74 20 L 86 15 L 98 16" },
  "education": { jobs: "4,231 Jobs", trend: "↑ 9%", color: "#EC4899", path: "M 2 23 L 14 18 L 26 24 L 38 19 L 50 22 L 62 14 L 74 20 L 86 15 L 98 16" },
  
  "design & creative": { jobs: "6,842 Jobs", trend: "↑ 14%", color: "#F59E0B", path: "M 2 24 L 12 18 L 22 25 L 32 20 L 42 23 L 52 15 L 62 22 L 72 17 L 82 21 L 92 13 L 98 16" },
  "design": { jobs: "6,842 Jobs", trend: "↑ 14%", color: "#F59E0B", path: "M 2 24 L 12 18 L 22 25 L 32 20 L 42 23 L 52 15 L 62 22 L 72 17 L 82 21 L 92 13 L 98 16" },
  
  "engineering & construction": { jobs: "3,987 Jobs", trend: "↑ 8%", color: "#06B6D4", path: "M 2 22 L 10 17 L 18 23 L 26 19 L 34 22 L 42 15 L 50 20 L 58 14 L 66 18 L 74 12 L 82 16 L 90 10 L 98 12" },
  "engineering": { jobs: "3,987 Jobs", trend: "↑ 8%", color: "#06B6D4", path: "M 2 22 L 10 17 L 18 23 L 26 19 L 34 22 L 42 15 L 50 20 L 58 14 L 66 18 L 74 12 L 82 16 L 90 10 L 98 12" },
  
  "marketing & communications": { jobs: "5,120 Jobs", trend: "↑ 11%", color: "#7B3EFF", path: "M 2 24 L 10 18 L 18 25 L 26 21 L 34 26 L 42 19 L 50 24 L 58 17 L 66 21 L 74 15 L 82 20 L 90 14 L 98 17" },
  "marketing": { jobs: "5,120 Jobs", trend: "↑ 11%", color: "#7B3EFF", path: "M 2 24 L 10 18 L 18 25 L 26 21 L 34 26 L 42 19 L 50 24 L 58 17 L 66 21 L 74 15 L 82 20 L 90 14 L 98 17" },
  
  "sales & business development": { jobs: "4,890 Jobs", trend: "↑ 10%", color: "#F59E0B", path: "M 2 24 L 12 18 L 22 25 L 32 20 L 42 23 L 52 15 L 62 22 L 72 17 L 82 21 L 92 13 L 98 16" },
  "sales": { jobs: "4,890 Jobs", trend: "↑ 10%", color: "#F59E0B", path: "M 2 24 L 12 18 L 22 25 L 32 20 L 42 23 L 52 15 L 62 22 L 72 17 L 82 21 L 92 13 L 98 16" },
  
  "customer support & success": { jobs: "7,150 Jobs", trend: "↑ 16%", color: "#14B87A", path: "M 2 22 L 12 16 L 22 24 L 32 18 L 42 22 L 52 14 L 62 20 L 72 15 L 82 18 L 92 12 L 98 15" },
  "customer support": { jobs: "7,150 Jobs", trend: "↑ 16%", color: "#14B87A", path: "M 2 22 L 12 16 L 22 24 L 32 18 L 42 22 L 52 14 L 62 20 L 72 15 L 82 18 L 92 12 L 98 15" },
  
  "human resources & recruiting": { jobs: "3,210 Jobs", trend: "↑ 7%", color: "#2454FF", path: "M 2 25 L 15 22 L 28 26 L 40 18 L 52 23 L 65 15 L 78 20 L 90 12 L 98 14" },
  "human resources": { jobs: "3,210 Jobs", trend: "↑ 7%", color: "#2454FF", path: "M 2 25 L 15 22 L 28 26 L 40 18 L 52 23 L 65 15 L 78 20 L 90 12 L 98 14" },
};

const DEFAULT_METAS = [
  { jobs: "12,540 Jobs", trend: "↑ 24%", color: "#7B3EFF", path: "M 2 24 L 10 18 L 18 25 L 26 21 L 34 26 L 42 19 L 50 24 L 58 17 L 66 21 L 74 15 L 82 20 L 90 14 L 98 17" },
  { jobs: "8,231 Jobs", trend: "↑ 18%", color: "#14B87A", path: "M 2 22 L 12 16 L 22 24 L 32 18 L 42 22 L 52 14 L 62 20 L 72 15 L 82 18 L 92 12 L 98 15" },
  { jobs: "6,842 Jobs", trend: "↑ 14%", color: "#F59E0B", path: "M 2 24 L 12 18 L 22 25 L 32 20 L 42 23 L 52 15 L 62 22 L 72 17 L 82 21 L 92 13 L 98 16" },
  { jobs: "5,621 Jobs", trend: "↑ 12%", color: "#2454FF", path: "M 2 25 L 15 22 L 28 26 L 40 18 L 52 23 L 65 15 L 78 20 L 90 12 L 98 14" },
  { jobs: "4,231 Jobs", trend: "↑ 9%", color: "#EC4899", path: "M 2 23 L 14 18 L 26 24 L 38 19 L 50 22 L 62 14 L 74 20 L 86 15 L 98 16" },
  { jobs: "3,987 Jobs", trend: "↑ 8%", color: "#06B6D4", path: "M 2 22 L 10 17 L 18 23 L 26 19 L 34 22 L 42 15 L 50 20 L 58 14 L 66 18 L 74 12 L 82 16 L 90 10 L 98 12" },
];

function getThemeColors(color: string) {
  switch (color) {
    case "#7B3EFF": return { bg: "#f3f0ff", border: "rgba(123, 62, 255, 0.2)" };
    case "#14B87A": return { bg: "#ecfdf5", border: "rgba(20, 184, 122, 0.2)" };
    case "#F59E0B": return { bg: "#fff7ed", border: "rgba(245, 158, 11, 0.2)" };
    case "#2454FF": return { bg: "#eff6ff", border: "rgba(36, 84, 255, 0.2)" };
    case "#EC4899": return { bg: "#fdf2f8", border: "rgba(236, 72, 153, 0.2)" };
    case "#06B6D4": return { bg: "#ecfeff", border: "rgba(6, 182, 212, 0.2)" };
    default: return { bg: "#f3f0ff", border: "rgba(123, 62, 255, 0.2)" };
  }
}

function getCategoryMeta(name: string, index: number) {
  const key = name.toLowerCase().trim();
  if (CATEGORY_META[key]) return CATEGORY_META[key];
  return DEFAULT_METAS[index % DEFAULT_METAS.length];
}

const CategorySection: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Fetch active job categories from the public API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories/job");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          // Sort or map the categories so that they line up nicely
          setCategories(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch job categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Re-initialize embla when categories change
  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [categories, emblaApi]);

  if (!loading && categories.length === 0) return null;

  return (
    <section
      className="category-section"
      id="categories"
      aria-label="Career categories"
    >
      <div className="container">
        {/* Header Block matching the mockup */}
        <div className="cat-header-row mb-4">
          <div className="cat-header-title-block">
            <div className="cat-icon-container">
              <i className="bi bi-briefcase-fill"></i>
            </div>
            <div className="cat-title-text-stack">
              <h2 className="cat-section-title">Top Industries Hiring in Your Area</h2>
              <p className="cat-section-subtitle">
                Discover industries with the most job opportunities near you.
              </p>
            </div>
          </div>
          <div className="cat-header-actions">
            <a href="/jobs" className="btn-view-all-industries" id="view-all-categories-btn">
              View All Industries <span className="arrow-right">→</span>
            </a>
          </div>
        </div>

        {/* Embla Carousel */}
        <div
          className="cat-embla"
          ref={emblaRef}
          aria-label="Job categories carousel"
        >
          <div className="cat-embla-container">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div className="cat-embla-slide cat-card cat-card-skeleton" key={i}>
                    <div className="cat-card-skeleton-header">
                      <div className="cat-card-img-wrap skeleton-shimmer" />
                      <div className="cat-card-label-skeleton skeleton-shimmer" />
                    </div>
                    <div className="cat-card-trend-skeleton skeleton-shimmer" />
                  </div>
                ))
              : categories.map((cat, index) => {
                  const meta = getCategoryMeta(cat.name, index);
                  const { bg: iconBg, border: iconBorder } = getThemeColors(meta.color);
                  const cardStyle = {
                    "--cat-accent": meta.color,
                    "--cat-icon-bg": iconBg,
                    "--cat-icon-border": iconBorder,
                  } as React.CSSProperties;

                  return (
                    <a
                      href={`/jobs?category=${encodeURIComponent(cat.name)}`}
                      className={`cat-embla-slide cat-card`}
                      key={cat.id}
                      id={`category-card-${index}`}
                      aria-label={`Browse ${cat.name} jobs`}
                      style={cardStyle}
                    >
                      {/* Top horizontal row */}
                      <div className="cat-card-top-row">
                        <div className="cat-card-img-wrap">
                          <img
                            src={cat.imageUrl || FALLBACK_IMAGE}
                            alt={`${cat.name} category`}
                            className="cat-card-img"
                            loading="lazy"
                          />
                        </div>
                        <div className="cat-card-title-stack">
                          <h3 className="cat-card-label">{cat.name.split(' & ')[0]}</h3>
                          <span className="cat-card-jobs">{meta.jobs}</span>
                        </div>
                      </div>

                      {/* Middle trend row */}
                      <div className="cat-card-trend-row">
                        <span className="cat-card-trend">
                          <i className="bi bi-arrow-up-short"></i> {meta.trend.replace('↑ ', '')}
                        </span>
                      </div>

                      {/* Sparkline wave at bottom */}
                      <svg className="cat-card-sparkline" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={meta.color} stopOpacity="0.15" />
                            <stop offset="100%" stopColor={meta.color} stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={meta.path} fill="none" stroke={meta.color} strokeWidth="1.5" />
                        <path d={`${meta.path} L 98 30 L 2 30 Z`} fill={`url(#grad-${index})`} />
                      </svg>
                    </a>
                  );
                })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
