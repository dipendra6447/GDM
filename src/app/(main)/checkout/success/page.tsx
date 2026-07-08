import Page from '@/views/Checkout/Success';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JobNest — Payment Successful',
  description: 'Your payment was successful and your subscription plan is now active.',
};

export default function SuccessPage() {
  return <Page />;
}
