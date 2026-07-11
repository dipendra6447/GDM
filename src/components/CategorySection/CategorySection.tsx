"use client";
import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import "./CategorySection.css";

// Fallback static images — used when a category has no uploaded image
import catItSoftware from "../../assets/images/categories/cat-it-software.png";
import catMarketing from "../../assets/images/categories/cat-marketing.png";
import catSales from "../../assets/images/categories/cat-sales.png";
import catHealthcare from "../../assets/images/categories/cat-healthcare.png";
import catDesign from "../../assets/images/categories/cat-design.png";
import catFinance from "../../assets/images/categories/cat-finance.png";
import catEngineering from "../../assets/images/categories/cat-engineering.png";
import catEducation from "../../assets/images/categories/cat-education.png";
import catCustomerSupport from "../../assets/images/categories/cat-customer-support.png";
import catMedia from "../../assets/images/categories/cat-media.png";
import catHospitality from "../../assets/images/categories/cat-hospitality.png";
import catLogistics from "../../assets/images/categories/cat-logistics.png";

// ── Accent color palette — cycles through vibrant colors ──
const ACCENT_COLORS = [
  "#7B3EFF", "#14B87A", "#F59E0B", "#2454FF", "#EC4899",
  "#06B6D4", "#8B5CF6", "#EF4444", "#10B981", "#F97316",
  "#6366F1", "#14B8A6",
];

// ── Fallback image map — matches common category names to static assets ──
const FALLBACK_IMAGES: Record<string, any> = {
  "it & software": catItSoftware,
  "it": catItSoftware,
  "software": catItSoftware,
  "marketing": catMarketing,
  "sales": catSales,
  "healthcare": catHealthcare,
  "design": catDesign,
  "finance": catFinance,
  "engineering": catEngineering,
  "education": catEducation,
  "customer support": catCustomerSupport,
  "media & entertainment": catMedia,
  "media": catMedia,
  "hospitality": catHospitality,
  "logistics": catLogistics,
};

interface CategoryData {
  id: string;
  name: string;
  imageUrl: string | null;
}

// ── Resolves image source: uploaded image > fallback match > generic placeholder ──
function getCategoryImage(cat: CategoryData): string {
  if (cat.imageUrl) return cat.imageUrl;
  const key = cat.name.toLowerCase().trim();
  const fallback = FALLBACK_IMAGES[key];
  if (fallback) return fallback?.src || fallback;
  // Generic gradient placeholder for unmatched categories
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#a78bfa"/>
      </linearGradient></defs>
      <rect width="120" height="120" rx="24" fill="url(#g)"/>
      <text x="60" y="68" font-size="40" fill="white" text-anchor="middle" font-family="Inter,sans-serif">${cat.name.charAt(0).toUpperCase()}</text>
    </svg>`
  )}`;
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

  // Don't render if no categories loaded and not loading
  if (!loading && categories.length === 0) return null;

  return (
    <section
      className="category-section section-padding-sm"
      id="categories"
      aria-label="Career categories"
    >
      <div className="container">
        {/* Header */}
        <div className="cat-header-row mb-5">
          <div>
            <div className="section-label">
              <i className="bi bi-grid-1x2"></i> Explore Careers
            </div>
            <h2 className="section-heading mb-1">
              Browse by <span className="gradient-text">Job Category</span>
            </h2>
            <p className="section-subtext" style={{ margin: 0 }}>
              Explore thousands of opportunities across top industries.
            </p>
          </div>
          <div className="cat-nav-buttons">
            <button
              className="cat-nav-btn"
              onClick={scrollPrev}
              aria-label="Previous categories"
              id="cat-prev-btn"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button
              className="cat-nav-btn"
              onClick={scrollNext}
              aria-label="Next categories"
              id="cat-next-btn"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
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
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div className="cat-embla-slide cat-card cat-card-skeleton" key={i}>
                    <div className="cat-card-img-wrap skeleton-shimmer" />
                    <div className="cat-card-label-skeleton skeleton-shimmer" />
                  </div>
                ))
              : categories.map((cat, index) => (
                  <a
                    href={`/jobs?category=${encodeURIComponent(cat.name)}`}
                    className="cat-embla-slide cat-card"
                    key={cat.id}
                    id={`category-card-${index}`}
                    aria-label={`Browse ${cat.name} jobs`}
                    style={
                      {
                        "--cat-accent":
                          ACCENT_COLORS[index % ACCENT_COLORS.length],
                      } as React.CSSProperties
                    }
                  >
                    <div className="cat-card-img-wrap">
                      <img
                        src={getCategoryImage(cat)}
                        alt={`${cat.name} category`}
                        className="cat-card-img"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="cat-card-label">{cat.name}</h3>
                    <span className="cat-card-underline"></span>
                  </a>
                ))}
          </div>
        </div>

        {/* View All */}
        <div className="text-center mt-5">
          <a
            href="/jobs"
            className="btn-outline-custom"
            id="view-all-categories-btn"
          >
            View All Categories <i className="bi bi-arrow-right ms-2"></i>
          </a>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
