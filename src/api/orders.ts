import { CreateOrderRequest, OrderResponse, UploadResponse } from '@/types/api';

export interface Order {
    id: string;
    date: string;
    title: string;
    status: string; // Original backend status code
    statusLabel: string; // Display label
    stepIndex: number;
    images: {
        url: string;
        sketchedUrl?: string;
        description: string;
    }[];
    description?: string;
    estimatedPrice?: number;
    finalPrice?: number;
    isPaid?: boolean;
    pickupDate?: string;
    trackingNumber?: string;
    carrier?: string;
}

const API_Base_URL = '/api';

// Complete workflow mapping based on rule.md
// 요청 > 견적중 > 견적완료 > 결제대기 > 결제완료 > 수거 > 수거완료 > 도착 > 수선대기 > 수선시작 > 수선중 > 수선완료 > 배송시작 > 배송완료 > 완료
const STATUS_MAPPING: Record<string, { label: string; step: number }> = {
    // Backend status -> Display mapping
    'REQUESTED': { label: '요청', step: 0 },
    'ESTIMATING': { label: '견적중', step: 1 },
    'ESTIMATE_COMPLETED': { label: '견적완료', step: 2 },
    'PAYMENT_PENDING': { label: '결제대기', step: 3 },
    'PAID': { label: '결제완료', step: 4 },
    'PAYMENT_COMPLETED': { label: '결제완료', step: 4 },
    'PICKUP_REQUESTED': { label: '수거', step: 5 },
    'PICKUP_COMPLETED': { label: '수거완료', step: 6 },
    'ARRIVED': { label: '도착', step: 7 },
    'WAITING_FOR_REPAIR': { label: '수선대기', step: 8 },
    'REPAIR_STARTED': { label: '수선시작', step: 9 },
    'REPAIRING': { label: '수선중', step: 10 },
    'PROCESSING': { label: '수선중', step: 10 }, // Alias
    'IN_REPAIR': { label: '수선중', step: 10 }, // Alias
    'REPAIR_COMPLETED': { label: '수선완료', step: 11 },
    'DELIVERY_STARTED': { label: '배송시작', step: 12 },
    'SHIPPING': { label: '배송시작', step: 12 }, // Alias
    'SHIPPED': { label: '배송시작', step: 12 }, // Alias
    'DELIVERY_COMPLETED': { label: '배송완료', step: 13 },
    'COMPLETED': { label: '완료', step: 14 },
};

function mapOrder(backendOrder: OrderResponse): Order {
    const statusInfo = STATUS_MAPPING[backendOrder.status] || { label: backendOrder.status, step: 0 };

    return {
        id: backendOrder.id,
        date: new Date(backendOrder.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.'),
        title: backendOrder.title,
        status: backendOrder.status, // Keep original status code
        statusLabel: statusInfo.label, // Add display label
        stepIndex: statusInfo.step,
        images: backendOrder.images.map((img) => ({
            url: img.originalUrl,
            sketchedUrl: img.sketchedUrl,
            description: img.description || ''
        })),
        description: backendOrder.description,
        estimatedPrice: backendOrder.estimatedPrice,
        finalPrice: backendOrder.finalPrice,
        isPaid: backendOrder.isPaid,
        pickupDate: backendOrder.pickupDate,
        trackingNumber: backendOrder.trackingNumber,
        carrier: backendOrder.carrier,
    };
}

export async function getOrders(email?: string): Promise<Order[]> {
    try {
        const url = email
            ? `${API_Base_URL}/orders/user?email=${encodeURIComponent(email)}`
            : `${API_Base_URL}/orders`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        const data: OrderResponse[] = await response.json();
        return data.map(mapOrder);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

export async function createOrder(data: CreateOrderRequest): Promise<{ success: boolean; id: string }> {
    try {
        const response = await fetch(`${API_Base_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to create order');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}
export async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_Base_URL}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        const data = await response.json();
        return data.url;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}
