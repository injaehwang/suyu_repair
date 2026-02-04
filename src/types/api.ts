export interface OrderImageDto {
    url: string;
    sketchedUrl?: string;
    description: string;
}

export interface CreateOrderRequest {
    title?: string;
    category: string;
    description: string;
    images: OrderImageDto[];
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
}

export interface UploadResponse {
    url: string;
}
