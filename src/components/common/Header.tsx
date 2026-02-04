'use client';

import { User, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSession, signIn, signOut } from 'next-auth/react';
import NotificationBadge from '@/components/notification-badge';

export function Header() {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const { data: session } = useSession();

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
                <div className="flex items-center gap-4">
                    {session ? (
                        <div className="flex items-center gap-3">
                            {session.user?.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || ''}
                                    className="h-8 w-8 rounded-full border border-slate-200"
                                />
                            ) : (
                                <div className="rounded-full bg-slate-100 p-2">
                                    <User className="h-5 w-5 text-slate-700" />
                                </div>
                            )}
                            <Link
                                href="/inquiries"
                                className={cn(
                                    "text-sm font-medium hover:underline mr-2",
                                    isHome ? "text-white" : "text-slate-700"
                                )}
                            >
                                1:1 문의
                            </Link>
                            <Link
                                href="/orders"
                                className={cn(
                                    "text-sm font-medium hover:underline",
                                    isHome ? "text-white" : "text-slate-700"
                                )}
                            >
                                나의 요청
                            </Link>
                            <NotificationBadge />
                            <Link
                                href="/profile"
                                className={cn(
                                    "text-sm font-medium hover:underline hidden md:block",
                                    isHome ? "text-white" : "text-slate-700"
                                )}
                            >
                                {session.user?.name}
                            </Link>
                            <button
                                onClick={() => signOut()}
                                className={cn(
                                    "rounded-full p-2 transition-colors",
                                    isHome ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-700"
                                )}
                                aria-label="로그아웃"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn('google')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300",
                                isHome
                                    ? "bg-white text-blue-600 hover:bg-blue-50"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            )}
                        >
                            <LogIn className="h-4 w-4" />
                            <span>로그인</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
