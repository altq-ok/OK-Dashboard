'use client';

import { ThemeProvider } from 'next-themes';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SidebarProvider defaultOpen={false}>
            {children}
            <Toaster />
          </SidebarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </NuqsAdapter>
  );
}
