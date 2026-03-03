'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { getTailoredOrdersByUser } from '@/api/tailored';
import Link from 'next/link';
import { Shirt, ChevronRight } from 'lucide-react';

const TAILORED_STATUS_LABELS: Record<string, string> = {
  CONSULTATION_REQUESTED: '상담 요청',
  MEASUREMENT_PENDING: '채촌 대기',
  MEASUREMENT_COMPLETED: '채촌 완료',
  FABRIC_SELECTION: '원단 선택',
  DESIGN_CONFIRMATION: '디자인 확정',
  ESTIMATE_PROVIDED: '견적 제공',
  PAYMENT_COMPLETED: '결제 완료',
  IN_PRODUCTION: '제작 중',
  FIRST_FITTING: '1차 가봉',
  IN_ADJUSTMENT: '수정 중',
  FINAL_FITTING: '최종 가봉',
  COMPLETED_PRODUCTION: '제작 완료',
  DELIVERY_STARTED: '배송 시작',
  COMPLETED: '완료',
  CANCELED: '취소',
};

const JACKET_TYPE_LABELS: Record<string, string> = {
  SINGLE_BREASTED: '싱글 브레스트',
  DOUBLE_BREASTED: '더블 브레스트',
  TRENCH_COAT: '트렌치코트',
};

function getStatusColor(status: string) {
  if (status === 'COMPLETED') return 'bg-green-100 text-green-700';
  if (status === 'CANCELED') return 'bg-red-100 text-red-700';
  if (status === 'IN_PRODUCTION' || status === 'IN_ADJUSTMENT') return 'bg-yellow-100 text-yellow-700';
  return 'bg-blue-100 text-blue-700';
}

export default function TailoredOrdersPage() {
  const { data: session, status: authStatus } = useSession();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['tailored-orders', session?.user?.email],
    queryFn: () => getTailoredOrdersByUser(session?.user?.email || ''),
    enabled: !!session?.user?.email,
  });

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Shirt className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">로그인이 필요합니다</h2>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">맞춤 주문 내역</h1>
        <Link
          href="/tailored"
          className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          새 주문
        </Link>
      </div>

      {!orders?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Shirt className="h-10 w-10 text-blue-300 mb-6" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">맞춤 주문 내역이 없습니다</h2>
          <p className="text-slate-500 mb-8 max-w-xs">
            체형에 맞는 자켓을 맞춤 제작해 보세요.
          </p>
          <Link
            href="/tailored"
            className="px-8 py-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
          >
            맞춤 주문 시작하기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} href={`/tailored-orders/${order.id}`}>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">{order.orderNumber}</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
                    {TAILORED_STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {JACKET_TYPE_LABELS[order.jacketType] || order.jacketType}
                    </h3>
                    {order.fabric && (
                      <p className="text-sm text-slate-500 mt-0.5">
                        {order.fabric.name} · {order.fabric.color}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300" />
                </div>
                {order.finalPrice && (
                  <div className="mt-2 text-right">
                    <span className="text-lg font-bold text-slate-900">
                      {order.finalPrice.toLocaleString()}원
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
