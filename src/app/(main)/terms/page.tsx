import TermsView from '@/views/Terms/Terms';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | JobNest',
  description: 'Read the Terms and Conditions governing your use of JobNest subscription plans and services.',
};

export default function TermsPage() {
  return <TermsView />;
}
