// 맞춤 자켓 위자드 타입 정의

export type WizardStep = 'jacketType' | 'fabric' | 'design' | 'measurements' | 'review';

export const WIZARD_STEPS: { key: WizardStep; label: string }[] = [
  { key: 'jacketType', label: '자켓 종류' },
  { key: 'fabric', label: '원단 선택' },
  { key: 'design', label: '디자인' },
  { key: 'measurements', label: '신체 치수' },
  { key: 'review', label: '최종 확인' },
];

export type JacketType = 'SINGLE_BREASTED' | 'DOUBLE_BREASTED' | 'TRENCH_COAT';

// 디자인 옵션
export type LapelStyle = 'notch' | 'peak' | 'shawl';
export type ButtonCount = 2 | 3;
export type VentStyle = 'center' | 'side' | 'none';
export type ShoulderStyle = 'natural' | 'soft' | 'structured';
export type PocketStyle = 'flap' | 'jetted' | 'patch';
export type LiningType = 'full' | 'half';
export type SleeveButtonCount = 2 | 3 | 4;

export interface DesignOptions {
  lapelStyle: LapelStyle;
  buttonCount: ButtonCount;
  ventStyle: VentStyle;
  shoulderStyle: ShoulderStyle;
  pocketStyle: PocketStyle;
  breastPocket: boolean;
  lining: LiningType;
  liningFabric: string;
  sleeveButton: SleeveButtonCount;
  sleeveButtonFunctional: boolean;
  monogram: string;
}

export const DEFAULT_DESIGN_OPTIONS: DesignOptions = {
  lapelStyle: 'notch',
  buttonCount: 2,
  ventStyle: 'center',
  shoulderStyle: 'natural',
  pocketStyle: 'flap',
  breastPocket: true,
  lining: 'full',
  liningFabric: 'navy-satin',
  sleeveButton: 3,
  sleeveButtonFunctional: false,
  monogram: '',
};

// 신체 치수
export interface Measurements {
  // 필수 (cm)
  chest: number | '';
  shoulder: number | '';
  sleeveLength: number | '';
  jacketLength: number | '';
  waist: number | '';
  hip: number | '';
  neck: number | '';
  bicep: number | '';
  wrist: number | '';
  backWidth: number | '';
  // 선택
  height: number | '';
  weight: number | '';
  bodyType: string;
  posture: string;
  notes: string;
}

export const EMPTY_MEASUREMENTS: Measurements = {
  chest: '',
  shoulder: '',
  sleeveLength: '',
  jacketLength: '',
  waist: '',
  hip: '',
  neck: '',
  bicep: '',
  wrist: '',
  backWidth: '',
  height: '',
  weight: '',
  bodyType: '',
  posture: '',
  notes: '',
};

export const REQUIRED_MEASUREMENT_KEYS: (keyof Measurements)[] = [
  'chest', 'shoulder', 'sleeveLength', 'jacketLength',
  'waist', 'hip', 'neck', 'bicep', 'wrist', 'backWidth',
];

// 위자드 상태
export interface WizardState {
  currentStep: number; // 0~4
  jacketType: JacketType | '';
  referenceImages: string[];
  fabricId: string;
  designOptions: DesignOptions;
  measurements: Measurements;
  specialRequests: string;
  orderId: string;
  isSubmitting: boolean;
  error: string;
}

// 위자드 액션
export type WizardAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_JACKET_TYPE'; value: JacketType }
  | { type: 'ADD_REFERENCE_IMAGE'; url: string }
  | { type: 'REMOVE_REFERENCE_IMAGE'; index: number }
  | { type: 'SET_FABRIC'; fabricId: string }
  | { type: 'SET_DESIGN_OPTION'; key: keyof DesignOptions; value: any }
  | { type: 'SET_MEASUREMENT'; key: keyof Measurements; value: any }
  | { type: 'SET_SPECIAL_REQUESTS'; value: string }
  | { type: 'SET_SUBMITTING'; value: boolean }
  | { type: 'SET_ERROR'; value: string }
  | { type: 'SET_ORDER_ID'; value: string }
  | { type: 'RESTORE_STATE'; state: Partial<WizardState> }
  | { type: 'RESET' };
