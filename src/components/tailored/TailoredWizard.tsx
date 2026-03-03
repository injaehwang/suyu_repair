'use client';

import { useReducer, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Shirt } from 'lucide-react';

import { Stepper } from '@/components/ui/stepper';
import {
  createTailoredOrder,
  updateTailoredOrder,
  createTailoredMeasurement,
  getFabrics,
} from '@/api/tailored';

import {
  WIZARD_STEPS,
  REQUIRED_MEASUREMENT_KEYS,
  type WizardState,
} from './wizard-types';
import {
  wizardReducer,
  INITIAL_STATE,
  isStepValid,
  saveToStorage,
  loadFromStorage,
  clearStorage,
} from './wizard-reducer';

import { StepJacketType } from './steps/StepJacketType';
import { StepFabric } from './steps/StepFabric';
import { StepDesignOptions } from './steps/StepDesignOptions';
import { StepMeasurements } from './steps/StepMeasurements';
import { StepReview } from './steps/StepReview';
import { WizardNavigation } from './shared/WizardNavigation';

export function TailoredWizard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [state, dispatch] = useReducer(wizardReducer, INITIAL_STATE);

  // localStorage 복원
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      dispatch({ type: 'RESTORE_STATE', state: saved });
    }
  }, []);

  // 상태 변경 시 자동 저장
  useEffect(() => {
    if (state.jacketType || state.fabricId || state.currentStep > 0) {
      saveToStorage(state);
    }
  }, [state]);

  // 선택한 원단 정보 (리뷰에서 표시용)
  const { data: fabrics } = useQuery({
    queryKey: ['fabrics'],
    queryFn: () => getFabrics(),
    enabled: !!state.fabricId,
  });
  const selectedFabric = fabrics?.find(f => f.id === state.fabricId);

  const handlePrev = useCallback(() => {
    if (state.currentStep > 0) {
      dispatch({ type: 'SET_STEP', step: state.currentStep - 1 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [state.currentStep]);

  const handleNext = useCallback(async () => {
    const step = state.currentStep;

    if (!isStepValid(state, step)) {
      dispatch({ type: 'SET_ERROR', value: '필수 항목을 모두 입력해 주세요.' });
      return;
    }

    if (step < WIZARD_STEPS.length - 1) {
      dispatch({ type: 'SET_STEP', step: step + 1 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 최종 제출
    await handleSubmit();
  }, [state]);

  const handleSubmit = async () => {
    if (!session?.user) return;
    const userId = (session.user as any).id;

    dispatch({ type: 'SET_SUBMITTING', value: true });
    dispatch({ type: 'SET_ERROR', value: '' });

    try {
      // 1) 주문 생성
      const order = await createTailoredOrder({
        userId,
        jacketType: state.jacketType,
        specialRequests: state.specialRequests || undefined,
        images: state.referenceImages.map(url => ({
          type: 'REFERENCE_STYLE',
          imageUrl: url,
        })),
      });

      // 2) 원단/디자인 업데이트
      await updateTailoredOrder(order.id, {
        fabricId: state.fabricId,
        designOptions: state.designOptions,
      });

      // 3) 치수 생성
      const m = state.measurements;
      await createTailoredMeasurement({
        orderId: order.id,
        userId,
        chest: Number(m.chest),
        shoulder: Number(m.shoulder),
        sleeveLength: Number(m.sleeveLength),
        jacketLength: Number(m.jacketLength),
        waist: Number(m.waist),
        hip: Number(m.hip),
        neck: Number(m.neck),
        bicep: Number(m.bicep),
        wrist: Number(m.wrist),
        backWidth: Number(m.backWidth),
        ...(m.height ? { height: Number(m.height) } : {}),
        ...(m.weight ? { weight: Number(m.weight) } : {}),
        ...(m.bodyType ? { bodyType: m.bodyType } : {}),
        ...(m.posture ? { posture: m.posture } : {}),
        ...(m.notes ? { notes: m.notes } : {}),
      });

      // 성공
      clearStorage();
      router.push(`/tailored-orders/${order.id}`);
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', value: err.message || '주문 요청에 실패했습니다.' });
      dispatch({ type: 'SET_SUBMITTING', value: false });
    }
  };

  const handleStepClick = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', step });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 로딩
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // 미로그인
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Shirt className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">로그인이 필요합니다</h2>
        <p className="text-slate-500">맞춤 자켓 주문을 위해 먼저 로그인해 주세요.</p>
      </div>
    );
  }

  const stepLabels = WIZARD_STEPS.map(s => s.label);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">맞춤 자켓 주문</h1>
        <p className="text-slate-500">체형에 맞는 자켓을 처음부터 제작해 드립니다.</p>
      </div>

      {/* 스테퍼 */}
      <div className="mb-10">
        <Stepper
          steps={stepLabels}
          currentStep={state.currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* 스텝 콘텐츠 */}
      <div className="min-h-[400px]">
        {state.currentStep === 0 && (
          <StepJacketType
            jacketType={state.jacketType}
            referenceImages={state.referenceImages}
            dispatch={dispatch}
          />
        )}
        {state.currentStep === 1 && (
          <StepFabric
            fabricId={state.fabricId}
            dispatch={dispatch}
          />
        )}
        {state.currentStep === 2 && (
          <StepDesignOptions
            designOptions={state.designOptions}
            dispatch={dispatch}
          />
        )}
        {state.currentStep === 3 && (
          <StepMeasurements
            measurements={state.measurements}
            dispatch={dispatch}
          />
        )}
        {state.currentStep === 4 && (
          <StepReview
            state={state}
            fabric={selectedFabric}
            dispatch={dispatch}
          />
        )}
      </div>

      {/* 네비게이션 */}
      <WizardNavigation
        currentStep={state.currentStep}
        totalSteps={WIZARD_STEPS.length}
        canNext={isStepValid(state, state.currentStep)}
        onPrev={handlePrev}
        onNext={handleNext}
        isSubmitting={state.isSubmitting}
      />
    </div>
  );
}
