'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import JobCard, { JobCardData } from './JobCard';
import './TrendingJobs.css';

const BUTTON_PALETTE = ['#8b5cf6', '#10b981', '#2563eb', '#f59e0b', '#7c3aed'];

const MOCKUP_FALLBACK_JOBS: JobCardData[] = [
  {
    id: 'mock-1',
    slug: 'growth-marketing-strategist',
    title: 'Growth Marketing & Social Media Strategist',
    companyName: 'BrightMedia Creative',
    location: 'Austin, TX',
    salaryRange: '$85,000 - $105,000',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    category: 'Marketing',
    tags: ['SEO', 'Performance Marketing', 'Google Ads', 'Content Strategy'],
    iconBg: '#f3e8ff',
    iconColor: '#8b5cf6',
    buttonColor: '#8b5cf6',
    iconClass: 'bi-megaphone-fill',
    postedTime: '2h ago',
    applicantCount: 125,
    isVerified: true,
    isHot: true,
  },
  {
    id: 'mock-2',
    slug: 'backend-systems-engineer',
    title: 'Backend Systems Engineer (Go & Microservices)',
    companyName: 'CloudScale Systems',
    location: 'Seattle, WA',
    salaryRange: '$135,000 - $165,000',
    jobType: 'Full-time',
    workMode: 'Remote',
    category: 'Technology',
    tags: ['Go (Golang)', 'gRPC', 'Kafka', 'Docker', 'Kubernetes'],
    iconBg: '#dcfce7',
    iconColor: '#10b981',
    buttonColor: '#10b981',
    iconClass: 'bi-cpu-fill',
    postedTime: '4h ago',
    applicantCount: 98,
    isVerified: true,
    isHot: true,
  },
  {
    id: 'mock-3',
    slug: 'telehealth-operations-coordinator',
    title: 'Telehealth Operations & Patient Coordinator',
    companyName: 'HealthPlus Systems',
    location: 'Boston, MA',
    salaryRange: '$65,000 - $80,000',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    category: 'Healthcare',
    tags: ['EHR Management', 'Healthcare Admin', 'HIPAA Compliance'],
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
    buttonColor: '#2563eb',
    iconClass: 'bi-heart-pulse-fill',
    postedTime: '6h ago',
    applicantCount: 76,
    isVerified: true,
    isHot: true,
  },
  {
    id: 'mock-4',
    slug: 'senior-ui-ux-designer',
    title: 'Senior UI/UX Product Designer',
    companyName: 'BrightMedia Creative',
    location: 'Austin, TX',
    salaryRange: '$100,000 - $130,000',
    jobType: 'Full-time',
    workMode: 'Hybrid',
    category: 'Design',
    tags: ['Figma', 'UI/UX Design', 'Prototyping', 'Design Systems'],
    iconBg: '#fef3c7',
    iconColor: '#f59e0b',
    buttonColor: '#f59e0b',
    iconClass: 'bi-brush-fill',
    postedTime: '8h ago',
    applicantCount: 64,
    isVerified: true,
    isHot: true,
  },
  {
    id: 'mock-5',
    slug: 'financial-analyst-associate',
    title: 'Financial Analyst & Portfolio Associate',
    companyName: 'Apex Global Financial',
    location: 'New York, NY',
    salaryRange: '$110,000 - $135,000',
    jobType: 'Full-time',
    workMode: 'On-site',
    category: 'Finance',
    tags: ['Financial Modeling', 'Excel Valuation', 'SQL', 'Bloomberg'],
    iconBg: '#f3e8ff',
    iconColor: '#7c3aed',
    buttonColor: '#7c3aed',
    iconClass: 'bi-cash-coin',
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
              iconBg: idx % 4 === 0 ? '#f3e8ff' : idx % 4 === 1 ? '#dcfce7' : idx % 4 === 2 ? '#dbeafe' : '#fef3c7',
              iconColor: BUTTON_PALETTE[idx % BUTTON_PALETTE.length],
              buttonColor: BUTTON_PALETTE[idx % BUTTON_PALETTE.length],
              iconClass: idx % 3 === 0 ? 'bi-code-slash' : idx % 3 === 1 ? 'bi-megaphone' : 'bi-brush',
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
            <h2 className="trending-main-title">Top Opportunities People Are Applying For</h2>
          </div>

          <Link href="/jobs" className="view-all-jobs-link">
            View All Jobs <i className="bi bi-arrow-right"></i>
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
