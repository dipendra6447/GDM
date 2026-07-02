import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/variables.css';
import '@/styles/global.css';
import '@/styles/bootstrap-overrides.css';
import '@/styles/responsive.css';
import '../App.css';

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'JobNest | Premium Job Portal - Find Your Better Job',
  description: 'JobNest - Premium Job Portal. Find your dream job or hire top talent with our enterprise-grade recruitment platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      </head>
      <body>
        <div className="app">
          {children}
        </div>
      </body>
    </html>
  );
}