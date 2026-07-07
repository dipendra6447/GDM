import PostJob from '@/pages/Employer/PostJob';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post a Job | JobNest — Employer Dashboard',
  description: 'Post a new job listing on JobNest and reach thousands of qualified candidates.',
};

export default function PostJobPage() {
  return <PostJob />;
}
