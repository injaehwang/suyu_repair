import type { JacketType } from '../wizard-types';

export interface JacketTypeOption {
  value: JacketType;
  label: string;
  description: string;
  features: string[];
  image: string;
  disabled?: boolean;
}

export const JACKET_TYPE_OPTIONS: JacketTypeOption[] = [
  {
    value: 'SINGLE_BREASTED',
    label: '싱글 브레스트',
    description: '가장 클래식하고 범용적인 자켓. 1~3개 버튼으로 깔끔한 라인을 연출합니다.',
    features: ['비즈니스', '포멀', '1~3 버튼'],
    image: '/images/tailored/jacket-types/single-breasted.jpg',
  },
  {
    value: 'DOUBLE_BREASTED',
    label: '더블 브레스트',
    description: '겹침 여밈으로 무게감과 권위를 표현합니다. 4~6개 버튼의 포멀한 디자인.',
    features: ['포멀', '권위감', '4~6 버튼'],
    image: '/images/tailored/jacket-types/double-breasted.jpg',
  },
  {
    value: 'TRENCH_COAT',
    label: '트렌치코트',
    description: '허리 벨트와 어깨 견장이 특징인 클래식 아우터. 방수 원단으로 실용성과 멋을 겸비합니다.',
    features: ['아우터', '벨트', '클래식'],
    image: '/images/tailored/jacket-types/trench-coat.jpg',
    disabled: true,
  },
];
