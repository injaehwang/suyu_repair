'use client';

import { VisualOptionCard } from './VisualOptionCard';
import type { DesignOptionGroup as GroupType, DesignOptionDef } from '../constants/design-options';
import type { DesignOptions } from '../wizard-types';

interface DesignOptionGroupProps {
  group: GroupType;
  values: DesignOptions;
  onChange: (key: keyof DesignOptions, value: any) => void;
}

export function DesignOptionGroupRenderer({ group, values, onChange }: DesignOptionGroupProps) {
  return (
    <div className="mb-8">
      <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span>{group.icon}</span>
        {group.title}
      </h3>
      <div className="space-y-6">
        {group.options.map(opt => (
          <DesignOptionField
            key={opt.key}
            option={opt}
            value={values[opt.key as keyof DesignOptions]}
            onChange={(val) => onChange(opt.key as keyof DesignOptions, val)}
          />
        ))}
      </div>
    </div>
  );
}

function DesignOptionField({
  option,
  value,
  onChange,
}: {
  option: DesignOptionDef;
  value: any;
  onChange: (val: any) => void;
}) {
  if (option.type === 'text') {
    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">{option.label}</label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={option.key === 'monogram' ? '이니셜 입력 (선택)' : '입력'}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{option.label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {option.choices?.map(choice => (
          <VisualOptionCard
            key={String(choice.value)}
            image={choice.image}
            label={choice.label}
            description={choice.description}
            selected={value === choice.value}
            onClick={() => onChange(choice.value)}
            size="md"
          />
        ))}
      </div>
    </div>
  );
}
