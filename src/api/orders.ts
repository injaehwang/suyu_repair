import { CreateOrderRequest, OrderResponse, UploadResponse } from '@/types/api';

export const createOrder = async (data: CreateOrderRequest) => {
    // Clean up undefined values.
    const cleanData = JSON.parse(JSON.stringify(data));

    const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '주문 생성에 실패했습니다.');
    }

    return response.json();
};

export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
    }

    const data: UploadResponse = await response.json();
    return data.url;
};

export const getOrders = async (params?: any): Promise<OrderResponse[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
        Object.keys(params).forEach(key => {
            if (params[key]) searchParams.append(key, params[key]);
        });
    }

    const response = await fetch(`/api/orders?${searchParams.toString()}`);
    if (!response.ok) {
        throw new Error('주문 목록을 불러오는데 실패했습니다.');
    }
    return response.json();
};
