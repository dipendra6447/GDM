import { AuthPage } from '@/components/Auth/AuthPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register Account | JobNest',
  description: 'Create your JobNest account to access job applications, employer recruitment tools, and business promotion features.',
};

export default function RegisterPage() {
  return <AuthPage initialIsLogin={false} />;
}
