'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Announcement {
    id: string;
    title: string;
    content: string;
}

export default function AnnouncementModal() {
    const { data: session } = useSession();
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!session?.user) return;

        const checkAndShowAnnouncement = async () => {
            try {
                // Fetch active announcement
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/announcements/active`);
                if (!res.ok) return;

                const text = await res.text();
                if (!text) return;

                const data = JSON.parse(text);
                if (!data) return;

                // Check if user has already viewed it
                const localStorageKey = `announcement_viewed_${data.id}`;
                const viewedLocally = localStorage.getItem(localStorageKey);

                if (viewedLocally) return;

                // Check server-side view status
                const viewCheckRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/announcements/${data.id}/viewed/${session.user.id}`
                );
                if (!viewCheckRes.ok) {
                    setAnnouncement(data);
                    setShow(true);
                    return;
                }

                const viewCheckData = await viewCheckRes.json();
                if (!viewCheckData.viewed) {
                    setAnnouncement(data);
                    setShow(true);
                }
            } catch (error) {
                console.error('Failed to fetch announcement', error);
            }
        };

        checkAndShowAnnouncement();
    }, [session]);

    const handleClose = async () => {
        if (!announcement || !session?.user) return;

        try {
            // Mark as viewed on server
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/announcements/${announcement.id}/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.id }),
            });

            // Mark as viewed locally
            localStorage.setItem(`announcement_viewed_${announcement.id}`, 'true');
        } catch (error) {
            console.error('Failed to mark announcement as viewed', error);
        }

        setShow(false);
    };

    if (!show || !announcement) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex items-start justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{announcement.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">공지사항</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {announcement.content}
                    </p>
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={handleClose}
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}
