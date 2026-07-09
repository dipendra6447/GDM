'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MdDashboard, MdSettings, MdPeople, MdListAlt, MdKeyboardArrowDown
} from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi2';
import { dropdownToggle } from '@/lib/animations';
import './Sidebar.css';

const menuItems = [
  { label: 'Main', items: [{ name: 'Dashboard', icon: MdDashboard, path: '/admin' }] },
  { label: 'Users & Profiles', items: [
      { name: 'All Users', icon: MdPeople, path: '/admin/users' },
      { name: 'Employers', icon: MdPeople, path: '/admin/employers' },
      { name: 'Businesses', icon: MdPeople, path: '/admin/businesses' },
  ]},
  { label: 'Categories', items: [
      { name: 'Job Categories', icon: MdListAlt, path: '/admin/job-categories' },
      { name: 'Business Categories', icon: MdListAlt, path: '/admin/business-categories' },
  ]},
  { label: 'Platform Management', items: [
      { name: 'Jobs', icon: MdListAlt, path: '/admin/jobs' },
      { name: 'Subscriptions', icon: MdSettings, path: '/admin/subscriptions' },
  ]},
  { label: 'Moderation', items: [
      { name: 'Promotions', icon: MdListAlt, path: '/admin/promotions' },
  ]},
  { label: 'System', items: [
      { name: 'Global Config', icon: MdSettings, path: '/admin/settings/config' },
  ]},
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const submenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const arrowRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const pathname = usePathname();

  useEffect(() => {
    const newOpen: Record<string, boolean> = {};
    menuItems.forEach((group) => {
      group.items.forEach((item) => {
        if ((item as any).children) {
          const isChildActive = (item as any).children.some((child: any) => pathname === child.path);
          if (isChildActive) newOpen[item.name] = true;
        }
      });
    });
    setOpenDropdowns((prev) => ({ ...prev, ...newOpen }));
  }, [pathname]);

  const handleDropdownToggle = useCallback((name: string) => {
    setOpenDropdowns((prev) => {
      const isOpen = !prev[name];
      const submenu = submenuRefs.current[name];
      const arrow = arrowRefs.current[name];
      dropdownToggle(submenu || null, arrow || null, isOpen);
      return { ...prev, [name]: isOpen };
    });
  }, []);

  const isParentActive = (item: any) => {
    if (!item.children) return false;
    return item.children.some((child: any) => pathname === child.path);
  };

  return (
    <>
      <div className={`sidebar-overlay ${mobileOpen ? 'show' : ''}`} onClick={onMobileClose} aria-hidden="true" />
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><HiSparkles /></div>
          <span className="sidebar-logo-text">AdminPanel</span>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((group) => (
            <div key={group.label}>
              <div className="sidebar-label">{group.label}</div>
              {group.items.map((item) => (
                <div key={item.name} className="sidebar-menu-item">
                  {(item as any).children ? (
                    <>
                      <button
                        className={`sidebar-menu-link ${isParentActive(item) ? 'active' : ''}`}
                        onClick={() => handleDropdownToggle(item.name)}
                        aria-expanded={!!openDropdowns[item.name]}
                      >
                        <span className="sidebar-menu-icon"><item.icon /></span>
                        <span className="sidebar-menu-text">{item.name}</span>
                        <span className="sidebar-arrow" ref={(el) => { arrowRefs.current[item.name] = el; }}><MdKeyboardArrowDown /></span>
                      </button>
                      <div
                        className="sidebar-submenu"
                        ref={(el) => { submenuRefs.current[item.name] = el; }}
                        style={{ display: openDropdowns[item.name] ? 'block' : 'none', height: openDropdowns[item.name] ? 'auto' : 0 }}
                      >
                        {(item as any).children.map((child: any) => (
                          <Link key={child.path} href={child.path} className={`sidebar-submenu-link ${pathname === child.path ? 'active' : ''}`} onClick={onMobileClose}>
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link href={item.path} className={`sidebar-menu-link ${pathname === item.path ? 'active' : ''}`} onClick={onMobileClose}>
                      <span className="sidebar-menu-icon"><item.icon /></span>
                      <span className="sidebar-menu-text">{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
