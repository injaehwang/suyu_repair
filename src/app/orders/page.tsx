'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '@/api/orders';
import { useSession } from 'next-auth/react';
import StatusStepper from '@/components/status-stepper';
import { OrderResponse } from '@/types/api';

const STATUS_LABELS: Record<string, string> = {
    REQUESTED: '견적 요청',
    ESTIMATING: '견적 산출 중',
    ESTIMATE_COMPLETED: '견적 완료',
    PAYMENT_PENDING: '결제 대기',
    PAYMENT_COMPLETED: '결제 완료',
    COLLECTION_REQUESTED: '수거 요청',
    COLLECTING: '수거 중',
    COLLECTED: '수거 완료',
    IN_REPAIR: '수선 중',
    REPAIR_COMPLETED: '수선 완료',
    SHIPPING: '배송 중',
    DELIVERED: '배송 완료',
    COMPLETED: '거래 확정',
    CANCELLED: '취소됨',
    RETURN_REQUESTED: '반송 요청',
    RETURNED: '반송 완료'
};

export default function OrdersPage() {
    const { data: session, status } = useSession();
    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders', session?.user?.email],
        queryFn: () => getOrders(session?.user?.email || undefined),
        enabled: status === 'authenticated' && !!session?.user?.email,
    });

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const hasOrders = orders && orders.length > 0;

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">수선 내역</h1>
                    <Link href="/request">
                        <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 shadow-lg shadow-blue-200 transition-all">
                            + 새 요청
                        </Button>
                    </Link>
                </div>

                {hasOrders ? (
                    <div className="space-y-6">
                        {orders.map((order: OrderResponse) => {
                            const statusLabel = STATUS_LABELS[order.status] || order.status;
                            const dateLabel = new Date(order.createdAt).toLocaleDateString();
                            const thumbnail = order.images?.[0]?.sketchedUrl || order.images?.[0]?.originalUrl || '/placeholder.png';

                            return (
                                <div
                                    key={order.id}
                                    className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
                                >
                                    {/* Payment Alert Stripe */}
                                    {(order.status === 'PAYMENT_PENDING' || order.status === 'ESTIMATE_COMPLETED') && (
                                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-yellow-400 z-10"></div>
                                    )}

                                    <div className="p-6 pl-8">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600 mb-1">
                                                    {statusLabel}
                                                </span>
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                    {order.title}
                                                </h3>
                                                <p className="text-slate-400 text-xs font-mono">
                                                    {dateLabel} · {order.id.slice(0, 8)}
                                                </p>
                                            </div>
                                            <Link href={`/orders/${order.id}`}>
                                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                                                    상세보기 <ChevronRight className="h-4 w-4 ml-0.5" />
                                                </Button>
                                            </Link>
                                        </div>

                                        <div className="flex gap-5 items-center">
                                            {/* Thumbnail with counter */}
                                            <div className="h-20 w-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100 relative">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={thumbnail}
                                                    alt="Thumbnail"
                                                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                {order.images && order.images.length > 1 && (
                                                    <div className="absolute bottom-0 right-0 left-0 bg-black/60 text-white text-[10px] py-0.5 text-center font-bold backdrop-blur-sm">
                                                        +{order.images.length - 1}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Stepper Preview */}
                                            <div className="flex-1 min-w-0">
                                                <div className="transform scale-90 origin-left -ml-2">
                                                    <StatusStepper currentStatus={order.status} />
                                                </div>
                                            </div>
                                        </div>

                                        {(order.status === 'PAYMENT_PENDING' || order.status === 'ESTIMATE_COMPLETED') && (
                                            <div className="mt-5 p-3 bg-yellow-50 rounded-xl border border-yellow-100 flex justify-between items-center">
                                                <span className="text-sm font-bold text-yellow-800 flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                                                    결제가 필요합니다
                                                </span>
                                                <Link href={`/payment/${order.id}`}>
                                                    <Button size="sm" className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500 border-none font-bold rounded-lg shadow-sm h-8 px-4 text-xs">
                                                        결제하기
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-bounce-subtle">
                            <Package className="h-10 w-10 text-blue-300" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">수선 내역이 없습니다</h2>
                        <p className="text-slate-500 mb-8 text-sm max-w-xs mx-auto leading-relaxed">
                            아끼는 옷, 더 오래 입을 수 있도록<br />
                            수유 수선이 도와드릴게요.
                        </p>
                        <Link href="/request">
                            <Button className="rounded-full px-8 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 font-bold text-base transition-transform hover:scale-105">
                                수선 견적 요청하기
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
