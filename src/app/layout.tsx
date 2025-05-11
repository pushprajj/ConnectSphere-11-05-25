// src/app/layout.tsx
'use client';
import React from 'react';

import { SessionProvider, useSession } from 'next-auth/react';
import TopNavbar from '@/components/TopNavbar';
import DashboardNavbar from '@/components/DashboardNavbar';
import { PageWrapper } from '@/components/PageWrapper';
import { AuthProvider } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import './globals.css';

function RootContent({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();
  const isDashboardOrProducts = pathname.startsWith('/dashboard') || pathname.startsWith('/products');

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      {status === 'authenticated' && <TopNavbar />}
      {status === 'authenticated' && isDashboardOrProducts && <DashboardNavbar />}
      <main className={status === 'authenticated' && isDashboardOrProducts ? 'pt-24 mt-6' : status === 'authenticated' ? 'pt-12' : ''}>
        <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
          <PageWrapper>{children}</PageWrapper>
        </div>
      </main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const enforceScroll = () => {
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflowY = 'scroll';
        document.body.style.overflow = '';
      }
      if (document.documentElement.style.overflow === 'hidden') {
        document.documentElement.style.overflowY = 'scroll';
        document.documentElement.style.overflow = '';
      }
    };
    const observer = new MutationObserver(() => enforceScroll());
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    enforceScroll();
    return () => observer.disconnect();
  }, []);

  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <AuthProvider>
            <RootContent>{children}</RootContent>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}