'use client';

import { MessageCircle } from 'lucide-react';

export function FloatingButton() {
    return (
        <a
            href="#"
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#FAE100] text-slate-900 shadow-lg hover:bg-[#FADB00] hover:shadow-xl transition-all hover:scale-105"
            aria-label="카카오톡 상담 채널"
        >
            <MessageCircle className="h-7 w-7 fill-slate-900 stroke-none" />
        </a>
    );
}
