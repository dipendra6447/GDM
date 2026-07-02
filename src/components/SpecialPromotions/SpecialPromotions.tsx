"use client";
import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import './SpecialPromotions.css';
import laptopImg from '../../assets/images/laptop_promo.png';

interface PromoItem {
  id: number;
  heading: string;
  subtext: string;
  description: string;
  validity: string;
  gradientClass: string;
}

const promos: PromoItem[] = [
  {
    id: 1,
    heading: 'Find 25% off',
    subtext: 'Guaranteed Results.',
    description: 'Results',
    validity: 'valid till may 17',
    gradientClass: 'sp-grad--blue',
  },
  {
    id: 2,
    heading: 'Find 25% off',
    subtext: 'Guaranteed Results.',
    description: 'Results',
    validity: 'valid till may 17',
    gradientClass: 'sp-grad--pink',
  },
  {
    id: 3,
    heading: 'Find 25% off',
    subtext: 'Guaranteed Results.',
    description: 'Results',
    validity: 'valid till may 17',
    gradientClass: 'sp-grad--dark',
  },
  {
    id: 4,
    heading: 'Find 25% off',
    subtext: 'Guaranteed Results.',
    description: 'Results',
    validity: 'valid till may 17',
    gradientClass: 'sp-grad--lavender',
  },
  {
    id: 5,
    heading: 'Find 25% off',
    subtext: 'Guaranteed Results.',
    description: 'Results',
    validity: 'valid till may 17',
    gradientClass: 'sp-grad--teal',
  },
  {
    id: 6,
    heading: 'Find 25% off',
    subtext: 'Guaranteed Results.',
    description: 'Results',
    validity: 'valid till may 17',
    gradientClass: 'sp-grad--dark',
  },
  {
    id: 7,
    heading: 'Find 25% off',
    subtext: 'Guaranteed Results.',
    description: 'Results',
    validity: 'valid till may 17',
    gradientClass: 'sp-grad--lavender',
  },
];

const SpecialPromotions: React.FC = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    slidesToScroll: 1,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section
      className="sp-section"
      id="special-promotions"
      aria-label="Special promotions"
    >
      <div className="container">
        {/* Section header row */}
        <div className="sp-header-row">
          <div>
            <h2 className="sp-section-title">Special Promotions</h2>
          </div>
          <div className="sp-header-right">
            <a href="#" className="sp-view-all" id="sp-view-all-link">
              View All Categories <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
            </a>
            <div className="sp-nav-buttons">
              <button className="sp-nav-btn" onClick={scrollPrev} aria-label="Previous promotions" id="sp-prev-btn">
                <i className="bi bi-chevron-left"></i>
              </button>
              <button className="sp-nav-btn" onClick={scrollNext} aria-label="Next promotions" id="sp-next-btn">
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Embla Carousel */}
        <div className="sp-embla" ref={emblaRef} aria-label="Special promotions carousel">
          <div className="sp-embla-container">
            {promos.map((promo) => (
              <article
                key={promo.id}
                className={`sp-card sp-embla-slide ${promo.gradientClass}`}
                id={`sp-card-${promo.id}`}
                aria-label={`${promo.heading} promotion`}
              >
                {/* LEFT — text */}
                <div className="sp-card-text">
                  <h3 className="sp-card-heading">{promo.heading}</h3>
                  <p className="sp-card-subtext">{promo.subtext}</p>
                  <p className="sp-card-desc">{promo.description}</p>
                  <p className="sp-card-validity">{promo.validity}</p>
                </div>

                {/* RIGHT — laptop image */}
                <div className="sp-card-image" aria-hidden="true">
                  <img
                    src={laptopImg.src}
                    alt="Laptop illustration"
                    className="sp-laptop-img"
                    loading="lazy"
                    draggable={false}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialPromotions;
