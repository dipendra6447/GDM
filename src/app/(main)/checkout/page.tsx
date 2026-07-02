import Page from '@/pages/Checkout/Checkout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JobNest — Checkout',
  description: 'Complete your subscription purchase with secure payment options.',
};

export default function CheckoutPage() {
  return <Page />;
}
