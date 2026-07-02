"use client";
import React from 'react';
import './BrowseJobs.css';
import browseBanner from '../../assets/images/browse_jobs_banner.png';

/* ── Data ── */
const sections = [
  {
    id: 'dev',
    heading: 'Software Development',
    subheading: 'Engineering & Architecture',
    roles: [
      '.NET Developer', 'Backend Engineer', 'Cloud Architect',
      'DevOps Engineer', 'Full Stack Developer', 'Game Developer',
      'iOS Developer', 'Mobile Developer', 'QA Engineer',
      'Software Engineer', 'Solution Architect', 'Systems Admin',
    ],
  },
  {
    id: 'data',
    heading: 'Data, AI & ML',
    subheading: 'Analytics & Intelligence',
    roles: [
      'AI Engineer', 'Bioinformatics Analyst', 'Business Analyst',
      'Data Analyst', 'Data Engineer', 'Data Scientist',
      'Database Admin', 'ETL Developer', 'ML Engineer',
      'Power BI Developer', 'Research Scientist', 'Statistician',
    ],
  },
  {
    id: 'design',
    heading: 'Design & Creative',
    subheading: 'UX, Brand & Multimedia',
    roles: [
      'Brand Designer', 'Content Creator', 'Graphic Designer',
      'Illustrator', 'Motion Designer', 'Product Designer',
      'UX Researcher', 'UX/UI Designer', 'Video Editor',
      'Visual Designer', 'Web Designer', '3D Artist',
    ],
  },
  {
    id: 'business',
    heading: 'Business & Management',
    subheading: 'Strategy, Finance & Ops',
    roles: [
      'Account Manager', 'Business Development', 'CFO',
      'COO', 'Finance Manager', 'Growth Manager',
      'Operations Manager', 'Product Manager', 'Project Manager',
      'Risk Analyst', 'Sales Manager', 'Scrum Master',
    ],
  },
  {
    id: 'marketing',
    heading: 'Marketing & Sales',
    subheading: 'Digital Growth & Outreach',
    roles: [
      'Affiliate Marketer', 'Brand Strategist', 'Copywriter',
      'CRM Specialist', 'Digital Marketer', 'Email Marketer',
      'Growth Hacker', 'PPC Specialist', 'PR Manager',
      'SEO Specialist', 'Social Media Manager', 'Sales Rep',
    ],
  },
  {
    id: 'it',
    heading: 'IT & Networking',
    subheading: 'Infrastructure & Security',
    roles: [
      'Cybersecurity Analyst', 'IT Help Desk', 'IT Manager',
      'IT Support', 'Network Administrator', 'Network Engineer',
      'Penetration Tester', 'Security Engineer', 'Site Reliability Eng.',
      'Systems Engineer', 'Tech Lead', 'VoIP Engineer',
    ],
  },
];

const companies = [
  'Google', 'Amazon', 'Microsoft', 'Apple', 'Meta', 'Netflix',
  'Salesforce', 'Adobe', 'Atlassian', 'Shopify', 'Stripe', 'Figma',
  'Airbnb', 'Uber', 'Lyft', 'Twitter / X', 'LinkedIn', 'Zoom',
  'Slack', 'Notion', 'HubSpot', 'Dropbox', 'Cloudflare', 'GitLab',
];

const BrowseJobs: React.FC = () => {
  return (
    <section className="browse-section" id="browse" aria-label="Browse jobs and top companies">

      {/* ── Hero Banner ── */}
      <div className="browse-banner-wrap">
        <img
          src={browseBanner.src}
          alt="Global job opportunities cityscape"
          className="browse-banner-img"
          loading="lazy"
        />
        <div className="browse-banner-overlay" aria-hidden="true" />
        <div className="browse-banner-content container">
          <div className="section-label browse-banner-label">
            <i className="bi bi-search me-2"></i>Explore Opportunities
          </div>
          <h2 className="browse-banner-title">
            Browse Jobs &amp; <span>Top Companies</span>
          </h2>
          <p className="browse-banner-sub">
            Explore thousands of roles across every industry — from startups to Fortune 500s.
          </p>
        </div>
      </div>

      <div className="container browse-body">

        {/* ── Job Role Columns ── */}
        <div className="browse-columns-grid">
          {sections.map((sec) => (
            <div key={sec.id} className="browse-col" id={`browse-${sec.id}`}>
              <h3 className="browse-col-heading">{sec.heading}</h3>
              <p className="browse-col-sub">{sec.subheading}</p>
              <ul className="browse-role-list" aria-label={sec.heading}>
                {sec.roles.map((role) => (
                  <li key={role}>
                    <a
                      href="#"
                      className="browse-role-link"
                      id={`role-${role.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      aria-label={`Browse ${role} jobs`}
                    >
                      <i className="bi bi-arrow-right-short browse-role-arrow"></i>
                      {role}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Divider ── */}
        <div className="browse-divider" aria-hidden="true" />


      </div>
    </section>
  );
};

export default BrowseJobs;
