export interface OrderImageDto {
    originalUrl: string;
    sketchedUrl?: string;
    description?: string;
}

export interface OrderItemDto {
    category: string;
    repairService?: string;
    repairServiceDetail?: string;
    description?: string;
    images?: OrderImageDto[];
}

export interface CreateOrderRequest {
    title?: string;
    description?: string;
    items: OrderItemDto[];
    userEmail?: string;
    userName?: string;
    userImage?: string;
}

export interface OrderResponse {
    id: string;
    description?: string;
    status: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    estimatedPrice?: number;
    finalPrice?: number;
    isPaid?: boolean;
    pickupDate?: string;
    trackingNumber?: string;
    carrier?: string;
    images: {
        id: string;
        originalUrl: string;
        sketchedUrl?: string;
        description?: string;
    }[];
    items?: {
        id: string;
        category: string;
        description?: string;
        repairService?: string;
        estimatedPrice?: number;
        images: {
            id: string;
            originalUrl: string;
        }[];
    }[];
}

export interface UploadResponse {
    url: string;
}
