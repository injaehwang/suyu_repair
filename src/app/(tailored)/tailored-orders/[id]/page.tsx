'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getTailoredOrder } from '@/api/tailored';
import Link from 'next/link';
import { ArrowLeft, Shirt, Ruler, Scissors, Truck } from 'lucide-react';

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

const STATUS_STEPS = [
  'CONSULTATION_REQUESTED',
  'MEASUREMENT_COMPLETED',
  'FABRIC_SELECTION',
  'DESIGN_CONFIRMATION',
  'PAYMENT_COMPLETED',
  'IN_PRODUCTION',
  'FIRST_FITTING',
  'COMPLETED_PRODUCTION',
  'DELIVERY_STARTED',
  'COMPLETED',
];

export default function TailoredOrderDetailPage() {
  const { id } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ['tailored-order', id],
    queryFn: () => getTailoredOrder(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-slate-500">주문을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/tailored-orders" className="p-2 rounded-full hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{order.orderNumber}</h1>
          <p className="text-sm text-slate-500">
            {JACKET_TYPE_LABELS[order.jacketType]} · {new Date(order.createdAt).toLocaleDateString('ko-KR')}
          </p>
        </div>
      </div>

      {/* Status Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="font-bold text-slate-900 mb-4">진행 상태</h2>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {STATUS_STEPS.map((step, idx) => (
            <div key={step} className="flex items-center flex-shrink-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                idx <= currentStepIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-400'
              }`}>
                {idx + 1}
              </div>
              {idx < STATUS_STEPS.length - 1 && (
                <div className={`w-4 h-0.5 ${
                  idx < currentStepIndex ? 'bg-blue-600' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm font-medium text-blue-600">
          {TAILORED_STATUS_LABELS[order.status]}
        </p>
      </div>

      {/* Measurement */}
      {order.measurement && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Ruler className="h-5 w-5 text-slate-600" />
            <h2 className="font-bold text-slate-900">채촌 데이터</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['가슴둘레', order.measurement.chest],
              ['어깨너비', order.measurement.shoulder],
              ['소매길이', order.measurement.sleeveLength],
              ['자켓기장', order.measurement.jacketLength],
              ['허리둘레', order.measurement.waist],
              ['엉덩이둘레', order.measurement.hip],
              ['목둘레', order.measurement.neck],
              ['팔뚝둘레', order.measurement.bicep],
              ['손목둘레', order.measurement.wrist],
              ['등판너비', order.measurement.backWidth],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-900">{value}cm</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fabric */}
      {order.fabric && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Scissors className="h-5 w-5 text-slate-600" />
            <h2 className="font-bold text-slate-900">선택 원단</h2>
          </div>
          <div className="flex gap-4">
            {order.fabric.imageUrl && (
              <img
                src={order.fabric.imageUrl}
                alt={order.fabric.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
            )}
            <div>
              <h3 className="font-bold text-slate-900">{order.fabric.name}</h3>
              <p className="text-sm text-slate-500">{order.fabric.material} · {order.fabric.color}</p>
              {order.fabric.brand && (
                <p className="text-sm text-slate-500">{order.fabric.brand}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fittings */}
      {order.fittings && order.fittings.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="font-bold text-slate-900 mb-4">가봉 일정</h2>
          <div className="space-y-3">
            {order.fittings.map(fitting => (
              <div key={fitting.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <span className="font-medium text-slate-900">{fitting.fittingNumber}차 가봉</span>
                  <span className="text-sm text-slate-500 ml-2">
                    {new Date(fitting.scheduledDate).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  fitting.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  fitting.status === 'CANCELED' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {fitting.status === 'SCHEDULED' ? '예약됨' :
                   fitting.status === 'COMPLETED' ? '완료' :
                   fitting.status === 'CANCELED' ? '취소' : '변경됨'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      {(order.estimatedPrice || order.finalPrice) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h2 className="font-bold text-slate-900 mb-3">금액</h2>
          {order.estimatedPrice && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">예상 금액</span>
              <span className="text-slate-700">{order.estimatedPrice.toLocaleString()}원</span>
            </div>
          )}
          {order.finalPrice && (
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-slate-100">
              <span className="text-slate-900">최종 금액</span>
              <span className="text-blue-600">{order.finalPrice.toLocaleString()}원</span>
            </div>
          )}
        </div>
      )}

      {/* Delivery */}
      {order.trackingNumber && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="h-5 w-5 text-slate-600" />
            <h2 className="font-bold text-slate-900">배송 정보</h2>
          </div>
          <p className="text-sm text-slate-600">
            {order.carrier} · {order.trackingNumber}
          </p>
        </div>
      )}

      {/* Reference Images */}
      {order.images && order.images.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">참고 이미지</h2>
          <div className="grid grid-cols-3 gap-3">
            {order.images.map(img => (
              <div key={img.id} className="aspect-square rounded-xl overflow-hidden">
                <img src={img.imageUrl} alt={img.description || ''} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Requests */}
      {order.specialRequests && (
        <div className="bg-slate-50 rounded-2xl p-4 mt-6">
          <h3 className="text-sm font-bold text-slate-700 mb-1">특별 요청사항</h3>
          <p className="text-sm text-slate-600">{order.specialRequests}</p>
        </div>
      )}
    </div>
  );
}
