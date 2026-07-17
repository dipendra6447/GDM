import Page from '@/views/JobDetails/JobDetails';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Job Details | JobNest',
};

export default async function JobDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div style={{ padding: '4rem 0', textAlign: 'center' }}>Loading Job Details...</div>}>
      <Page slug={slug} />
    </Suspense>
  );
}
