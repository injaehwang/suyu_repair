'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getNotifications, Notification } from '@/api/notifications';

interface NotificationBadgeProps {
    className?: string;
}

export default function NotificationBadge({ className }: NotificationBadgeProps) {
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
        <Link
            href="/notifications"
            className={cn(
                "relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100/80 transition-all duration-200 text-slate-600 hover:text-slate-900",
                className
            )}
        >
            <Bell className="w-5 h-5 stroke-[2.5px]" />
            {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white px-1 shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Link>
    );
}
