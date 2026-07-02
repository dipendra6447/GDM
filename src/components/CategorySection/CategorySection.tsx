"use client";
import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import "./CategorySection.css";

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

interface Category {
  image: any;
  label: string;
  count: string;
  accentColor: string;
}

const categories: Category[] = [
  {
    image: catItSoftware,
    label: "IT & Software",
    count: "18,420",
    accentColor: "#7B3EFF",
  },
  {
    image: catMarketing,
    label: "Marketing",
    count: "9,150",
    accentColor: "#14B87A",
  },
  { image: catSales, label: "Sales", count: "8,720", accentColor: "#F59E0B" },
  {
    image: catHealthcare,
    label: "Healthcare",
    count: "12,640",
    accentColor: "#2454FF",
  },
  { image: catDesign, label: "Design", count: "6,280", accentColor: "#EC4899" },
  {
    image: catFinance,
    label: "Finance",
    count: "7,330",
    accentColor: "#14B87A",
  },
  {
    image: catEngineering,
    label: "Engineering",
    count: "10,920",
    accentColor: "#06B6D4",
  },
  {
    image: catEducation,
    label: "Education",
    count: "5,870",
    accentColor: "#8B5CF6",
  },
  {
    image: catCustomerSupport,
    label: "Customer Support",
    count: "4,440",
    accentColor: "#F59E0B",
  },
  {
    image: catMedia,
    label: "Media & Entertainment",
    count: "3,560",
    accentColor: "#14B87A",
  },
  {
    image: catHospitality,
    label: "Hospitality",
    count: "2,890",
    accentColor: "#EC4899",
  },
  {
    image: catLogistics,
    label: "Logistics",
    count: "4,990",
    accentColor: "#06B6D4",
  },
];

const CategorySection: React.FC = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

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
            {categories.map((cat, index) => (
              <a
                href="#"
                className="cat-embla-slide cat-card"
                key={cat.label}
                id={`category-card-${index}`}
                aria-label={`Browse ${cat.label} jobs`}
                style={
                  { "--cat-accent": cat.accentColor } as React.CSSProperties
                }
              >
                <div className="cat-card-img-wrap">
                  <img
                    src={cat.image?.src || cat.image}
                    alt={`${cat.label} category`}
                    className="cat-card-img"
                    loading="lazy"
                  />
                </div>
                <h3 className="cat-card-label">{cat.label}</h3>
                <span className="cat-card-underline"></span>
              </a>
            ))}
          </div>
        </div>

        {/* View All */}
        <div className="text-center mt-5">
          <a
            href="#"
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
