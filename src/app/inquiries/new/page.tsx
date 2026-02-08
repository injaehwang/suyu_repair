'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getOrders } from '@/api/orders';
import { createInquiry } from '@/api/inquiries';
import { cn } from '@/lib/utils';
import { OrderResponse } from '@/types/api';
import { useAlert } from '@/components/providers/global-alert-provider';

import { Suspense } from 'react';

const CATEGORIES = [
    { id: 'DELIVERY', label: '배송' },
    { id: 'PAYMENT', label: '결제' },
    { id: 'REPAIR', label: '수선' },
    { id: 'OTHER', label: '기타' },
];

export default function NewInquiryPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}>
            <NewInquiryContent />
        </Suspense>
    );
}

function NewInquiryContent() {
    const { alert } = useAlert();
    const router = useRouter();
    const { data: session } = useSession();
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [category, setCategory] = useState('REPAIR');
    const [content, setContent] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState<string>('');

    const searchParams = useSearchParams();

    useEffect(() => {
        if (session?.user?.email) {
            getOrders({ userEmail: session.user.email }).then(data => {
                setOrders(data);

                // Pre-select if param exists
                const paramOrderId = searchParams.get('orderId');
                if (paramOrderId) {
                    setSelectedOrderId(paramOrderId);
                }
            });
        }

        const paramCategory = searchParams.get('category');
        if (paramCategory) {
            setCategory(paramCategory);
        }
    }, [session, searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            await createInquiry({
                userId: (session?.user as any).id,
                category: CATEGORIES.find(c => c.id === category)?.label || category,
                content,
                orderId: selectedOrderId || undefined,
            });
            router.push('/inquiries');
            router.refresh();
        } catch (error: any) {
            console.error(error);
            // Handle "User not found" (400) from backend
            if (error.response?.status === 400 || error.message?.includes('User not found') || error.response?.data?.message?.includes('User not found')) {
                await alert('로그인 세션이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.', { title: '로그인 필요', variant: 'destructive' });
                // Force signout and redirect
                const { signOut } = await import('next-auth/react');
                await signOut({ callbackUrl: '/' });
                return;
            }
            await alert('문의 등록 중 오류가 발생했습니다.', { title: '오류', variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-10">
            <header className="bg-white h-14 flex items-center px-4 border-b border-slate-100 sticky top-0 z-10">
                <Link href="/inquiries" className="mr-4">
                    <ChevronLeft className="w-6 h-6 text-slate-800" />
                </Link>
                <h1 className="text-lg font-bold text-slate-900">문의하기</h1>
            </header>

            <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-lg mx-auto">
                {/* Category */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">문의 유형</label>
                    <div className="grid grid-cols-4 gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setCategory(cat.id)}
                                className={cn(
                                    "py-2 text-sm font-medium rounded-lg border transition-all",
                                    category === cat.id
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Related Order (Optional) */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">관련 주문 (선택)</label>
                    <select
                        value={selectedOrderId}
                        onChange={(e) => setSelectedOrderId(e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">선택 안함</option>
                        {orders.map((order) => {
                            const dateLabel = new Date(order.createdAt).toLocaleDateString();
                            return (
                                <option key={order.id} value={order.id}>
                                    [{order.status}] {order.title} ({dateLabel})
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">문의 내용</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="문의하실 내용을 자세히 입력해주세요."
                        className="w-full h-40 p-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={submitting || !content.trim()}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl disabled:bg-slate-300 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : '문의 등록하기'}
                </button>
            </form>
        </div>
    );
}
