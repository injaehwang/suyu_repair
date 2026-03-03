'use client';

import { Pencil } from 'lucide-react';
import { JACKET_TYPE_OPTIONS } from '../constants/jacket-types';
import { DESIGN_OPTION_GROUPS, getDesignOptionLabel } from '../constants/design-options';
import { REQUIRED_MEASUREMENTS, OPTIONAL_MEASUREMENTS } from '../constants/measurements';
import type { WizardState, WizardAction } from '../wizard-types';
import type { FabricResponse } from '@/api/tailored';

interface StepReviewProps {
  state: WizardState;
  fabric: FabricResponse | undefined;
  dispatch: React.Dispatch<WizardAction>;
}

export function StepReview({ state, fabric, dispatch }: StepReviewProps) {
  const jacket = JACKET_TYPE_OPTIONS.find(j => j.value === state.jacketType);

  const goToStep = (step: number) => dispatch({ type: 'SET_STEP', step });

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">최종 확인</h2>
      <p className="text-sm text-slate-500 mb-6">주문 내용을 확인하고 요청사항을 추가하세요.</p>

      <div className="space-y-4">
        {/* 자켓 종류 */}
        <ReviewSection title="자켓 종류" onEdit={() => goToStep(0)}>
          <div className="flex items-center gap-3">
            {jacket?.image && (
              <img src={jacket.image} alt="" className="w-16 h-16 object-contain bg-slate-50 rounded-lg" />
            )}
            <div>
              <div className="font-bold text-slate-900">{jacket?.label}</div>
              <div className="text-xs text-slate-500">{jacket?.description}</div>
            </div>
          </div>
          {state.referenceImages.length > 0 && (
            <div className="flex gap-2 mt-3">
              {state.referenceImages.map((url, i) => (
                <img key={i} src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
              ))}
            </div>
          )}
        </ReviewSection>

        {/* 원단 */}
        <ReviewSection title="원단" onEdit={() => goToStep(1)}>
          {fabric ? (
            <div className="flex items-center gap-3">
              {fabric.imageUrl && (
                <img src={fabric.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg" />
              )}
              <div>
                <div className="font-bold text-slate-900">{fabric.name}</div>
                <div className="text-xs text-slate-500">
                  {fabric.material} · {fabric.brand || ''}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-slate-400 text-sm">선택된 원단 없음</span>
          )}
        </ReviewSection>

        {/* 디자인 */}
        <ReviewSection title="디자인 옵션" onEdit={() => goToStep(2)}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {DESIGN_OPTION_GROUPS.flatMap(group =>
              group.options
                .filter(opt => opt.type !== 'text' || state.designOptions[opt.key as keyof typeof state.designOptions])
                .map(opt => (
                  <div key={opt.key} className="flex justify-between">
                    <span className="text-slate-500">{opt.label}</span>
                    <span className="font-medium text-slate-900">
                      {getDesignOptionLabel(opt.key, state.designOptions[opt.key as keyof typeof state.designOptions])}
                    </span>
                  </div>
                ))
            )}
          </div>
        </ReviewSection>

        {/* 치수 */}
        <ReviewSection title="신체 치수" onEdit={() => goToStep(3)}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-sm">
            {REQUIRED_MEASUREMENTS.map(m => (
              <div key={m.key} className="flex justify-between">
                <span className="text-slate-500">{m.label}</span>
                <span className="font-medium text-slate-900">
                  {state.measurements[m.key]}{m.unit}
                </span>
              </div>
            ))}
            {OPTIONAL_MEASUREMENTS.map(m => {
              const val = state.measurements[m.key];
              if (!val) return null;
              return (
                <div key={m.key} className="flex justify-between">
                  <span className="text-slate-500">{m.label}</span>
                  <span className="font-medium text-slate-900">{val}{m.unit}</span>
                </div>
              );
            })}
          </div>
        </ReviewSection>

        {/* 특별 요청사항 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-900 mb-3">특별 요청사항</h3>
          <textarea
            value={state.specialRequests}
            onChange={(e) => dispatch({ type: 'SET_SPECIAL_REQUESTS', value: e.target.value })}
            placeholder="원하시는 스타일이나 참고사항을 자유롭게 적어주세요."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 resize-none h-28 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 에러 */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            {state.error}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  children,
  onEdit,
}: {
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          <Pencil className="h-3 w-3" />
          수정
        </button>
      </div>
      {children}
    </div>
  );
}
