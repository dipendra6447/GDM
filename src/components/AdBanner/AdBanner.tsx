"use client";
import React from "react";
import "./AdBanner.css";

interface AdBannerProps {
  imageSrc?: string;
  altText?: string;
  href?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  imageSrc = "/images/ad_banner_750_150.png",
  altText = "Advertisement",
  href = "/subscription-light?tab=promoter",
}) => {
  return (
    <section className="home-ad-banner-section" aria-label="Advertisement Banner">
      <div className="container d-flex justify-content-center align-items-center">
        <a
          href={href}
          className="ad-banner-750x150-link"
          aria-label={altText}
          id="home-750x150-ad-banner"
        >
          <img
            src={imageSrc}
            alt={altText}
            className="ad-banner-750x150-img"
            width={750}
            height={150}
            loading="lazy"
          />
        </a>
      </div>
    </section>
  );
};

export default AdBanner;
