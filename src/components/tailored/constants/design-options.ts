// 디자인 옵션 상수 정의 - 5개 그룹, 13개 옵션

export interface DesignOptionChoice {
  value: string | number | boolean;
  label: string;
  description?: string;
  image?: string;
}

export interface DesignOptionDef {
  key: string;
  label: string;
  type: 'image-select' | 'toggle' | 'text';
  choices?: DesignOptionChoice[];
}

export interface DesignOptionGroup {
  title: string;
  icon: string;
  options: DesignOptionDef[];
}

const IMG = '/images/tailored/design-options';

export const DESIGN_OPTION_GROUPS: DesignOptionGroup[] = [
  {
    title: '라펠 (Lapel)',
    icon: '👔',
    options: [
      {
        key: 'lapelStyle',
        label: '라펠 스타일',
        type: 'image-select',
        choices: [
          { value: 'notch', label: '노치 라펠', description: '가장 기본적인 V자 노치', image: `${IMG}/lapel-notch.svg` },
          { value: 'peak', label: '피크 라펠', description: '위로 뾰족한 포멀 라펠', image: `${IMG}/lapel-peak.svg` },
          { value: 'shawl', label: '숄 라펠', description: '둥근 곡선의 턱시도 라펠', image: `${IMG}/lapel-shawl.svg` },
        ],
      },
    ],
  },
  {
    title: '버튼 (Button)',
    icon: '🔘',
    options: [
      {
        key: 'buttonCount',
        label: '버튼 수',
        type: 'image-select',
        choices: [
          { value: 2, label: '2 버튼', description: '가장 일반적', image: `${IMG}/button-2.svg` },
          { value: 3, label: '3 버튼', description: '클래식 스타일', image: `${IMG}/button-3.svg` },
        ],
      },
    ],
  },
  {
    title: '실루엣 (Silhouette)',
    icon: '🧥',
    options: [
      {
        key: 'ventStyle',
        label: '벤트 스타일',
        type: 'image-select',
        choices: [
          { value: 'center', label: '센터 벤트', description: '중앙 한 개 트임', image: `${IMG}/vent-center.svg` },
          { value: 'side', label: '사이드 벤트', description: '양쪽 두 개 트임', image: `${IMG}/vent-side.svg` },
          { value: 'none', label: '노 벤트', description: '트임 없이 깔끔', image: `${IMG}/vent-none.svg` },
        ],
      },
      {
        key: 'shoulderStyle',
        label: '어깨 스타일',
        type: 'image-select',
        choices: [
          { value: 'natural', label: '내추럴', description: '자연스러운 어깨선', image: `${IMG}/shoulder-natural.svg` },
          { value: 'soft', label: '소프트', description: '패드 없이 부드러운', image: `${IMG}/shoulder-soft.svg` },
          { value: 'structured', label: '스트럭처드', description: '패드로 각진 어깨', image: `${IMG}/shoulder-structured.svg` },
        ],
      },
      {
        key: 'pocketStyle',
        label: '포켓 스타일',
        type: 'image-select',
        choices: [
          { value: 'flap', label: '플랩 포켓', description: '뚜껑 있는 기본 포켓', image: `${IMG}/pocket-flap.svg` },
          { value: 'jetted', label: '제티드 포켓', description: '절개선만 있는 포멀 포켓', image: `${IMG}/pocket-jetted.svg` },
          { value: 'patch', label: '패치 포켓', description: '붙인 형태의 캐주얼 포켓', image: `${IMG}/pocket-patch.svg` },
        ],
      },
      {
        key: 'breastPocket',
        label: '가슴 포켓',
        type: 'image-select',
        choices: [
          { value: true, label: '있음', description: '가슴에 웰트 포켓 추가', image: `${IMG}/breast-pocket-yes.svg` },
          { value: false, label: '없음', description: '가슴 포켓 없이 깔끔', image: `${IMG}/breast-pocket-no.svg` },
        ],
      },
    ],
  },
  {
    title: '안감 & 소매 (Lining & Sleeve)',
    icon: '🪡',
    options: [
      {
        key: 'lining',
        label: '안감 구성',
        type: 'image-select',
        choices: [
          { value: 'full', label: '풀 안감', description: '전면 안감으로 마감', image: `${IMG}/lining-full.svg` },
          { value: 'half', label: '하프 안감', description: '상체만 안감, 가벼움', image: `${IMG}/lining-half.svg` },
        ],
      },
      {
        key: 'liningFabric',
        label: '안감 원단',
        type: 'image-select',
        choices: [
          { value: 'navy-satin', label: '네이비 새틴', description: '클래식한 네이비 광택 안감' },
          { value: 'burgundy-satin', label: '버건디 새틴', description: '고급스러운 와인색 안감' },
          { value: 'charcoal-satin', label: '차콜 새틴', description: '무난한 차콜 그레이 안감' },
          { value: 'black-satin', label: '블랙 새틴', description: '포멀한 블랙 안감' },
        ],
      },
      {
        key: 'sleeveButton',
        label: '소매 버튼 수',
        type: 'image-select',
        choices: [
          { value: 2, label: '2개', description: '미니멀', image: `${IMG}/sleeve-2.svg` },
          { value: 3, label: '3개', description: '기본', image: `${IMG}/sleeve-3.svg` },
          { value: 4, label: '4개', description: '클래식', image: `${IMG}/sleeve-4.svg` },
        ],
      },
      {
        key: 'sleeveButtonFunctional',
        label: '소매 버튼 기능',
        type: 'image-select',
        choices: [
          { value: false, label: '장식용', description: '장식 전용 (기본)', image: `${IMG}/sleeve-decorative.svg` },
          { value: true, label: '기능성', description: '실제 열리는 버튼홀', image: `${IMG}/sleeve-functional.svg` },
        ],
      },
    ],
  },
  {
    title: '개인화 (Personalization)',
    icon: '✨',
    options: [
      {
        key: 'monogram',
        label: '모노그램',
        type: 'text',
      },
    ],
  },
];

// 디자인 옵션 라벨 가져오기
export function getDesignOptionLabel(key: string, value: any): string {
  for (const group of DESIGN_OPTION_GROUPS) {
    for (const opt of group.options) {
      if (opt.key === key && opt.choices) {
        const choice = opt.choices.find(c => c.value === value);
        if (choice) return choice.label;
      }
    }
  }
  return String(value);
}
