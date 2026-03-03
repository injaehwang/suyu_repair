'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisualOptionCardProps {
  image?: string;
  label: string;
  description?: string;
  features?: string[];
  selected: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  disabledLabel?: string;
}

export function VisualOptionCard({
  image,
  label,
  description,
  features,
  selected,
  onClick,
  size = 'md',
  disabled = false,
  disabledLabel,
}: VisualOptionCardProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border-2 text-left transition-all',
        disabled
          ? 'border-slate-200 opacity-60 cursor-not-allowed'
          : selected
            ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-sm',
      )}
    >
      {/* 이미지 영역 */}
      {image && (
        <div
          className={cn(
            'relative w-full bg-slate-100 flex items-center justify-center overflow-hidden',
            size === 'sm' && 'h-24',
            size === 'md' && 'h-36',
            size === 'lg' && 'h-52',
          )}
        >
          <img
            src={image}
            alt={label}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* 선택 체크 오버레이 */}
          {selected && !disabled && (
            <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
              <Check className="h-3.5 w-3.5 text-white" />
            </div>
          )}
          {/* 비활성 오버레이 */}
          {disabled && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="px-3 py-1.5 bg-white/90 rounded-full text-xs font-bold text-slate-600">
                {disabledLabel || '준비중'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 텍스트 영역 */}
      <div className="p-3">
        <div className={cn(
          'font-bold text-slate-900',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base',
        )}>
          {label}
        </div>
        {description && (
          <div className={cn(
            'text-slate-500 mt-0.5 line-clamp-2',
            size === 'sm' ? 'text-[10px]' : 'text-xs',
          )}>
            {description}
          </div>
        )}
        {features && features.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {features.map(f => (
              <span key={f} className="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 text-slate-600">
                {f}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 선택 체크 (이미지 없을 때) */}
      {!image && selected && (
        <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
          <Check className="h-3.5 w-3.5 text-white" />
        </div>
      )}
    </button>
  );
}
