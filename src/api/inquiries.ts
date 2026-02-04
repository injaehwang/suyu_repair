import axios from 'axios';

const API_URL = '/api';

export interface CreateInquiryDto {
    userId: string;
    orderId?: string;
    category: string;
    content: string;
}

export interface Inquiry {
    id: string;
    category: string;
    content: string;
    answer?: string;
    answeredAt?: string;
    createdAt: string;
    order?: {
        id: string;
        title: string;
    };
}

export async function createInquiry(data: CreateInquiryDto) {
    const response = await axios.post(`${API_URL}/inquiries`, data);
    return response.data;
}

export async function getMyInquiries(userId: string) {
    const response = await axios.get<Inquiry[]>(`${API_URL}/inquiries`, {
        params: { userId }
    });
    return response.data;
}

export async function getInquiry(id: string) {
    const response = await axios.get<Inquiry>(`${API_URL}/inquiries/${id}`);
    return response.data;
}
