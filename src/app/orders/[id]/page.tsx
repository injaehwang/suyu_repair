'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Correct hook for App Router params
import { useSession } from 'next-auth/react';
import StatusStepper from '@/components/status-stepper';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Truck, Package, CheckCircle } from 'lucide-react';
import { STATUS_STEPS } from '@/lib/constants';

export default function RequestDetailPage() {
    const params = useParams();
    const { data: session } = useSession();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrder() {
            if (params?.id) {
                try {
                    const res = await fetch(`http://localhost:4000/orders/${params.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setOrder(data);
                    } else {
                        console.error('Failed to fetch order');
                    }
                } catch (error) {
                    console.error('Error fetching order:', error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchOrder();
    }, [params?.id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
    if (!order) return <div className="p-10 text-center">요청을 찾을 수 없습니다.</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/orders" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <h1 className="text-lg font-bold text-slate-800">요청 상세 정보</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">

                {/* Status Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold text-slate-900">진행 상태</h2>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                            Step {STATUS_STEPS.indexOf(order.status) + 1} / 12
                        </span>
                    </div>
                    <StatusStepper currentStatus={order.status} />

                    {order.status === 'CANCELED' && (
                        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm text-center font-bold border border-red-100">
                            ⛔ 이 주문은 취소되었습니다.
                        </div>
                    )}
                </div>

                {/* Action Cards: Payment */}
                {(order.status === 'PAYMENT_PENDING' || order.status === 'ESTIMATE_COMPLETED') && (
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-lg shadow-blue-200 p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <span className="bg-white/20 p-1.5 rounded-lg"><CheckCircle className="w-5 h-5" /></span>
                                결제 대기중
                            </h2>
                            <p className="text-blue-100 mb-6 text-sm leading-relaxed">
                                수선 전문가가 견적을 확정했습니다.<br />
                                결제를 진행하시면 곧바로 수거가 시작됩니다.
                            </p>
                            <div className="flex items-end justify-between bg-white/10 p-4 rounded-xl mb-6 backdrop-blur-sm border border-white/10">
                                <span className="text-blue-200 text-sm font-medium">결제 금액</span>
                                <span className="text-3xl font-bold">
                                    {(order.finalPrice || order.estimatedPrice || 0).toLocaleString()}
                                    <span className="text-lg font-normal ml-1 text-blue-200">원</span>
                                </span>
                            </div>
                            <Link
                                href={`/payment/${order.id}`}
                                className="block w-full bg-white text-blue-600 text-center py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-md text-lg"
                            >
                                결제하기
                            </Link>
                        </div>
                    </div>
                )}

                {/* Delivery & Schedule Info */}
                {(order.pickupDate || order.trackingNumber) && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 divide-y divide-slate-100">
                        {order.pickupDate && (
                            <div className="p-6">
                                <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-wide">
                                    <Package className="w-4 h-4" /> 수거 일정
                                </h3>
                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-center min-w-[60px]">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase">Date</div>
                                        <div className="text-xl font-bold text-slate-900">
                                            {new Date(order.pickupDate).getDate()}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-lg">
                                            {new Date(order.pickupDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
                                        </p>
                                        <p className="text-sm text-slate-500">문 앞에 물품을 준비해 주세요.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(order.trackingNumber || order.carrier) && (
                            <div className="p-6">
                                <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-wide">
                                    <Truck className="w-4 h-4" /> 배송 정보
                                </h3>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                        <span className="text-xs text-slate-500 font-bold block mb-1">배송사</span>
                                        <span className="text-slate-900 font-bold">{order.carrier || '지정되지 않음'}</span>
                                    </div>
                                    <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                        <span className="text-xs text-slate-500 font-bold block mb-1">운송장 번호</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-900 font-mono font-bold tracking-wider">{order.trackingNumber || '-'}</span>
                                            {order.trackingNumber && (
                                                <button className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 text-slate-600 font-bold">
                                                    복사
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}


                {/* Request Details */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900">
                        <div className="w-2 h-6 bg-slate-900 rounded-full"></div>
                        요청 상세
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <span className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">수선 품목 (제목)</span>
                            <p className="text-xl font-bold text-slate-900 leading-snug">{order.title}</p>
                        </div>

                        <div>
                            <span className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">세부 요청 사항</span>
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {order.description || '상세 설명이 없습니다.'}
                            </div>
                        </div>

                        <div>
                            <span className="text-xs font-bold text-slate-400 block mb-3 uppercase tracking-wide">등록된 이미지</span>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {order.images?.map((img: any) => (
                                    <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group bg-slate-100">
                                        <Image
                                            src={img.originalUrl}
                                            alt="Request Image"
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        {img.sketchedUrl && (
                                            <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-lg backdrop-blur-md">
                                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Help */}
                <div className="text-center py-6 text-slate-400 text-sm">
                    문의사항이 있으신가요?
                    <Link href="/inquiries" className="text-slate-600 font-bold ml-1 hover:underline">1:1 문의하기</Link>
                </div>
            </div>
        </div>
    );
}
