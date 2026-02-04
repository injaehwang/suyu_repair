'use client';

import StatusStepper from '@/components/status-stepper';
import Image from 'next/image';
import { Truck, Package } from 'lucide-react';

interface RequestDetailPanelProps {
    order: any;
}

export default function RequestDetailPanel({ order }: RequestDetailPanelProps) {
    return (
        <div className="mt-4 border-t pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Status Stepper */}
            <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-900 mb-4">진행 상태</h4>
                <StatusStepper currentStatus={order.status} />
                {order.status === 'CANCELED' && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
                        이 주문은 취소되었습니다.
                    </div>
                )}
            </div>

            {/* Delivery Info */}
            {(order.trackingNumber || order.carrier) && (
                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        배송 정보
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div>
                            <span className="text-xs text-gray-500 block">배송사</span>
                            <span className="font-medium text-sm">{order.carrier || '-'}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 block">운송장 번호</span>
                            <span className="font-medium text-sm flex items-center gap-2">
                                {order.trackingNumber || '-'}
                                <button className="text-xs bg-white border px-1.5 py-0.5 rounded hover:bg-gray-50 text-gray-600">
                                    복사
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Details */}
            <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    상세 내용
                </h4>
                <div className="mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                        {order.description || '상세 설명이 없습니다.'}
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {order.images.map((img: any) => (
                        <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <Image
                                src={img.originalUrl}
                                alt="Request Image"
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
