'use client';

import { User, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSession, signOut } from 'next-auth/react';
import NotificationBadge from '@/components/notification-badge';
import { useState } from 'react';
import { LoginModal } from '@/components/auth/LoginModal';

export function Header() {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const { data: session } = useSession();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    return (
        <>
            <header
                className={cn(
                    "w-full z-50 transition-colors",
                    isHome ? "absolute top-0 border-b border-white/10" : "sticky top-0 bg-white/80 backdrop-blur-sm border-b border-slate-200"
                )}
            >
                <div className="container mx-auto flex h-18 items-center justify-between px-4 lg:px-8">
                    <Link
                        href="/"
                        className={cn(
                            "text-2xl font-bold tracking-tighter transition-colors flex items-center gap-2",
                            isHome ? "text-white" : "text-slate-900"
                        )}
                    >
                        suyu
                    </Link>
                    <div className="flex items-center gap-1 sm:gap-2">
                        {session ? (
                            <div className="flex items-center gap-1 sm:gap-2">
                                <nav className="flex items-center gap-1 mr-1 sm:mr-2">
                                    {[
                                        { href: '/inquiries', label: '1:1 문의' },
                                        { href: '/orders', label: '나의 요청' },
                                    ].map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={cn(
                                                "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                                                isHome
                                                    ? "text-white/90 hover:bg-white/10 hover:text-white"
                                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </nav>

                                {/* Divider for desktop */}
                                <div className={cn("hidden md:block w-px h-4 mx-2", isHome ? "bg-white/20" : "bg-slate-200")}></div>

                                <NotificationBadge className={isHome ? "text-white hover:bg-white/10 hover:text-white" : ""} />

                                <Link
                                    href="/profile"
                                    className={cn(
                                        "flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all duration-200 group ring-1 ring-transparent hover:ring-slate-200",
                                        isHome
                                            ? "hover:bg-white/10 text-white"
                                            : "hover:bg-white hover:shadow-sm text-slate-700 bg-slate-50/50"
                                    )}
                                >
                                    {session.user?.image ? (
                                        <img
                                            src={session.user.image}
                                            alt={session.user.name || ''}
                                            className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white shadow-sm">
                                            <User className="h-4 w-4 text-slate-500" />
                                        </div>
                                    )}
                                    <span className="text-sm font-bold hidden sm:block max-w-[100px] truncate">
                                        {session.user?.name}
                                    </span>
                                </Link>

                                <button
                                    onClick={() => signOut()}
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                                        isHome
                                            ? "text-white/70 hover:bg-white/10 hover:text-white"
                                            : "text-slate-400 hover:bg-slate-100 hover:text-red-500"
                                    )}
                                    title="로그아웃"
                                >
                                    <LogOut className="h-5 w-5 stroke-[2.5px]" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsLoginModalOpen(true)}
                                className={cn(
                                    "flex items-center gap-2 pl-4 pr-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5",
                                    isHome
                                        ? "bg-white text-slate-900 override-home"
                                        : "bg-slate-900 text-white hover:bg-slate-800"
                                )}
                            >
                                <div className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center",
                                    isHome ? "bg-slate-100 text-slate-900" : "bg-white/20 text-white"
                                )}>
                                    <LogIn className="h-3.5 w-3.5" />
                                </div>
                                <span>로그인</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </>
    );
}
