import type { Metadata } from 'next';
import './globals.css';

import { Providers } from '@/components/dashboard/providers';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { Header } from '@/components/dashboard/header';

export const metadata: Metadata = {
  title: 'OK-Dashboard',
  description: 'Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="flex h-screen w-full">
            {/* Sidebar (left) */}
            <AppSidebar />

            {/* Main area (header and content) */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-auto bg-background">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
