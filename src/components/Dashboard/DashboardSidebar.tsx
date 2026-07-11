"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const DashboardSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isEmployer = user?.roles?.includes(2);

  const navItems = [
    { label: 'Dashboard', icon: 'bi-grid-fill', href: '/dashboard' },
    ...(isEmployer ? [{ label: 'Job Post', icon: 'bi-briefcase-fill', href: '/dashboard/job-post' }] : []),
    { label: 'Applied', icon: 'bi-file-earmark-text-fill', href: '/dashboard/applied' },
    { label: 'Saved Jobs', icon: 'bi-bookmark-fill', href: '/dashboard/saved' },
    { label: 'Community', icon: 'bi-people-fill', href: '/dashboard/community' },
    { label: 'Message', icon: 'bi-chat-dots-fill', href: '/dashboard/messages' },
    { label: 'Profile Settings', icon: 'bi-person-gear', href: '/profile' },
  ];

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-logo">
        <Link href="/">
          <span className="logo-icon"><i className="bi bi-briefcase-fill"></i></span>
          <span className="logo-text">JobNest</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={logout}>
          <i className="bi bi-box-arrow-left"></i>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
