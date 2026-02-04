'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('결제 정보를 확인하고 있습니다...');

    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    useEffect(() => {
        if (!paymentKey || !orderId || !amount) {
            setStatus('error');
            setMessage('결제 정보가 누락되었습니다.');
            return;
        }

        async function confirmPayment() {
            try {
                const response = await fetch('/api/payments/confirm', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paymentKey,
                        orderId,
                        amount: Number(amount),
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Payment confirmation failed');
                }

                setStatus('success');
            } catch (error: any) {
                console.error(error);
                setStatus('error');
                setMessage(error.message || '결제 승인 중 오류가 발생했습니다.');
            }
        }

        confirmPayment();
    }, [paymentKey, orderId, amount]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">

                {status === 'loading' && (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">결제 확인 중</h2>
                        <p className="text-slate-500 text-sm">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <div className="bg-green-100 p-3 rounded-full mb-4">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">결제 성공!</h2>
                        <p className="text-slate-500 mb-6">주문이 성공적으로 결제되었습니다.</p>
                        <Link
                            href={`/orders/${orderId}`}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold w-full hover:bg-blue-700 transition-colors block"
                        >
                            주문 상세로 돌아가기
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="bg-red-100 p-3 rounded-full mb-4">
                            <AlertCircle className="w-12 h-12 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">결제 실패</h2>
                        <p className="text-slate-500 mb-6">{message}</p>
                        <Link
                            href={`/orders/${orderId}`}
                            className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-bold w-full hover:bg-slate-300 transition-colors block mb-2"
                        >
                            주문 상세로 돌아가기
                        </Link>
                        <div className="text-xs text-slate-400 mt-4">
                            고객센터에 문의해주세요.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
