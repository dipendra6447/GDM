'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import JobCard, { JobCardData } from './JobCard';
import './TrendingJobs.css';

const BUTTON_PALETTE = ['#4f1eeb', '#ff7a00', '#2034ff', '#00904a', '#2034ff'];

const MOCKUP_FALLBACK_JOBS: JobCardData[] = [
  {
    id: 'mock-1',
    slug: 'full-stack-developer',
    title: 'Full Stack Developer',
    companyName: 'TechNova Solutions',
    location: 'New York, NY • Remote',
    salaryRange: '$80,000 - $110,000',
    jobType: 'Full Time',
    workMode: 'Remote',
    category: 'Technology',
    tags: [],
    iconBg: '#4f1eeb',
    iconColor: '#ffffff',
    buttonColor: '#4f1eeb',
    iconClass: 'bi-code-slash',
    postedTime: '2h ago',
    applicantCount: 125,
    isVerified: true,
    isHot: true,
  },
  {
    id: 'mock-2',
    slug: 'marketing-manager',
    title: 'Marketing Manager',
    companyName: 'Brightwave Marketing',
    location: 'San Francisco, CA - Hybrid',
    salaryRange: '$70,000 - $95,000',
    jobType: 'Full Time',
    workMode: 'Hybrid',
    category: 'Marketing',
    tags: [],
    iconBg: '#ff7a00',
    iconColor: '#ffffff',
    buttonColor: '#ff7a00',
    iconClass: 'bi-megaphone-fill',
    postedTime: '4h ago',
    applicantCount: 98,
    isVerified: true,
    isHot: true,
  },
  {
    id: 'mock-3',
    slug: 'ui-ux-designer',
    title: 'UI/UX Designer',
    companyName: 'DesignHub',
    location: 'Austin, TX • Remote',
    salaryRange: '$65,000 - $85,000',
    jobType: 'Full Time',
    workMode: 'Remote',
    category: 'Design',
    tags: [],
    iconBg: '#2034ff',
    iconColor: '#ffffff',
    buttonColor: '#2034ff',
    iconClass: 'bi-layout-text-window-reverse',
    postedTime: '6h ago',
    applicantCount: 76,
    isVerified: true,
    isHot: true,
  },
  {
    id: 'mock-4',
    slug: 'sales-executive',
    title: 'Sales Executive',
    companyName: 'GrowthAccel',
    location: 'Chicago, IL - On-site',
    salaryRange: '$50,000 - $70,000',
    jobType: 'Full Time',
    workMode: 'On-site',
    category: 'Sales',
    tags: [],
    iconBg: '#00904a',
    iconColor: '#ffffff',
    buttonColor: '#00904a',
    iconClass: 'bi-shop',
    postedTime: '8h ago',
    applicantCount: 64,
    isVerified: true,
    isHot: true,
  },
  {
    id: 'mock-5',
    slug: 'backend-developer',
    title: 'Backend Developer',
    companyName: 'CodeCrafters',
    location: 'Seattle, WA • Remote',
    salaryRange: '$90,000 - $120,000',
    jobType: 'Full Time',
    workMode: 'Remote',
    category: 'Technology',
    tags: [],
    iconBg: '#2034ff',
    iconColor: '#ffffff',
    buttonColor: '#2034ff',
    iconClass: 'bi-building',
    postedTime: '10h ago',
    applicantCount: 53,
    isVerified: true,
    isHot: true,
  },
];

const TrendingJobs: React.FC = () => {
  const [jobsList, setJobsList] = useState<JobCardData[]>(MOCKUP_FALLBACK_JOBS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs?limit=10');
        if (res.ok) {
          const json = await res.json().catch(() => null);
          if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mapped: JobCardData[] = json.data.map((j: any, idx: number) => ({
              id: j.id,
              slug: j.slug || j.id,
              title: j.title,
              companyName: j.companyName || 'Verified Partner',
              location: j.location || 'Remote',
              salaryRange: j.salaryRange || 'Competitive',
              jobType: j.jobType || 'Full Time',
              workMode: j.workMode || 'Remote',
              category: j.category || 'Technology',
              tags: j.skills ? j.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
              iconBg: idx % 5 === 0 ? '#4f1eeb' : idx % 5 === 1 ? '#ff7a00' : idx % 5 === 2 ? '#2034ff' : idx % 5 === 3 ? '#00904a' : '#2034ff',
              iconColor: '#ffffff',
              buttonColor: idx % 5 === 0 ? '#4f1eeb' : idx % 5 === 1 ? '#ff7a00' : idx % 5 === 2 ? '#2034ff' : idx % 5 === 3 ? '#00904a' : '#2034ff',
              iconClass: idx % 5 === 0 ? 'bi-code-slash' : idx % 5 === 1 ? 'bi-megaphone-fill' : idx % 5 === 2 ? 'bi-layout-text-window-reverse' : idx % 5 === 3 ? 'bi-shop' : 'bi-building',
              postedTime: 'Recent',
              applicantCount: 42 + idx * 7,
              isVerified: true,
              isHot: true,
            }));

            // Blend real DB jobs with mockup defaults to guarantee 5 top-quality uniform cards
            setJobsList(mapped.length >= 5 ? mapped : [...mapped, ...MOCKUP_FALLBACK_JOBS.slice(mapped.length)]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch jobs for trending section:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <section className="trending-section" id="trending" aria-label="Most trending jobs">
      <div className="container">
        {/* Header Row */}
        <div className="d-flex align-items-end justify-content-between flex-wrap gap-3 mb-4">
          <div>
            <div className="trending-top-pill">
              <span>🔥</span> Most Trending Jobs
            </div>
            <h2 className="trending-main-title">
              Top <span className="highlight-text">Opportunities</span> People Are Applying For
            </h2>
          </div>

          <Link href="/jobs" className="view-all-jobs-link">
            View All Jobs <span className="arrow-right">→</span>
          </Link>
        </div>

        {/* Job Cards Grid */}
        <div className="trending-jobs-grid">
          {jobsList.slice(0, 5).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingJobs;
