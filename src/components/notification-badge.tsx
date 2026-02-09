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
                "relative flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-full text-[13px] sm:text-sm font-semibold transition-all duration-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                className
            )}
        >
            <span>알림</span>
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 inline-flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 text-[10px] font-bold leading-none text-white bg-rose-500 rounded-full shadow-sm border-2 border-white animate-in zoom-in duration-300">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Link>
    );
}
