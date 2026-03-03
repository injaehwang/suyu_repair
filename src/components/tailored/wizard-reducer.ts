import {
  WizardState,
  WizardAction,
  DEFAULT_DESIGN_OPTIONS,
  EMPTY_MEASUREMENTS,
  REQUIRED_MEASUREMENT_KEYS,
} from './wizard-types';

export const INITIAL_STATE: WizardState = {
  currentStep: 0,
  jacketType: '',
  referenceImages: [],
  fabricId: '',
  designOptions: { ...DEFAULT_DESIGN_OPTIONS },
  measurements: { ...EMPTY_MEASUREMENTS },
  specialRequests: '',
  orderId: '',
  isSubmitting: false,
  error: '',
};

const STORAGE_KEY = 'tailored-wizard-draft';

export function saveToStorage(state: WizardState) {
  try {
    const { isSubmitting, error, orderId, ...saveable } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveable));
  } catch { /* ignore */ }
}

export function loadFromStorage(): Partial<WizardState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

// Step 유효성 검사 (다음으로 이동 가능 여부)
export function isStepValid(state: WizardState, step: number): boolean {
  switch (step) {
    case 0: // 자켓 종류
      return state.jacketType !== '';
    case 1: // 원단
      return state.fabricId !== '';
    case 2: // 디자인
      return true; // 기본값이 있으므로 항상 유효
    case 3: // 치수
      return REQUIRED_MEASUREMENT_KEYS.every(
        key => state.measurements[key] !== '' && Number(state.measurements[key]) > 0
      );
    case 4: // 리뷰
      return true;
    default:
      return false;
  }
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step, error: '' };

    case 'SET_JACKET_TYPE':
      return { ...state, jacketType: action.value };

    case 'ADD_REFERENCE_IMAGE':
      return { ...state, referenceImages: [...state.referenceImages, action.url] };

    case 'REMOVE_REFERENCE_IMAGE':
      return {
        ...state,
        referenceImages: state.referenceImages.filter((_, i) => i !== action.index),
      };

    case 'SET_FABRIC':
      return { ...state, fabricId: action.fabricId };

    case 'SET_DESIGN_OPTION':
      return {
        ...state,
        designOptions: { ...state.designOptions, [action.key]: action.value },
      };

    case 'SET_MEASUREMENT':
      return {
        ...state,
        measurements: { ...state.measurements, [action.key]: action.value },
      };

    case 'SET_SPECIAL_REQUESTS':
      return { ...state, specialRequests: action.value };

    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.value };

    case 'SET_ERROR':
      return { ...state, error: action.value };

    case 'SET_ORDER_ID':
      return { ...state, orderId: action.value };

    case 'RESTORE_STATE':
      return { ...state, ...action.state, isSubmitting: false, error: '' };

    case 'RESET':
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}
