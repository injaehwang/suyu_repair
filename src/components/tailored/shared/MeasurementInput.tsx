'use client';

import type { MeasurementDef } from '../constants/measurements';

interface MeasurementInputProps {
  def: MeasurementDef;
  value: number | '';
  onChange: (value: number | '') => void;
}

export function MeasurementInput({ def, value, onChange }: MeasurementInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {def.label}
        {def.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === '' ? '' : Number(v));
          }}
          placeholder={def.hint}
          className="w-full px-4 py-2.5 pr-12 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          {def.unit}
        </span>
      </div>
      <p className="text-[11px] text-slate-400 mt-1">보통 {def.hint}</p>
    </div>
  );
}
