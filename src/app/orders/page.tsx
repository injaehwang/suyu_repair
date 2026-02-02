'use client';

import { Stepper } from '@/components/ui/stepper';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '@/api/orders';

const STEPS = ['접수 완료', '견적 산출', '결제 대기', '수선 중', '배송 중', '수선 완료'];

export default function OrdersPage() {
    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: getOrders,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const hasOrders = orders && orders.length > 0;

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <h1 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">수선 내역</h1>

                {hasOrders ? (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mb-2 border border-blue-100">
                                                {order.status}
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-900">{order.title}</h3>
                                            <p className="text-slate-400 text-xs font-mono mt-1">{order.date} · {order.id}</p>
                                        </div>
                                        <Link href={`/orders/${order.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center transition-colors bg-blue-50 px-3 py-1.5 rounded-full">
                                            상세보기 <ChevronRight className="h-4 w-4 ml-0.5" />
                                        </Link>
                                    </div>

                                    <div className="flex gap-5 mb-8">
                                        <div className="h-24 w-24 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100 shadow-inner group relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={order.images?.[0]?.sketchedUrl || order.images?.[0]?.url || '/placeholder.png'}
                                                alt="Thumbnail"
                                                className="h-full w-full object-cover"
                                            />
                                            {order.images && order.images.length > 1 && (
                                                <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-tl-lg font-medium">
                                                    +{order.images.length - 1}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 py-1">
                                            <Stepper steps={STEPS} currentStep={order.stepIndex} />

                                        </div>
                                    </div>

                                    {order.status === '결제 대기' && (
                                        <div className="mt-4 p-4 bg-yellow-50/80 rounded-2xl border border-yellow-100 flex justify-between items-center animate-pulse-subtle">
                                            <span className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                                결제가 필요합니다
                                            </span>
                                            <Link href="/payment">
                                                <Button size="sm" className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500 border-none font-bold shadow-sm rounded-xl">결제하기</Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Package className="h-8 w-8 text-slate-300" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900 mb-1">아직 수선 내역이 없습니다</h2>
                        <p className="text-slate-500 mb-8 text-sm max-w-xs mx-auto">새로운 수선 견적을 요청해보세요! 전문가가 꼼꼼하게 상담해드립니다.</p>
                        <Link href="/request">
                            <Button className="rounded-full px-8 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">첫 수선 신청하기</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
