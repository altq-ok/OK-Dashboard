'use client';

import { ThemeProvider } from 'next-themes';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SidebarProvider defaultOpen={false}>
          {children}
          <Toaster />
        </SidebarProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
}
