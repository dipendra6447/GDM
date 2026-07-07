import Page from '@/views/JobListing/JobListing';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Jobs | JobNest',
};

export default function JobListingPage() {
  return <Page />;
}
