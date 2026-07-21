import React from 'react';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';

export default function MessagesPage() {
  return (
    <div className="dashboard-content-wrapper">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Messages' }]} className="mb-3" />
      <h2 className="mb-4">Messages</h2>
      <div className="dash-user-card text-center p-5">
        <i className="bi bi-chat-dots-fill mb-3 text-secondary" style={{ fontSize: '3rem' }}></i>
        <h4>Inbox & Messages</h4>
        <p className="text-secondary">This section is currently a static placeholder and will be built out soon.</p>
      </div>
    </div>
  );
}
