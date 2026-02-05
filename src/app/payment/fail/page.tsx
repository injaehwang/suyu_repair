'use client';

import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { Suspense } from 'react';

export default function PaymentFailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">Loading...</div>}>
            <PaymentFailContent />
        </Suspense>
    );
}

function PaymentFailContent() {
    const searchParams = useSearchParams();
    const message = searchParams.get('message') || '알 수 없는 오류가 발생했습니다.';
    const code = searchParams.get('code');

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
                <div className="bg-red-100 p-3 rounded-full mb-4 inline-flex">
                    <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">결제 실패</h2>
                <p className="text-slate-500 mb-1">{message}</p>
                {code && <p className="text-xs text-slate-400 mb-6 font-mono">{code}</p>}

                <Link
                    href="/orders"
                    className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-bold w-full hover:bg-slate-300 transition-colors block"
                >
                    목록으로 돌아가기
                </Link>
            </div>
        </div>
    );
}
