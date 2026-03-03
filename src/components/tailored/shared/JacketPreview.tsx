'use client';

import type { DesignOptions } from '../wizard-types';

interface JacketPreviewProps {
  designOptions: DesignOptions;
  className?: string;
}

const LINING_COLORS: Record<string, string> = {
  'navy-satin': '#1e40af',
  'burgundy-satin': '#991b1b',
  'charcoal-satin': '#4b5563',
  'black-satin': '#1f2937',
};

export function JacketPreview({ designOptions, className = '' }: JacketPreviewProps) {
  const {
    lapelStyle, buttonCount, pocketStyle, breastPocket,
    sleeveButton, shoulderStyle, liningFabric, monogram,
  } = designOptions;

  const liningColor = LINING_COLORS[liningFabric] || '#1e40af';
  // Shoulder offset: structured = wider, soft = narrower
  const so = shoulderStyle === 'structured' ? 5 : shoulderStyle === 'soft' ? -3 : 0;
  // Button stance Y (where lapels end)
  const bsy = buttonCount === 2 ? 158 : 138;

  return (
    <svg
      viewBox="0 0 200 280"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="jk-fabric" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#4b5563" />
        </linearGradient>
        <linearGradient id="jk-lapel" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#4b5563" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>
        <linearGradient id="jk-sleeve" x1="0" y1="0" x2="0.8" y2="0.5">
          <stop offset="0%" stopColor="#5b6a7d" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>

      {/* ── Sleeves (behind body) ── */}
      <path
        d={`M ${42-so},46 L ${24-so},50 L ${12-so},178 L ${34-so},182 L 52,82 Z`}
        fill="url(#jk-sleeve)"
        stroke="#374151"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d={`M ${158+so},46 L ${176+so},50 L ${188+so},178 L ${166+so},182 L 148,82 Z`}
        fill="url(#jk-sleeve)"
        stroke="#374151"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* ── Body ── */}
      <path
        d={`M 76,16 L ${42-so},46 L 52,82 L 57,265 L 143,265 L 148,82 L ${158+so},46 L 124,16 Q 100,6 76,16 Z`}
        fill="url(#jk-fabric)"
        stroke="#374151"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* ── Lining V (visible between lapels) ── */}
      <path
        d={`M 88,24 L 100,${bsy} L 112,24 Z`}
        fill={liningColor}
        opacity="0.65"
      />

      {/* ── Lapels ── */}
      {renderLapels(lapelStyle, bsy)}

      {/* ── Center line below buttons ── */}
      <line
        x1="100" y1={bsy + 40}
        x2="100" y2="265"
        stroke="#374151"
        strokeWidth="0.6"
      />

      {/* ── Buttons ── */}
      {renderButtons(buttonCount, bsy)}

      {/* ── Pockets ── */}
      {renderPockets(pocketStyle)}

      {/* ── Breast pocket ── */}
      {breastPocket && (
        <g>
          <line x1="68" y1="116" x2="88" y2="114" stroke="#374151" strokeWidth="1.2" />
          <line x1="68" y1="117.2" x2="88" y2="115.2" stroke="#566578" strokeWidth="0.5" />
        </g>
      )}

      {/* ── Sleeve buttons ── */}
      {renderSleeveButtons(sleeveButton, so)}

      {/* ── Monogram ── */}
      {monogram && (
        <text
          x="76" y="130"
          fontSize="7"
          fill="#94a3b8"
          fontFamily="Georgia, serif"
          fontStyle="italic"
          letterSpacing="0.5"
        >
          {monogram.slice(0, 5)}
        </text>
      )}

      {/* ── Collar top edge ── */}
      <path
        d="M 76,16 Q 100,10 124,16"
        fill="none"
        stroke="#1e293b"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Lapels ─── */
function renderLapels(style: string, bsy: number) {
  const paths: Record<string, { left: string; right: string }> = {
    notch: {
      left: `M 82,16 Q 68,14 58,28 L 64,38 L 70,42 L 56,58 L 64,112 L 94,${bsy} L 90,28 Z`,
      right: `M 118,16 Q 132,14 142,28 L 136,38 L 130,42 L 144,58 L 136,112 L 106,${bsy} L 110,28 Z`,
    },
    peak: {
      left: `M 82,16 Q 66,14 54,30 L 50,38 L 56,58 L 64,112 L 94,${bsy} L 90,28 Z`,
      right: `M 118,16 Q 134,14 146,30 L 150,38 L 144,58 L 136,112 L 106,${bsy} L 110,28 Z`,
    },
    shawl: {
      left: `M 84,16 Q 60,22 56,58 L 64,112 L 94,${bsy} L 90,28 Q 86,18 84,16 Z`,
      right: `M 116,16 Q 140,22 144,58 L 136,112 L 106,${bsy} L 110,28 Q 114,18 116,16 Z`,
    },
  };

  const p = paths[style] || paths.notch;

  return (
    <g>
      <path d={p.left} fill="url(#jk-lapel)" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round" />
      <path d={p.right} fill="url(#jk-lapel)" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round" />
    </g>
  );
}

/* ─── Buttons ─── */
function renderButtons(count: number, bsy: number) {
  const positions = count === 2
    ? [bsy + 2, bsy + 32]
    : [bsy + 2, bsy + 22, bsy + 42];

  return (
    <g>
      {positions.map((y, i) => (
        <g key={i}>
          <circle cx="100" cy={y} r="3.5" fill="#1e293b" stroke="#0f172a" strokeWidth="0.5" />
          <circle cx="100" cy={y} r="1.2" fill="#374151" />
        </g>
      ))}
    </g>
  );
}

/* ─── Pockets ─── */
function renderPockets(style: string) {
  const py = 205;
  const pw = 28;
  const lx = 64;
  const rx = 200 - 64 - pw;

  switch (style) {
    case 'flap':
      return (
        <g>
          <rect x={lx} y={py} width={pw} height="14" fill="none" stroke="#374151" strokeWidth="0.8" />
          <rect x={lx - 1} y={py - 5} width={pw + 2} height="6" fill="#576879" stroke="#374151" strokeWidth="0.8" rx="1" />
          <rect x={rx} y={py} width={pw} height="14" fill="none" stroke="#374151" strokeWidth="0.8" />
          <rect x={rx - 1} y={py - 5} width={pw + 2} height="6" fill="#576879" stroke="#374151" strokeWidth="0.8" rx="1" />
        </g>
      );
    case 'jetted':
      return (
        <g>
          <line x1={lx} y1={py} x2={lx + pw} y2={py} stroke="#374151" strokeWidth="1.5" />
          <line x1={lx} y1={py + 1.5} x2={lx + pw} y2={py + 1.5} stroke="#4b5e72" strokeWidth="0.5" />
          <line x1={rx} y1={py} x2={rx + pw} y2={py} stroke="#374151" strokeWidth="1.5" />
          <line x1={rx} y1={py + 1.5} x2={rx + pw} y2={py + 1.5} stroke="#4b5e72" strokeWidth="0.5" />
        </g>
      );
    case 'patch':
      return (
        <g>
          <rect x={lx} y={py - 2} width={pw} height="20" fill="none" stroke="#374151" strokeWidth="1" rx="2" strokeDasharray="2,1" />
          <rect x={rx} y={py - 2} width={pw} height="20" fill="none" stroke="#374151" strokeWidth="1" rx="2" strokeDasharray="2,1" />
        </g>
      );
    default:
      return null;
  }
}

/* ─── Sleeve Buttons ─── */
function renderSleeveButtons(count: number, so: number) {
  const btns = [];
  const startY = 170;
  const gap = 7;

  for (let i = 0; i < count; i++) {
    const y = startY - i * gap;
    btns.push(
      <circle key={`l${i}`} cx={26 - so} cy={y} r="2" fill="#1e293b" stroke="#0f172a" strokeWidth="0.3" />,
      <circle key={`r${i}`} cx={174 + so} cy={y} r="2" fill="#1e293b" stroke="#0f172a" strokeWidth="0.3" />,
    );
  }

  return <g>{btns}</g>;
}
