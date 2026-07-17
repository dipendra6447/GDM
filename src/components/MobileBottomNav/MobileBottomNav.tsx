"use client";
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import './MobileBottomNav.css';

interface NavItem {
  key: string;
  label: string;
  icon: string;
  iconActive: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { key: 'home', label: 'Home', icon: 'bi-house', iconActive: 'bi-house-fill' },
  { key: 'search', label: 'Search', icon: 'bi-search', iconActive: 'bi-search' },
  { key: 'saved', label: 'Saved', icon: 'bi-bookmark', iconActive: 'bi-bookmark-fill' },
  { key: 'notifications', label: 'Alerts', icon: 'bi-bell', iconActive: 'bi-bell-fill', badge: 3 },
  { key: 'profile', label: 'Profile', icon: 'bi-person', iconActive: 'bi-person-fill' },
];

const MobileBottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();

  // Determine active item based on current pathname
  let active = 'home';
  if (pathname === '/') {
    active = 'home';
  } else if (pathname.startsWith('/jobs')) {
    active = 'search';
  } else if (pathname.startsWith('/dashboard/saved')) {
    active = 'saved';
  } else if (pathname.startsWith('/profile')) {
    active = 'profile';
  } else if (pathname.startsWith('/dashboard')) {
    active = 'notifications';
  }

  const handleNavClick = (key: string) => {
    if (key === 'home') {
      router.push('/');
    } else if (key === 'search') {
      router.push('/jobs');
    } else if (key === 'saved') {
      if (!isLoggedIn) {
        router.push('/login');
      } else {
        router.push('/dashboard/saved');
      }
    } else if (key === 'profile') {
      if (!isLoggedIn) {
        router.push('/login');
      } else {
        router.push('/profile');
      }
    } else if (key === 'notifications') {
      if (!isLoggedIn) {
        router.push('/login');
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <nav className="mp-bottom-nav" aria-label="Mobile navigation" id="mp-bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.key}
          className={`mp-bn-item ${active === item.key ? 'mp-bn-active' : ''}`}
          onClick={() => handleNavClick(item.key)}
          aria-label={item.label}
          type="button"
          id={`mp-bn-${item.key}`}
        >
          <span className="mp-bn-icon-wrap">
            <i className={`bi ${active === item.key ? item.iconActive : item.icon}`} />
            {item.badge && item.badge > 0 && (
              <span className="mp-bn-badge">{item.badge}</span>
            )}
          </span>
          <span className="mp-bn-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
