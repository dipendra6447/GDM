import { Suspense } from 'react';
import Page from '@/pages/Cart/Cart';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JobNest — Your Cart',
  description: 'Review your selected subscription plan and proceed to checkout.',
};

export default function CartPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0A0A0A' }} />}>
      <Page />
    </Suspense>
  );
}
