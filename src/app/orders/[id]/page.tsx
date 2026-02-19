'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import StatusStepper from '@/components/status-stepper';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Truck, Package, CheckCircle, Tag, Info } from 'lucide-react';
import { STATUS_STEPS, STATUS_LABELS } from '@/lib/constants';
import { useSSE } from '@/hooks/use-sse';

// Copying minimal specs for display purposes
const REPAIR_SPECS_DISPLAY: Record<string, { label: string, unit?: string }> = {
    length_reduction: { label: '기장 줄이기', unit: 'cm' },
    length_extension: { label: '기장 늘리기', unit: 'cm' },
    width_reduction: { label: '폭 줄이기', unit: 'cm' },
    width_extension: { label: '폭 늘리기', unit: 'cm' },
    subsidiary: { label: '부자재 교체' },
    structure: { label: '구조 수선' },
};

export default function RequestDetailPage() {
    const params = useParams();
    const { data: session } = useSession();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrder() {
            if (params?.id) {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${params.id}`);
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

    useSSE((event) => {
        const data = JSON.parse(event.data);
        // Optionally filter by orderId if event contains it
        if (data.orderId === params?.id) {
            console.log('Updating Order Detail via SSE');
            // Re-fetch order
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${params.id}`)
                .then(res => res.json())
                .then(data => setOrder(data))
                .catch(console.error);
        }
    });

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
                    {order.orderNumber && (
                        <span className="ml-auto px-3 py-1 bg-blue-50 text-blue-700 text-sm font-bold rounded-full border border-blue-200">
                            {order.orderNumber}
                        </span>
                    )}
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">

                {/* Status Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold text-slate-900">진행 상태</h2>
                        <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                            {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS] || order.status}
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

                {/* Delivery Info */}
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


                {/* ORDER ITEMS LIST */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        주문 품목 ({order.items?.length || 0})
                    </h2>

                    {order.items && order.items.map((item: any, idx: number) => (
                        <div key={item.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            {/* Item Header */}
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full">품목 {idx + 1}</span>
                                    {item.category}
                                </h3>
                                {item.estimatedPrice > 0 && (
                                    <span className="text-blue-600 font-bold text-sm">
                                        {item.estimatedPrice.toLocaleString()}원
                                    </span>
                                )}
                            </div>

                            <div className="p-6">
                                {/* Repair Details */}
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">수선 상세 내용</h4>
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <RepairDetailRenderer detailStr={item.repairServiceDetail} />
                                    </div>
                                </div>

                                {/* Description from User */}
                                {item.description && (
                                    <div className="mb-6">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">추가 요청 사항</h4>
                                        <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl">
                                            {item.description}
                                        </p>
                                    </div>
                                )}

                                {/* Images */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">등록된 이미지</h4>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {item.images && item.images.map((img: any) => (
                                            <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                                <Image
                                                    src={img.originalUrl}
                                                    alt="Item Image"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
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

function RepairDetailRenderer({ detailStr }: { detailStr: string }) {
    if (!detailStr) return <span className="text-slate-400 text-sm">상세 내용 없음</span>;
    try {
        const detail = JSON.parse(detailStr);
        const entries = Object.entries(detail);

        if (entries.length === 0) return <span className="text-slate-400 text-sm">-</span>;

        return (
            <div className="space-y-3">
                {entries.map(([key, val]: [string, any]) => {
                    const spec = REPAIR_SPECS_DISPLAY[key];
                    const label = spec?.label || key;
                    const unit = spec?.unit || '';

                    return (
                        <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm py-1 border-b last:border-0 border-slate-100 pb-2 last:pb-0">
                            <span className="font-bold text-slate-700 flex items-center gap-2">
                                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                                {label}
                            </span>
                            <div className="pl-3 sm:pl-0 mt-1 sm:mt-0 text-slate-600 font-medium">
                                {renderSingleDetail(val, unit)}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    } catch { return <span className="text-red-400 text-xs">데이터 오류</span>; }
}

function renderSingleDetail(d: any, unit: string) {
    // Range
    if (d.amount !== undefined) {
        return (
            <span className="text-blue-600 font-bold">
                {d.amount}{unit} {d.isMore ? '(이상)' : ''}
            </span>
        );
    }
    // Checkbox Group
    if (d.selectedOptions && Array.isArray(d.selectedOptions)) {
        return (
            <span className="text-slate-700">
                {d.selectedOptions.join(', ')}
            </span>
        );
    }
    return <span>확인 필요</span>;
}
