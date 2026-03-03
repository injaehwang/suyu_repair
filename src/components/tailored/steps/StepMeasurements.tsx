'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MeasurementInput } from '../shared/MeasurementInput';
import {
  REQUIRED_MEASUREMENTS,
  OPTIONAL_MEASUREMENTS,
  BODY_TYPES,
  POSTURE_TYPES,
} from '../constants/measurements';
import type { Measurements, WizardAction } from '../wizard-types';

interface StepMeasurementsProps {
  measurements: Measurements;
  dispatch: React.Dispatch<WizardAction>;
}

export function StepMeasurements({ measurements, dispatch }: StepMeasurementsProps) {
  const [showExtra, setShowExtra] = useState(false);

  const handleChange = (key: keyof Measurements, value: any) => {
    dispatch({ type: 'SET_MEASUREMENT', key, value });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">신체 치수</h2>
      <p className="text-sm text-slate-500 mb-6">
        정확한 맞춤을 위해 신체 치수를 입력해 주세요.
      </p>

      {/* 측정 가이드 */}
      <div className="bg-blue-50 rounded-2xl p-4 mb-6">
        <h3 className="text-sm font-bold text-blue-900 mb-1">측정 가이드</h3>
        <p className="text-xs text-blue-700">
          줄자를 사용하여 자연스럽게 서 있는 자세에서 측정하세요.
          얇은 옷 위에서 측정하되, 너무 타이트하거나 느슨하지 않게 해 주세요.
        </p>
      </div>

      {/* 필수 치수 - 2열 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {REQUIRED_MEASUREMENTS.map(def => (
          <MeasurementInput
            key={def.key}
            def={def}
            value={measurements[def.key] as number | ''}
            onChange={(v) => handleChange(def.key, v)}
          />
        ))}
      </div>

      {/* 추가 정보 (접힘) */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowExtra(!showExtra)}
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <span>추가 정보 (선택)</span>
          {showExtra ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showExtra && (
          <div className="px-4 pb-4 space-y-4 border-t border-slate-100">
            {/* 키/몸무게 */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {OPTIONAL_MEASUREMENTS.map(def => (
                <MeasurementInput
                  key={def.key}
                  def={def}
                  value={measurements[def.key] as number | ''}
                  onChange={(v) => handleChange(def.key, v)}
                />
              ))}
            </div>

            {/* 체형 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">체형</label>
              <div className="flex flex-wrap gap-2">
                {BODY_TYPES.map(bt => (
                  <button
                    key={bt.value}
                    type="button"
                    onClick={() => handleChange('bodyType', bt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      measurements.bodyType === bt.value
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {bt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 자세 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">자세</label>
              <div className="flex flex-wrap gap-2">
                {POSTURE_TYPES.map(pt => (
                  <button
                    key={pt.value}
                    type="button"
                    onClick={() => handleChange('posture', pt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      measurements.posture === pt.value
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">참고사항</label>
              <textarea
                value={measurements.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="체형 특이사항이나 참고할 점이 있다면 적어주세요."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
