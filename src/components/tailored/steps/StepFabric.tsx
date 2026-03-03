'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFabrics, type FabricResponse } from '@/api/tailored';
import { FabricCard } from '../shared/FabricCard';
import type { WizardAction } from '../wizard-types';

interface StepFabricProps {
  fabricId: string;
  dispatch: React.Dispatch<WizardAction>;
}

const MATERIAL_FILTERS = ['전체', '울', '울혼방', '린넨', '코튼', '폴리에스터'];
const SEASON_FILTERS = [
  { value: '', label: '전체' },
  { value: 'SPRING_SUMMER', label: '춘하' },
  { value: 'FALL_WINTER', label: '추동' },
  { value: 'ALL_SEASON', label: '사계절' },
];
const PATTERN_FILTERS = [
  { value: '', label: '전체' },
  { value: 'SOLID', label: '솔리드' },
  { value: 'STRIPE', label: '스트라이프' },
  { value: 'CHECK', label: '체크' },
  { value: 'HERRINGBONE', label: '헤링본' },
];

export function StepFabric({ fabricId, dispatch }: StepFabricProps) {
  const [material, setMaterial] = useState('');
  const [season, setSeason] = useState('');
  const [pattern, setPattern] = useState('');

  const filters: Record<string, string> = {};
  if (material) filters.material = material;
  if (season) filters.season = season;
  if (pattern) filters.pattern = pattern;

  const { data: fabrics = [], isLoading } = useQuery({
    queryKey: ['fabrics', filters],
    queryFn: () => getFabrics(Object.keys(filters).length ? filters : undefined),
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">원단 선택</h2>
      <p className="text-sm text-slate-500 mb-6">자켓에 사용할 원단을 선택하세요.</p>

      {/* 필터 */}
      <div className="space-y-3 mb-6">
        {/* 소재 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {MATERIAL_FILTERS.map(m => {
            const val = m === '전체' ? '' : m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMaterial(val)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  material === val
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>

        {/* 시즌 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {SEASON_FILTERS.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSeason(s.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                season === s.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* 패턴 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {PATTERN_FILTERS.map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPattern(p.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                pattern === p.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 원단 갤러리 - Pinterest 스타일 */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : fabrics.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p>조건에 맞는 원단이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {fabrics.filter(f => f.isAvailable).map(fabric => (
            <FabricCard
              key={fabric.id}
              fabric={fabric}
              selected={fabricId === fabric.id}
              onClick={() => dispatch({ type: 'SET_FABRIC', fabricId: fabric.id })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
