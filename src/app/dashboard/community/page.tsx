import React from 'react';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';

export default function CommunityPage() {
  return (
    <div className="dashboard-content-wrapper">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Community' }]} className="mb-3" />
      <h2 className="mb-4">Community</h2>
      <div className="dash-user-card text-center p-5">
        <i className="bi bi-people-fill mb-3 text-secondary" style={{ fontSize: '3rem' }}></i>
        <h4>Community Forum</h4>
        <p className="text-secondary">This section is currently a static placeholder and will be built out soon.</p>
      </div>
    </div>
  );
}
