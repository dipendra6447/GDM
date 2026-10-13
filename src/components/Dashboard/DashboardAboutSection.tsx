"use client";
import React from 'react';
import Link from 'next/link';

interface DashboardAboutSectionProps {
  role?: 1 | 2 | 3;
  user?: any;
}

export default function DashboardAboutSection({ role = 1, user }: DashboardAboutSectionProps) {
  const isEmployer = role === 2;
  const isBusiness = role === 3;

  const aboutTitle = isEmployer ? 'About Company' : isBusiness ? 'About Business' : 'About Me';
  const skillsTitle = isEmployer ? 'Hiring Specialities' : isBusiness ? 'Featured Services & Specialities' : 'Featured Skills';
  const expTitle = isEmployer ? 'Company Milestones & Offices' : isBusiness ? 'Business Services & Locations' : 'Experience';

  const bioText = isEmployer
    ? "Tech Solutions Inc. is an enterprise engineering and digital transformation leader founded in Dayton, OH. We connect visionary engineers and tech leaders to build mission-critical products for global organizations."
    : isBusiness
    ? "Allen Auto Repair is Dayton's premier family-owned automotive diagnostic and repair center, serving the Miami Valley for over 10 years with certified mechanics, upfront pricing, and trusted warranties."
    : "I'm an entrepreneur and web developer with a passion for creating opportunities. I founded GoDiscoverMe to help people find work, grow their businesses, and connect with the right people. I believe in using technology to make opportunity more accessible for everyone.";

  const details = isEmployer
    ? [
        { icon: 'bi-building', text: 'Tech Solutions Inc.' },
        { icon: 'bi-envelope', text: user?.email || 'careers@techsolutions.com' },
        { icon: 'bi-geo-alt', text: 'Dayton, OH (HQ)' },
        { icon: 'bi-telephone', text: '(937) 555-7890' },
        { icon: 'bi-people', text: '50 - 250 Employees' },
        { icon: 'bi-calendar-check', text: 'Founded March 2018' },
        { icon: 'bi-globe', text: 'https://techsolutions.com' },
        { icon: 'bi-check2-circle', text: 'Actively Hiring' },
      ]
    : isBusiness
    ? [
        { icon: 'bi-shop', text: 'Allen Auto Repair' },
        { icon: 'bi-envelope', text: user?.email || 'service@allenautorepair.com' },
        { icon: 'bi-geo-alt', text: '1240 N Main St, Dayton, OH' },
        { icon: 'bi-telephone', text: '(937) 555-4321' },
        { icon: 'bi-award', text: 'ASE Certified Technicians' },
        { icon: 'bi-calendar-check', text: 'In Business Since 2014' },
        { icon: 'bi-globe', text: 'https://allenautorepair.com' },
        { icon: 'bi-check2-circle', text: 'Verified Business' },
      ]
    : [
        { icon: 'bi-briefcase', text: 'Founder & CEO at GoDiscoverMe' },
        { icon: 'bi-envelope', text: user?.email || 'michaelsargent@gmail.com' },
        { icon: 'bi-geo-alt', text: 'Dayton, OH' },
        { icon: 'bi-telephone', text: '(937) 555-1234' },
        { icon: 'bi-mortarboard', text: 'Some College' },
        { icon: 'bi-calendar-check', text: 'Joined September 2024' },
        { icon: 'bi-globe', text: 'https://godiscoverme.com' },
        { icon: 'bi-check2-circle', text: 'Open to Opportunities' },
      ];

  const skillTags = isEmployer
    ? ['Full-Stack Engineering', 'React & Node.js', 'Cloud Architecture', 'Product Management', 'DevOps & CI/CD', 'UI/UX Design', 'QA Automation', 'Technical Leadership', 'Data Engineering', 'Agile & Scrum']
    : isBusiness
    ? ['Engine Diagnostics', 'Brake Systems', 'Oil & Filter Changes', 'Tire Rotation & Balance', 'Transmission Service', 'A/C & Heating Repair', 'Battery Replacement', 'Wheel Alignment', 'Suspension & Steering', 'Preventative Maintenance']
    : ['Web Development', 'Business Strategy', 'Project Management', 'Marketing', 'Leadership', 'UI/UX Design', 'SEO', 'Digital Marketing', 'Networking', 'Client Relations'];

  const addSkillLabel = isEmployer ? '+ Add Requirement' : isBusiness ? '+ Add Service' : '+ Add Skill';

  const experiences = isEmployer
    ? [
        {
          role: 'Head of Engineering Talent',
          org: 'Tech Solutions Inc. • Full-time',
          date: '2021 - Present • 3 yrs 5 mos',
          desc: 'Expanded tech team from 25 to 110 engineers across full-stack, cloud infrastructure, and mobile engineering.',
        },
        {
          role: 'Senior Technical Recruiter',
          org: 'Dayton Innovation Lab • Full-time',
          date: '2018 - 2021 • 3 yrs',
          desc: 'Led candidate screening, sourcing strategies, and hiring workflows for venture-backed regional startups.',
        },
      ]
    : isBusiness
    ? [
        {
          role: 'Master Automotive Service Facility',
          org: 'Allen Auto Repair • Dayton, OH',
          date: '2014 - Present • 10 yrs',
          desc: 'Over 15,000 satisfied regional customers with 4.9-star average customer ratings and ASE-certified technicians.',
        },
        {
          role: 'Certified Fleet Maintenance Partner',
          org: 'Miami Valley Commercial Fleet • Partner',
          date: '2019 - Present • 5 yrs',
          desc: 'Exclusive automotive diagnostic and repair contractor for local service fleets and commercial vehicles.',
        },
      ]
    : [
        {
          role: 'Founder & CEO',
          org: 'GoDiscoverMe • Self-employed',
          date: 'Sep 2024 - Present • 2 mos',
          desc: 'Architected and launched the GoDiscoverMe platform to connect job seekers, employers, and businesses seamlessly.',
        },
        {
          role: 'Senior Web Developer & Consultant',
          org: 'Freelance & Agency • Full-time',
          date: 'Jan 2020 - Sep 2024 • 4 yrs 9 mos',
          desc: 'Built scalable web applications, modernized SaaS customer dashboards, and managed end-to-end product deliveries.',
        },
      ];

  const addExpLabel = isEmployer ? '+ Add Location' : isBusiness ? '+ Add Service' : '+ Add Experience';

  return (
    <div className="dash-about-wrapper">
      {/* 1. About Me / Company / Business Card */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h4 className="dash-card-title">{aboutTitle}</h4>
          <Link href={`/profile?tab=${role}`} className="dash-card-edit-btn" id="dash-about-edit-btn">
            <i className="bi bi-pencil" /> Edit
          </Link>
        </div>

        <p className="dash-bio-text" style={{ fontSize: '13px' }}>
          {bioText}
        </p>

        <div className="dash-details-grid">
          {details.map((d, i) => (
            <div key={i} className="dash-detail-item">
              <i className={`bi ${d.icon}`} />
              <span className="text-truncate" title={d.text}>{d.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Featured Skills Card */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h4 className="dash-card-title">{skillsTitle}</h4>
          <Link href={`/profile?tab=${role}`} className="dash-card-edit-btn" id="dash-skills-edit-btn">
            <i className="bi bi-pencil" /> Edit
          </Link>
        </div>

        <div className="dash-tags-row">
          {skillTags.map((tag) => (
            <span key={tag} className="dash-tag-pill">
              {tag}
            </span>
          ))}
          <Link href={`/profile?tab=${role}`} className="dash-tag-pill add-btn">
            {addSkillLabel}
          </Link>
        </div>
      </div>

      {/* 3. Experience Card */}
      <div className="dash-card">
        <div className="dash-card-header">
          <h4 className="dash-card-title">{expTitle}</h4>
          <Link href={`/profile?tab=${role}`} className="dash-card-edit-btn" id="dash-experience-add-btn">
            <i className="bi bi-plus-lg" /> {addExpLabel}
          </Link>
        </div>

        <div className="dash-experience-list">
          {experiences.map((exp, idx) => (
            <div key={idx} className="dash-experience-item mb-3 pb-3 border-bottom border-secondary border-opacity-10">
              <div className="d-flex align-items-center gap-2 mb-1">
                <div className="dash-metric-icon-box icon-box-blue" style={{ width: '30px', height: '30px', fontSize: '13px' }}>
                  <i className="bi bi-briefcase-fill" />
                </div>
                <div>
                  <h5 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#ffffff' }}>{exp.role}</h5>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{exp.org}</div>
                </div>
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '6px', paddingLeft: '38px' }}>
                {exp.date}
              </div>
              <p style={{ fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.45', margin: 0, paddingLeft: '38px' }}>
                {exp.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

