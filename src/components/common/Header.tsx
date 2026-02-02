'use client';

import { User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
    const pathname = usePathname();
    const isHome = pathname === '/';

    return (
        <header
            className={cn(
                "w-full z-50 transition-colors",
                isHome ? "absolute top-0 border-b border-white/10" : "sticky top-0 bg-white/80 backdrop-blur-sm border-b border-slate-200"
            )}
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link
                    href="/"
                    className={cn(
                        "text-xl font-bold tracking-tight transition-colors",
                        isHome ? "text-white" : "text-slate-900"
                    )}
                >
                    suyu repair
                </Link>
                <button
                    className={cn(
                        "rounded-full p-2 transition-colors",
                        isHome ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
                    )}
                    aria-label="마이페이지"
                >
                    <User className="h-6 w-6" />
                </button>
            </div>
        </header>
    );
}
