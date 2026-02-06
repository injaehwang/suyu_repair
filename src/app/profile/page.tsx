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
        <div className="min-h-screen bg-slate-50 pb-20 pt-8 sm:pt-12">
            <div className="max-w-2xl mx-auto px-4 md:px-0">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="group p-2 -ml-2 hover:bg-white hover:shadow-sm rounded-full transition-all duration-200">
                        <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-900" />
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">내 정보</h1>
                </div>

                {/* User Info Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-8 flex flex-col items-center text-center sm:text-left sm:flex-row sm:items-start gap-6">
                    <div className="shrink-0 relative">
                        {session?.user?.image ? (
                            <img
                                src={session.user.image}
                                alt="Profile"
                                className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-inner"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-slate-50 shadow-inner">
                                <User className="w-10 h-10 text-slate-400" />
                            </div>
                        )}
                        <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 pt-2 space-y-1">
                        <h2 className="text-2xl font-bold text-slate-900">{session?.user?.name || '사용자'}</h2>
                        <p className="text-slate-500 font-medium">{session?.user?.email}</p>
                        <div className="pt-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                일반 회원
                            </span>
                        </div>
                    </div>
                </div>

                {/* Menu Grid */}
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">메뉴</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    <Link href="/orders" className="group">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full hover:shadow-md hover:border-blue-100 hover:-translate-y-1 transition-all duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                                <Package className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 mb-1">주문 내역</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">진행 중인 수선과 과거 주문 내역을 확인하세요</p>
                        </div>
                    </Link>

                    <Link href="/profile/addresses" className="group">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full hover:shadow-md hover:border-green-100 hover:-translate-y-1 transition-all duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors duration-300">
                                <MapPin className="w-6 h-6 text-green-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 mb-1">배송지 관리</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">자주 사용하는 배송지를 등록하고 관리하세요</p>
                        </div>
                    </Link>
                </div>

                {/* Account Actions */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
                    <button
                        onClick={() => router.push('/api/auth/signout')}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors group"
                    >
                        <span className="font-medium text-slate-600 group-hover:text-slate-900">로그아웃</span>
                        <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                    </button>
                    {/* Placeholder for future delete account */}
                    {/* <button className="w-full flex items-center justify-between p-5 text-left hover:bg-red-50 transition-colors group">
                         <span className="font-medium text-slate-400 group-hover:text-red-500">회원 탈퇴</span>
                    </button> */}
                </div>
            </div>
        </div>
    );
}
