import Page from '@/views/Marketplace/Marketplace';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'JobNest Marketplace — Find Gigs & Services',
};

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem 0', textAlign: 'center' }}>Loading Marketplace...</div>}>
      <Page />
    </Suspense>
  );
}
