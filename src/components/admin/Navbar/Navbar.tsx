'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MdMenu, MdSearch, MdNotificationsNone, MdPerson, MdSettings, MdLogout, MdKeyboardArrowDown
} from 'react-icons/md';
import { slideDown } from '@/lib/animations';
import './Navbar.css';

interface NavbarProps {
  collapsed: boolean;
  onToggleSidebar: () => void;
}

export default function Navbar({ collapsed, onToggleSidebar }: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const navbarRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (navbarRef.current) slideDown(navbarRef.current);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header ref={navbarRef} className={`admin-navbar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="navbar-left">
        <button className="navbar-toggle-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <MdMenu />
        </button>
        <div className="navbar-search">
          <MdSearch className="navbar-search-icon" />
          <input type="text" className="form-control navbar-search-input" placeholder="Search anything..." aria-label="Search" />
        </div>
      </div>
      <div className="navbar-right">
        <button className="navbar-icon-btn" aria-label="Notifications">
          <MdNotificationsNone />
          <span className="navbar-icon-badge" />
        </button>
        <div className="navbar-profile" ref={dropdownRef}>
          <button className="navbar-profile-trigger" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}>
            <div className="navbar-profile-avatar">A</div>
            <div className="navbar-profile-info">
              <div className="navbar-profile-name">Admin</div>
              <div className="navbar-profile-email">admin@example.com</div>
            </div>
            <MdKeyboardArrowDown className={`navbar-profile-arrow ${profileOpen ? 'open' : ''}`} />
          </button>
          <div className={`navbar-profile-dropdown ${profileOpen ? 'show' : ''}`}>
            <div className="navbar-profile-dropdown-header">
              <div className="navbar-profile-dropdown-name">Admin</div>
              <div className="navbar-profile-dropdown-email">admin@example.com</div>
            </div>
            <Link href="/profile" className="navbar-profile-dropdown-item" onClick={() => setProfileOpen(false)}>
              <MdPerson /> Profile
            </Link>
            <Link href="/admin/settings/config" className="navbar-profile-dropdown-item" onClick={() => setProfileOpen(false)}>
              <MdSettings /> Settings
            </Link>
            <div className="navbar-profile-dropdown-divider" />
            <button className="navbar-profile-dropdown-item danger" onClick={handleLogout}>
              <MdLogout /> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
