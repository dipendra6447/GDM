import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | JobNest',
};

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--color-bg-primary, #0f172a)', color: '#f8fafc', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 900, background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 600 }}>Page Not Found</h2>
      <p style={{ color: '#94a3b8', marginBottom: '2.5rem', maxWidth: '400px' }}>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
      <Link href="/" style={{ padding: '0.875rem 2rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem', transition: 'all 0.3s ease' }}>
        Return Home
      </Link>
    </div>
  );
}
