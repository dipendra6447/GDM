import SeekerHomeView from '@/views/SeekerHome/SeekerHomeView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Seeker Portal & Home | JobNest',
  description: 'Explore trending jobs, recommended career opportunities, and manage your applications on JobNest.',
};

export default function SeekerHomePage() {
  return <SeekerHomeView />;
}
