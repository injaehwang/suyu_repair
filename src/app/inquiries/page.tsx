'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, MessageCircle } from 'lucide-react';
import { Inquiry, getMyInquiries } from '@/api/inquiries';
import { cn } from '@/lib/utils';

export default function InquiriesPage() {
    const { data: session } = useSession();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.email) {
            // WE NEED USER ID, but session might only have email depending on config.
            // Assuming we can fetch by email or we have ID.
            // Temporary: We might need to fetch user ID first or backend supports email.
            // Backend `findAll` currently takes `userId`.
            // Let's assume we can get userId from session if properly configured, or we fetch it.
            // For now, let's try to fetch using the ID if available, else we might need to fix backend to allow email.
            if ((session.user as any).id) {
                getMyInquiries((session.user as any).id).then(setInquiries).finally(() => setLoading(false));
            }
        }
    }, [session]);

    if (!session) {
        return <div className="p-4 text-center">로그인이 필요합니다.</div>;
    }

    return (
        <div className="pb-24 bg-slate-50 min-h-screen">
            <div className="pt-8 px-4 mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">1:1 문의</h1>
                <Link href="/inquiries/new" className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>문의하기</span>
                </Link>
            </div>

            <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {inquiries.map((inquiry) => (
                    <Link href={`/inquiries/${inquiry.id}`} key={inquiry.id} className="block group">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 group-hover:border-blue-200 group-hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-blue-600 mb-1">{inquiry.category}</span>
                                    {inquiry.order && (
                                        <span className="text-xs text-slate-400 mb-2">
                                            관련 주문: {inquiry.order.title}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-slate-400">
                                    {new Date(inquiry.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-slate-800 text-sm mb-4 whitespace-pre-wrap line-clamp-3 group-hover:text-blue-600 transition-colors">{inquiry.content}</p>

                            {inquiry.answer ? (
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                                            <MessageCircle className="w-3 h-3 text-blue-600" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">답변 완료</span>
                                        <span className="text-xs text-slate-400 ml-auto">
                                            {inquiry.answeredAt && new Date(inquiry.answeredAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 text-sm whitespace-pre-wrap pl-7 line-clamp-2">
                                        {inquiry.answer}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-xs text-slate-400 text-center py-2 bg-slate-50 rounded-lg">
                                    답변 대기 중입니다.
                                </div>
                            )}
                        </div>
                    </Link>
                ))}

                {!loading && inquiries.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <MessageCircle className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm">문의 내역이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
