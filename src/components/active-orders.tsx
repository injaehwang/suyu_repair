'use client';

import { useQuery } from '@tanstack/react-query';
import { getOrders } from '@/api/orders';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChevronRight, Loader2, Package } from 'lucide-react';
import StatusStepper from '@/components/status-stepper';
import { useSSE } from '@/hooks/use-sse';
import { useQueryClient } from '@tanstack/react-query';

export default function ActiveOrders() {
    const { data: session, status } = useSession();
    const queryClient = useQueryClient();

    // SSE Integration for real-time updates
    useSSE((event) => {
        // Invalidate orders on any update
        queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders', session?.user?.email],
        queryFn: () => getOrders({ userEmail: session?.user?.email }),
        enabled: status === 'authenticated' && !!session?.user?.email,
    });

    if (status !== 'authenticated') return null;
    if (isLoading) return null; // Don't show anything while loading to avoid layout shift, or show skeleton

    // Filter active orders (not completed, cancelled, or returned)
    const activeOrders = orders?.filter(o =>
        !['COMPLETED', 'CANCELLED', 'RETURNED'].includes(o.status)
    ) || [];

    if (activeOrders.length === 0) return null;

    return (
        <div className="w-full max-w-6xl mx-auto mb-12 animate-fade-in">
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-200" />
                    진행 중인 수선 ({activeOrders.length})
                </h2>
                <Link href="/orders" className="text-sm text-blue-100 hover:text-white flex items-center gap-1 font-medium transition-colors">
                    전체보기 <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Dynamic Grid Layout */}
            <div className={`
                gap-4 w-full grid
                ${activeOrders.length === 1 ? 'grid-cols-1' : ''}
                ${activeOrders.length === 2 ? 'grid-cols-1 md:grid-cols-2' : ''}
                ${activeOrders.length >= 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : ''}
            `}>
                {activeOrders.slice(0, 3).map((order) => {
                    const thumbnail = order.images?.[0]?.sketchedUrl
                        || order.images?.[0]?.originalUrl
                        || order.items?.[0]?.images?.[0]?.sketchedUrl
                        || order.items?.[0]?.images?.[0]?.originalUrl
                        || '/placeholder.png';

                    return (
                        <Link key={order.id} href={`/orders/${order.id}`} className="w-full">
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                <div className="flex gap-4">
                                    <div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={thumbnail} alt="" className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-slate-900 font-bold truncate group-hover:text-blue-600 transition-colors">
                                            {order.title}
                                        </h3>
                                        <div className="mt-2 transform origin-left scale-75 -ml-1">
                                            <StatusStepper currentStatus={order.status} />
                                            {/* Note: 'simple' prop might need to be added to StatusStepper if we want minimal view, 
                                                or just use it as is. Assuming it renders standard stepper. */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
