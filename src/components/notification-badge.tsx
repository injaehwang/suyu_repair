'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Bell } from 'lucide-react';
import { getNotifications, Notification } from '@/api/notifications';

export default function NotificationBadge() {
    const { data: session } = useSession();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (session?.user && (session.user as any).id) {
            getNotifications((session.user as any).id).then(notifications => {
                const unread = notifications.filter(n => !n.isRead).length;
                setUnreadCount(unread);
            });
        }
    }, [session]);

    return (
        <Link href="/notifications" className="relative p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Link>
    );
}
