'use client';

import { DesignOptionGroupRenderer } from '../shared/DesignOptionGroup';
import { DESIGN_OPTION_GROUPS } from '../constants/design-options';
import type { DesignOptions, WizardAction } from '../wizard-types';

interface StepDesignOptionsProps {
  designOptions: DesignOptions;
  dispatch: React.Dispatch<WizardAction>;
}

export function StepDesignOptions({ designOptions, dispatch }: StepDesignOptionsProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">디자인 옵션</h2>
      <p className="text-sm text-slate-500 mb-6">
        자켓의 세부 디자인을 선택하세요. 기본값이 미리 설정되어 있습니다.
      </p>

      {DESIGN_OPTION_GROUPS.map(group => (
        <DesignOptionGroupRenderer
          key={group.title}
          group={group}
          values={designOptions}
          onChange={(key, value) =>
            dispatch({ type: 'SET_DESIGN_OPTION', key, value })
          }
        />
      ))}
    </div>
  );
}
