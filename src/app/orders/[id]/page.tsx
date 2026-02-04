'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Correct hook for App Router params
import { useSession } from 'next-auth/react';
import StatusStepper from '@/components/status-stepper';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Truck, Package, CheckCircle } from 'lucide-react';

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
                        // Handle error (e.g., unauthorized or not found)
                        console.error('Failed to fetch order');
                        // In a real app, verify user ownership here or on backend
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

    if (loading) return <div className="p-10 text-center">로딩 중...</div>;
    if (!order) return <div className="p-10 text-center">요청을 찾을 수 없습니다.</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-3xl mx-auto p-4 md:p-6">
                {/* Header with Back Button */}
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/orders" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </Link>
                    <h1 className="text-2xl font-bold">요청 상세 정보</h1>
                </div>

                {/* Status Stepper Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-bold mb-4">진행 상태</h2>
                    <StatusStepper currentStatus={order.status} />
                    {order.status === 'CANCELED' && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
                            이 주문은 취소되었습니다.
                        </div>
                    )}
                </div>

                {/* Payment Card */}
                {(order.status === 'PAYMENT_PENDING' || order.status === 'ESTIMATE_COMPLETED') && (
                    <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 mb-6">
                        <h2 className="text-lg font-bold mb-2 text-slate-900">결제 대기중</h2>
                        <p className="text-slate-600 mb-4 text-sm">
                            수선 비용 견적이 확정되었습니다. 결제를 진행해주세요.
                        </p>
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg mb-4">
                            <span className="text-slate-600">결제 금액</span>
                            <span className="text-xl font-bold text-blue-600">
                                {(order.finalPrice || order.estimatedPrice || 0).toLocaleString()}원
                            </span>
                        </div>
                        <Link
                            href={`/payment/${order.id}`}
                            className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                        >
                            결제하기
                        </Link>
                    </div>
                )}

                {order.status === 'PAID' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-green-100 p-1 rounded-full">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">결제 완료</h2>
                        </div>
                        <div className="space-y-3">
                            <p className="text-slate-700 font-medium">
                                결제가 완료되었습니다. 택배 수거가 예정되어 있습니다.
                            </p>

                            {order.pickupDate && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Package className="w-5 h-5 text-blue-600" />
                                        <span className="font-bold text-blue-900">수거 예정일</span>
                                    </div>
                                    <p className="text-blue-800 font-bold text-lg mb-2">
                                        {new Date(order.pickupDate).toLocaleDateString('ko-KR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            weekday: 'short'
                                        })}
                                    </p>
                                    <div className="text-sm text-blue-700 space-y-1">
                                        <p>📦 수선할 의류를 깨끗하게 포장해 주세요</p>
                                        <p>🚪 수거 예정일에 문 앞에 준비해 주세요</p>
                                        <p>📱 택배 기사님이 방문 시 연락드립니다</p>
                                    </div>
                                </div>
                            )}

                            {order.trackingNumber && (
                                <p className="text-sm text-slate-500">
                                    운송장 번호: <span className="font-mono font-bold text-slate-700">{order.trackingNumber}</span>
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Delivery Info Card (Only if applicable) */}
                {(order.trackingNumber || order.carrier) && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-blue-600" />
                            배송 정보
                        </h2>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div>
                                <span className="text-sm text-gray-500 block">배송사</span>
                                <span className="font-medium text-lg">{order.carrier || '-'}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 block">운송장 번호</span>
                                <span className="font-medium text-lg flex items-center gap-2">
                                    {order.trackingNumber || '-'}
                                    <button className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 text-gray-600">
                                        복사
                                    </button>
                                </span>
                            </div>
                        </div>
                        {/* Placeholder for Tracking Link */}
                        <div className="mt-4">
                            <a href="#" className="text-blue-600 text-sm hover:underline">배송 조회하기 &rarr;</a>
                        </div>
                    </div>
                )}

                {/* Order Details & Images */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        요청 내용
                    </h2>

                    <div className="mb-6">
                        <span className="text-sm text-gray-500 block mb-1">제목</span>
                        <p className="text-xl font-semibold">{order.title}</p>
                    </div>

                    <div className="mb-6">
                        <span className="text-sm text-gray-500 block mb-1">상세 설명</span>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {order.description || '상세 설명이 없습니다.'}
                        </p>
                    </div>

                    <div>
                        <span className="text-sm text-gray-500 block mb-3">등록된 이미지</span>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {order.images.map((img: any) => (
                                <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                                    <Image
                                        src={img.originalUrl}
                                        alt="Request Image"
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
