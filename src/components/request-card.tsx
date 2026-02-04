'use client';

import Image from 'next/image';
import RequestDetailPanel from './request-detail-panel';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { STATUS_LABELS } from '@/lib/constants';

interface RequestCardProps {
    order: {
        id: string;
        title: string;
        description?: string;
        status: string;
        createdAt: string;
        images: { originalUrl: string }[];
        trackingNumber?: string;
        carrier?: string;
    };
    isActive: boolean;
    onToggle: () => void;
}

export default function RequestCard({ order, isActive, onToggle }: RequestCardProps) {
    const statusLabel = STATUS_LABELS[order.status as keyof typeof STATUS_LABELS] || order.status;
    const mainImage = order.images[0]?.originalUrl || '/placeholder.png'; // Fallback image

    // Optional: Add specific colors for groups of statuses
    let badgeColor = 'bg-slate-100 text-slate-800';
    if (['COMPLETED', 'DELIVERY_COMPLETED'].includes(order.status)) badgeColor = 'bg-green-100 text-green-800';
    if (['REQUESTED'].includes(order.status)) badgeColor = 'bg-blue-100 text-blue-800';
    if (['ESTIMATING', 'ESTIMATE_COMPLETED'].includes(order.status)) badgeColor = 'bg-orange-100 text-orange-800';
    if (order.status.includes('REPAIR')) badgeColor = 'bg-purple-100 text-purple-800';

    return (
        <div
            onClick={onToggle}
            className={`flex flex-col border rounded-xl bg-white shadow-sm transition-all duration-300 overflow-hidden cursor-pointer
                ${isActive ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'}`}
        >
            <div className="flex p-4 gap-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                        src={mainImage}
                        alt={order.title}
                        fill
                        className="object-cover rounded-lg"
                    />
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg truncate pr-2">{order.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-1">{order.description}</p>
                        </div>
                        {isActive ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${badgeColor}`}>
                            {statusLabel}
                        </span>
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isActive && (
                <div className="px-4 pb-4 cursor-default" onClick={(e) => e.stopPropagation()}>
                    <RequestDetailPanel order={order} />
                </div>
            )}
        </div>
    );
}
