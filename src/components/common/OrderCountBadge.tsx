'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getOrders } from '@/api/orders';
import { useSession } from 'next-auth/react';
import { useSSE } from '@/hooks/use-sse';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface OrderCountBadgeProps {
    className?: string;
}

export default function OrderCountBadge({ className }: OrderCountBadgeProps) {
    const { data: session, status } = useSession();
    const queryClient = useQueryClient();
    const [count, setCount] = useState(0);

    // SSE Integration for real-time updates
    useSSE((event) => {
        // Invalidate orders on any update
        queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    const { data: orders } = useQuery({
        queryKey: ['orders', session?.user?.email],
        queryFn: () => getOrders({ userEmail: session?.user?.email }),
        enabled: status === 'authenticated' && !!session?.user?.email,
        staleTime: 1000 * 60 * 5, // 5 minutes (SSE will invalidate)
    });

    // Update count when orders change
    useEffect(() => {
        if (orders) {
            const activeCount = orders.filter(o =>
                !['COMPLETED', 'CANCELLED', 'RETURNED'].includes(o.status)
            ).length;
            setCount(activeCount);
        }
    }, [orders]);

    if (count === 0) return null;

    return (
        <span className={cn(
            "ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full animate-in zoom-in duration-300",
            className
        )}>
            {count}
        </span>
    );
}
