import Page from '@/views/JobListing/JobListing';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Find Jobs | JobNest',
};

export default function JobListingPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem 0', textAlign: 'center' }}>Loading Jobs...</div>}>
      <Page />
    </Suspense>
  );
}
