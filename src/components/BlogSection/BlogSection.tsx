"use client";
import React from 'react';
import './BlogSection.css';
import serviceBuildWebsite from '../../assets/images/service_build_website.png';
import serviceBuildMobileApp from '../../assets/images/service_build_mobile_app.png';
import serviceSeoOptimization from '../../assets/images/service_seo_optimization.png';

interface ServiceItem {
  id: number;
  image: any;
  imageAlt: string;
  category: string;
  categoryColor: string;
  categoryBg: string;
  date: string;
  author: string;
  authorInitials: string;
  authorAvatarColor: string;
  readTime: string;
  title: string;
  excerpt: string;
}

const services: ServiceItem[] = [
  {
    id: 1,
    image: serviceBuildWebsite,
    imageAlt: 'High-tech coding monitor concept',
    category: 'Web Development',
    categoryColor: '#2454FF',
    categoryBg: 'rgba(36,84,255,0.1)',
    date: 'Est. 2-3 Weeks',
    author: 'Dev Team',
    authorInitials: 'DT',
    authorAvatarColor: '#2454FF',
    readTime: 'Custom Quote',
    title: 'Custom Website Design & Development',
    excerpt:
      'We design and build high-performance, responsive websites with state-of-the-art animations, clean interfaces, and robust backend systems.',
  },
  {
    id: 2,
    image: serviceBuildMobileApp,
    imageAlt: 'Premium smartphone mockup showing interactive UI dashboard',
    category: 'App Development',
    categoryColor: '#7B3EFF',
    categoryBg: 'rgba(123,62,255,0.1)',
    date: 'Est. 4-6 Weeks',
    author: 'App Team',
    authorInitials: 'AT',
    authorAvatarColor: '#7B3EFF',
    readTime: 'Custom Quote',
    title: 'Native & Cross-Platform Mobile Applications',
    excerpt:
      'Launch premium mobile apps for iOS and Android built with Flutter or React Native, featuring smooth transitions and beautiful native UX.',
  },
  {
    id: 3,
    image: serviceSeoOptimization,
    imageAlt: 'SEO search analytics dashboard on a laptop',
    category: 'SEO & Marketing',
    categoryColor: '#14B87A',
    categoryBg: 'rgba(20,184,122,0.1)',
    date: 'Est. 1-2 Weeks',
    author: 'SEO Team',
    authorInitials: 'ST',
    authorAvatarColor: '#14B87A',
    readTime: 'Custom Quote',
    title: 'Search Engine Optimization & Google Audit',
    excerpt:
      'Drive organic search rankings, enhance page loading speeds, perform technical audits, and execute keyword targeting to scale conversions.',
  },
];

const BlogSection: React.FC = () => {
  return (
    <section className="blog-section section-padding" id="blog" aria-label="Our Extra Services">
      <div className="container">

        {/* ── Section Header ── */}
        <div className="d-flex align-items-end justify-content-between flex-wrap gap-3 mb-5">
          <div>
            <div className="section-label">
              <i className="bi bi-gear-fill me-2"></i>Extra Services
            </div>
            <h2 className="section-heading mb-2">
              Premium <span className="gradient-text">Business Solutions</span>
            </h2>
            <p className="section-subtext" style={{ margin: 0 }}>
              Accelerate your digital presence with our customized design, app development, and search marketing
            </p>
          </div>
          <a href="/#contact" className="btn-outline-custom" id="view-all-blog-btn" aria-label="Get custom quotation">
            Contact Us <i className="bi bi-arrow-right ms-2"></i>
          </a>
        </div>

        {/* ── Services Cards Grid ── */}
        <div className="blog-grid">
          {services.map((service) => (
            <article
              key={service.id}
              id={`blog-card-${service.id}`}
              className="blog-card"
              aria-label={service.title}
            >
              {/* Cover Image */}
              <div className="blog-card-img-wrap">
                <img
                  src={service.image.src || service.image}
                  alt={service.imageAlt}
                  className="blog-card-img"
                  loading="lazy"
                />
                {/* Category badge floated over image */}
                <span
                  className="blog-img-badge"
                  style={{ background: service.categoryColor }}
                >
                  {service.category}
                </span>
              </div>

              {/* Card Body */}
              <div className="blog-card-body">

                {/* Meta row: duration • team */}
                <div className="blog-meta-row">
                  <span className="blog-meta-date">
                    <i className="bi bi-calendar3 me-1"></i>
                    {service.date}
                  </span>
                  <span className="blog-meta-sep">•</span>
                  <span className="blog-meta-author">
                    <span
                      className="blog-author-initials"
                      style={{ background: service.authorAvatarColor }}
                      aria-hidden="true"
                    >
                      {service.authorInitials}
                    </span>
                    By {service.author}
                  </span>
                </div>

                {/* Category tag */}
                <span
                  className="blog-category-tag"
                  style={{ color: service.categoryColor, background: service.categoryBg }}
                >
                  <i className="bi bi-code-slash me-1"></i>
                  {service.category}
                </span>

                {/* Title */}
                <h3 className="blog-title">{service.title}</h3>

                {/* Excerpt */}
                <p className="blog-excerpt">{service.excerpt}</p>

                {/* Footer */}
                <div className="blog-card-footer">
                  <span className="blog-read-time">
                    <i className="bi bi-currency-dollar me-1"></i>
                    {service.readTime}
                  </span>
                  <a
                    href="/#contact"
                    className="blog-read-link"
                    id={`blog-read-${service.id}`}
                    aria-label={`Get quote for: ${service.title}`}
                  >
                    Get Quote <i className="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>

              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BlogSection;
