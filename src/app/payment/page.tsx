'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2, CreditCard, Lock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function PaymentPage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const handlePayment = () => {
        setIsProcessing(true);
        // Mock payment delay
        setTimeout(() => {
            setIsProcessing(false);
            setIsComplete(true);
        }, 1500);
    };

    if (isComplete) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 w-full max-w-md text-center animate-in zoom-in-95 duration-300">
                    <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto animate-bounce-subtle">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">결제가 완료되었습니다</h1>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        주문해주셔서 감사합니다.<br />
                        빠른 시일 내에 안전하게 수거하겠습니다.
                    </p>
                    <Link href="/orders" className="w-full block">
                        <Button className="w-full h-14 text-base font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200">주문 내역 확인하기</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50/50 py-12">
            <div className="container mx-auto px-4 max-w-lg">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">안전 결제</h1>
                    <p className="text-slate-500 text-sm flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" /> 모든 결제 정보는 암호화되어 보호됩니다
                    </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 md:p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                    <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4 flex justify-between items-center">
                        주문 정보
                        <span className="text-xs font-normal text-slate-400">REQ-20240201-001</span>
                    </h2>

                    <div className="space-y-4">
                        <div className="flex justify-between text-slate-600">
                            <span>나이키 패딩 지퍼 교체</span>
                            <span className="font-medium">15,000원</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>수거/배송비</span>
                            <span className="font-medium">3,000원</span>
                        </div>
                        <div className="border-t border-slate-100 pt-4 flex justify-between items-center mt-4">
                            <span className="font-extrabold text-slate-900 text-lg">총 결제금액</span>
                            <span className="text-2xl font-extrabold text-blue-600">18,000원</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Button
                        size="lg"
                        className="w-full h-14 bg-[#FAE100] text-[#371D1E] hover:bg-[#FADB00] font-bold text-base rounded-2xl shadow-md border border-transparent hover:shadow-lg transition-all"
                        onClick={handlePayment}
                        isLoading={isProcessing}
                    >
                        카카오페이로 결제하기
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="w-full h-14 text-base font-semibold rounded-2xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                        onClick={handlePayment}
                        isLoading={isProcessing}
                    >
                        <CreditCard className="mr-2 h-5 w-5 text-slate-400 form-group-hover:text-slate-600" />
                        일반 결제
                    </Button>
                </div>
            </div>
        </div>
    );
}
