import EmployerHomeView from '@/views/EmployerHome/EmployerHomeView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employer Portal & Talent Search | JobNest Premium',
  description: 'Hire top tech and corporate talent faster with JobNest. Post up to 3 free jobs, search 10M+ resumes, and manage applicants seamlessly.',
};

export default function EmployerHomePage() {
  return <EmployerHomeView />;
}
