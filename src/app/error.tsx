"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--color-bg-primary, #0f172a)', color: '#f8fafc', textAlign: 'center', padding: '2rem' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 700 }}>Something went wrong!</h2>
      <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>We apologize for the inconvenience. Please try again.</p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => reset()}
          style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
        >
          Try again
        </button>
        <Link href="/" style={{ padding: '0.75rem 1.5rem', backgroundColor: 'transparent', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
