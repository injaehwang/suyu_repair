'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';

import { GlobalAlertProvider } from '@/components/providers/global-alert-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <GlobalAlertProvider>
                    {children}
                </GlobalAlertProvider>
            </QueryClientProvider>
        </SessionProvider>
    );
}
