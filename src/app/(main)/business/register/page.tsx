import BusinessRegister from '@/pages/BusinessRegister/BusinessRegister';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register Business — JobNest',
};

export default function BusinessRegisterPage() {
  return <BusinessRegister />;
}
