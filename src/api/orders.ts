import { CreateOrderRequest, OrderResponse, UploadResponse } from '@/types/api';

export interface Order {
    id: string;
    date: string;
    title: string;
    status: string;
    stepIndex: number;
    images: {
        url: string;
        sketchedUrl?: string;
        description: string;
    }[];
    description?: string;
}

const API_Base_URL = '/api';

const STATUS_MAPPING: Record<string, { label: string; step: number }> = {
    'REQUESTED': { label: '접수 완료', step: 0 },
    'ESTIMATING': { label: '견적 산출', step: 1 },
    'PAYMENT_PENDING': { label: '결제 대기', step: 2 },
    'IN_REPAIR': { label: '수선 중', step: 3 },
    'SHIPPING': { label: '배송 중', step: 4 },
    'COMPLETED': { label: '수선 완료', step: 5 },
};

function mapOrder(backendOrder: OrderResponse): Order {
    const statusInfo = STATUS_MAPPING[backendOrder.status] || { label: backendOrder.status, step: 0 };

    return {
        id: backendOrder.id,
        date: new Date(backendOrder.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.'),
        title: backendOrder.title,
        status: statusInfo.label,
        stepIndex: statusInfo.step,
        images: backendOrder.images.map((img) => ({
            url: img.originalUrl,
            sketchedUrl: img.sketchedUrl,
            description: img.description || ''
        })),
        description: backendOrder.description
    };
}

export async function getOrders(): Promise<Order[]> {
    try {
        const response = await fetch(`${API_Base_URL}/orders`);
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
