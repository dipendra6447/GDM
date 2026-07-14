import Page from '@/views/JobDetails/JobDetails';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Details | JobNest',
};

export default async function JobDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Page slug={slug} />;
}
