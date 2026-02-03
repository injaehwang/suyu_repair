export interface OrderImageDto {
    url: string;
    sketchedUrl?: string;
    description: string;
}

export interface CreateOrderRequest {
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
