'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FabricResponse } from '@/api/tailored';

interface FabricCardProps {
  fabric: FabricResponse;
  selected: boolean;
  onClick: () => void;
}

const SEASON_LABEL: Record<string, string> = {
  SPRING_SUMMER: '춘하',
  FALL_WINTER: '추동',
  ALL_SEASON: '사계절',
};

const PATTERN_LABEL: Record<string, string> = {
  SOLID: '솔리드',
  STRIPE: '스트라이프',
  CHECK: '체크',
  HERRINGBONE: '헤링본',
};

export function FabricCard({ fabric, selected, onClick }: FabricCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border-2 text-left transition-all w-full',
        selected
          ? 'border-blue-600 ring-2 ring-blue-200'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm',
      )}
    >
      {/* 원단 이미지 */}
      <div className="relative w-full aspect-[4/5] bg-slate-100 overflow-hidden">
        {fabric.imageUrl ? (
          <img
            src={fabric.imageUrl}
            alt={fabric.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm">
            이미지 없음
          </div>
        )}

        {/* 선택 체크 */}
        {selected && (
          <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1.5 shadow-md">
            <Check className="h-4 w-4 text-white" />
          </div>
        )}

        {/* 시즌 배지 */}
        <div className="absolute bottom-2 left-2">
          <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/90 text-slate-700 backdrop-blur-sm">
            {SEASON_LABEL[fabric.season] || fabric.season}
          </span>
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="p-3">
        <div className="font-bold text-sm text-slate-900 truncate">{fabric.name}</div>
        {fabric.brand && (
          <div className="text-[11px] text-slate-400 mt-0.5">{fabric.brand}</div>
        )}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
            {fabric.material}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
            {PATTERN_LABEL[fabric.pattern] || fabric.pattern}
          </span>
        </div>
      </div>
    </button>
  );
}
