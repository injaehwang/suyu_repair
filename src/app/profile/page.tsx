'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, User, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/api/auth/signin');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="max-w-3xl mx-auto p-4 md:p-6">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-700" />
                    </Link>
                    <h1 className="text-2xl font-bold">내 정보</h1>
                </div>

                {/* User Info Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
                    <div className="flex items-center gap-4">
                        {session?.user?.image ? (
                            <img
                                src={session.user.image}
                                alt="Profile"
                                className="w-16 h-16 rounded-full"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="w-8 h-8 text-blue-600" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-bold">{session?.user?.name || '사용자'}</h2>
                            <p className="text-sm text-slate-500">{session?.user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-3">
                    <Link href="/orders">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                                    <Package className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">주문 내역</h3>
                                    <p className="text-sm text-slate-500">수선 요청 및 진행 상황 확인</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href="/profile/addresses">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">배송지 관리</h3>
                                    <p className="text-sm text-slate-500">배송지 추가 및 수정</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Sign Out Button */}
                <div className="mt-8">
                    <Button
                        onClick={() => router.push('/api/auth/signout')}
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        로그아웃
                    </Button>
                </div>
            </div>
        </div>
    );
}
