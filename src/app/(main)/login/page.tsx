import { AuthPage } from '@/components/Auth/AuthPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login Account | JobNest',
  description: 'Sign in to your JobNest account to access job applications and recruit talent.',
};

export default function LoginPage() {
  return <AuthPage initialIsLogin={true} />;
}
