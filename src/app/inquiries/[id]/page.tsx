'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChevronLeft, MessageCircle, ShoppingBag, Clock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getInquiry } from '@/api/inquiries';
import { getOrders } from '@/api/orders';

export default function InquiryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [inquiry, setInquiry] = useState<any>(null);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            getInquiry(params.id as string)
                .then(async (data) => {
                    setInquiry(data);
                    // Fetch order if exists
                    if (data.orderId && session?.user?.email) {
                        try {
                            // Using getOrders mainly fetches list. 
                            // Ideally, we need getOrder(id). 
                            // But frontend api might not have single order fetch exposed simply or we have to filter.
                            // Let's check api/orders.ts if there is getOrder.
                            // Assuming we can fetch /api/orders/:id directly.
                            // I'll implement a quick fetch here or use getOrders().find
                            const res = await fetch(`/api/orders/${data.orderId}`);
                            if (res.ok) {
                                const orderData = await res.json();
                                setOrder(orderData);
                            }
                        } catch (e) {
                            console.error("Failed to fetch order", e);
                        }
                    }
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [params.id, session]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    }

    if (!inquiry) {
        return <div className="p-8 text-center">문의를 찾을 수 없습니다.</div>;
    }

    const handleReInquiry = () => {
        // Redirect to new inquiry with params
        const query = new URLSearchParams();
        if (inquiry.orderId) query.set('orderId', inquiry.orderId);
        if (inquiry.category) query.set('category', inquiry.category);
        router.push(`/inquiries/new?${query.toString()}`);
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-24">
            <header className="bg-white h-14 flex items-center px-4 border-b border-slate-100 sticky top-0 z-10">
                <Link href="/inquiries" className="mr-4 p-1 hover:bg-slate-100 rounded-full">
                    <ChevronLeft className="w-6 h-6 text-slate-800" />
                </Link>
                <h1 className="text-lg font-bold text-slate-900">문의 상세</h1>
            </header>

            <div className="max-w-xl mx-auto p-4 space-y-6">

                {/* Order Context Card */}
                {order && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                            <ShoppingBag className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-bold text-slate-800">관련 주문</span>
                        </div>
                        <div className="flex gap-3">
                            <div className="h-16 w-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                {order.images?.[0]?.originalUrl ? (
                                    <img src={order.images[0].originalUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Img</div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full">{order.status}</span>
                                    <span className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{order.title}</h3>
                                <p className="text-xs text-slate-500 mt-1">예상 금액: {order.estimatedPrice?.toLocaleString() || '-'}원</p>
                            </div>
                        </div>
                        <Link href={`/orders/${order.id}`} className="block mt-3 text-center text-xs font-medium text-blue-600 bg-blue-50 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                            주문 상세 보기
                        </Link>
                    </div>
                )}

                {/* Inquiry Content */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-md">
                                {inquiry.category}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Clock className="w-3 h-3" />
                                {new Date(inquiry.createdAt).toLocaleString()}
                            </span>
                        </div>
                        <h2 className="text-base font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">
                            {inquiry.content}
                        </h2>
                    </div>

                    {/* Answer Section */}
                    {inquiry.answer && (
                        <div className="bg-blue-50/50 p-5 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                                    <MessageCircle className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-slate-900 block">관리자 답변</span>
                                    <span className="text-[10px] text-slate-400">{new Date(inquiry.answeredAt).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="pl-8">
                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                                    {inquiry.answer}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {inquiry.answer && (
                    <div className="px-2">
                        <Button
                            onClick={handleReInquiry}
                            className="w-full bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-blue-600 h-12 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 justify-center"
                        >
                            <RotateCcw className="w-4 h-4" />
                            추가 문의하기 (재질문)
                        </Button>
                        <p className="text-center text-xs text-slate-400 mt-2">
                            같은 주문건에 대해 다시 문의하실 수 있습니다.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
