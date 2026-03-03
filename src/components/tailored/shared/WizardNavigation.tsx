'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  nextLabel?: string;
  isSubmitting?: boolean;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  canNext,
  onPrev,
  onNext,
  nextLabel,
  isSubmitting,
}: WizardNavigationProps) {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between gap-4 pt-6 mt-6 border-t border-slate-100">
      {/* 이전 버튼 */}
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirst}
        className={cn(
          'flex items-center gap-1 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors',
          isFirst
            ? 'invisible'
            : 'text-slate-600 hover:bg-slate-100',
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        이전
      </button>

      {/* 다음 버튼 */}
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext || isSubmitting}
        className={cn(
          'flex items-center gap-1 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors',
          canNext && !isSubmitting
            ? isLast
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-900 text-white hover:bg-slate-800'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed',
        )}
      >
        {isSubmitting ? (
          <>
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            제출 중...
          </>
        ) : (
          <>
            {nextLabel || (isLast ? '주문 요청하기' : '다음')}
            {!isLast && <ChevronRight className="h-4 w-4" />}
          </>
        )}
      </button>
    </div>
  );
}
