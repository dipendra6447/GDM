"use client";
import React from 'react';
import Link from 'next/link';
import './JobDetailsBreadcrumb.css';

const JobDetailsBreadcrumb: React.FC = () => (
  <nav className="jdb-nav" aria-label="breadcrumb">
    <Link href="/jobs" className="jdb-back-link" id="jdb-back-to-jobs">
      <i className="bi bi-arrow-left" /> Back to Jobs
    </Link>
    
    <ol className="jdb-crumb-list">
      <li><Link href="/" className="jdb-crumb-link">Jobs</Link></li>
      <li className="jdb-crumb-sep">/</li>
      <li><Link href="/jobs" className="jdb-crumb-link">Marketing</Link></li>
      <li className="jdb-crumb-sep">/</li>
      <li className="jdb-crumb-current" aria-current="page">Senior Product Marketing Manager</li>
    </ol>
  </nav>
);

export default JobDetailsBreadcrumb;
