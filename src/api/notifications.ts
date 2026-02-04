import axios from 'axios';

const API_URL = '/api';

export interface Notification {
    id: string;
    type: string;
    message: string;
    isRead: boolean;
    relatedId?: string;
    createdAt: string;
}

export async function getNotifications(userId: string) {
    const response = await axios.get<Notification[]>(`${API_URL}/notifications`, {
        params: { userId }
    });
    return response.data;
}

export async function markNotificationAsRead(id: string) {
    const response = await axios.patch(`${API_URL}/notifications/${id}/read`);
    return response.data;
}
