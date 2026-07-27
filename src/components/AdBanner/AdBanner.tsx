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
  const [activeBanner, setActiveBanner] = React.useState({
    imageSrc,
    altText,
    href,
  });

  React.useEffect(() => {
    const fetchActiveBanner = async () => {
      try {
        const res = await fetch('/api/promotions/active');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const first = json.data[0];
            const rawBanner = first.bannerUrl || '';
            const urls = rawBanner
              ? rawBanner.split(',').map((u: string) => u.trim()).filter(Boolean)
              : [];
            
            const bannerImg = urls[0] 
              ? (urls[0].startsWith('http://') || urls[0].startsWith('https://') || urls[0].startsWith('/') ? urls[0] : `/${urls[0]}`)
              : imageSrc;

            setActiveBanner({
              imageSrc: bannerImg,
              altText: first.businessName || altText,
              href: first.businessContactDetails || href,
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch active banner', err);
      }
    };

    fetchActiveBanner();
  }, [imageSrc, altText, href]);

  return (
    <section className="home-ad-banner-section" aria-label="Advertisement Banner">
      <div className="container d-flex justify-content-center align-items-center">
        <a
          href={activeBanner.href}
          className="ad-banner-750x150-link"
          aria-label={activeBanner.altText}
          id="home-750x150-ad-banner"
          target={activeBanner.href.startsWith('http') ? '_blank' : '_self'}
          rel="noopener noreferrer"
        >
          <img
            src={activeBanner.imageSrc}
            alt={activeBanner.altText}
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
