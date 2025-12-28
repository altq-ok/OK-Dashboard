'use client';

import { ThemeProvider } from 'next-themes';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        {children}
        <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  );
}
