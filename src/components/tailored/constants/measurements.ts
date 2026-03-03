import type { Measurements } from '../wizard-types';

export interface MeasurementDef {
  key: keyof Measurements;
  label: string;
  hint: string; // 보통 범위
  unit: string;
  required: boolean;
}

export const REQUIRED_MEASUREMENTS: MeasurementDef[] = [
  { key: 'chest', label: '가슴둘레', hint: '88~110cm', unit: 'cm', required: true },
  { key: 'shoulder', label: '어깨너비', hint: '40~50cm', unit: 'cm', required: true },
  { key: 'sleeveLength', label: '소매길이', hint: '58~66cm', unit: 'cm', required: true },
  { key: 'jacketLength', label: '자켓길이', hint: '68~78cm', unit: 'cm', required: true },
  { key: 'waist', label: '허리둘레', hint: '72~96cm', unit: 'cm', required: true },
  { key: 'hip', label: '엉덩이둘레', hint: '88~106cm', unit: 'cm', required: true },
  { key: 'neck', label: '목둘레', hint: '36~42cm', unit: 'cm', required: true },
  { key: 'bicep', label: '팔뚝둘레', hint: '28~38cm', unit: 'cm', required: true },
  { key: 'wrist', label: '손목둘레', hint: '15~19cm', unit: 'cm', required: true },
  { key: 'backWidth', label: '등너비', hint: '38~46cm', unit: 'cm', required: true },
];

export const OPTIONAL_MEASUREMENTS: MeasurementDef[] = [
  { key: 'height', label: '키', hint: '160~190cm', unit: 'cm', required: false },
  { key: 'weight', label: '체중', hint: '55~100kg', unit: 'kg', required: false },
];

export const BODY_TYPES = [
  { value: 'slim', label: '마른 체형' },
  { value: 'regular', label: '보통 체형' },
  { value: 'athletic', label: '운동 체형' },
  { value: 'heavy', label: '큰 체형' },
];

export const POSTURE_TYPES = [
  { value: 'straight', label: '바른 자세' },
  { value: 'forward', label: '앞으로 숙인 자세' },
  { value: 'backward', label: '뒤로 젖힌 자세' },
];
