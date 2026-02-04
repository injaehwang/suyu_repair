'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getNotifications, markNotificationAsRead, Notification } from '@/api/notifications';
import { Bell, ChevronLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user) {
            const userId = (session.user as any).id;
            if (userId) {
                fetchNotifications(userId);
            } else {
                console.error('User ID not found in session');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [session]);

    const fetchNotifications = (userId: string) => {
        getNotifications(userId)
            .then(setNotifications)
            .catch(error => {
                console.error('Failed to fetch notifications:', error);
            })
            .finally(() => setLoading(false));
    };

    const handleRead = async (notification: Notification) => {
        if (!notification.isRead) {
            await markNotificationAsRead(notification.id);
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
        }

        // Navigate based on type
        if (notification.type === 'INQUIRY_REPLY') {
            router.push(notification.relatedId ? `/inquiries/${notification.relatedId}` : '/inquiries');
        } else if (notification.type === 'STATUS_CHANGE') {
            // Find related order if possible, or just go to orders list
            // Assuming relatedId is orderId
            router.push(notification.relatedId ? `/orders/${notification.relatedId}` : '/orders');
        }
    };

    if (!session) return null;

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <header className="bg-white h-14 flex items-center px-4 border-b border-slate-100 sticky top-0 z-10">
                <Link href="/" className="mr-4">
                    <ChevronLeft className="w-6 h-6 text-slate-800" />
                </Link>
                <h1 className="text-lg font-bold text-slate-900">알림</h1>
            </header>

            <div className="p-4 space-y-3">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        onClick={() => handleRead(notification)}
                        className={cn(
                            "p-4 rounded-xl border cursor-pointer transition-all active:scale-[0.98]",
                            notification.isRead
                                ? "bg-white border-slate-100 opacity-60"
                                : "bg-white border-blue-100 shadow-sm ring-1 ring-blue-50"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div className={cn(
                                "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                                notification.isRead ? "bg-slate-300" : "bg-blue-500"
                            )} />
                            <div className="flex-1">
                                <p className={cn(
                                    "text-sm mb-1",
                                    notification.isRead ? "text-slate-600" : "text-slate-900 font-medium"
                                )}>
                                    {notification.message}
                                </p>
                                <span className="text-xs text-slate-400">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Bell className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm">알림이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
