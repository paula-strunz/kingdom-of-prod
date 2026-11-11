import { Leaf, Moon, gearPath, ink, thinInk } from "./parts";

const brass = "var(--color-leaf-gold)";

/** A clockmaker's bench by candlelight, covered in gears and brass chimes. A nearly full moon in the window. */
export function ClockmakersNight() {
  return (
    <g>
      {/* The night outside the window */}
      <rect x="176" y="14" width="118" height="88" fill="var(--color-night)" />
      <rect x="176" y="70" width="118" height="32" fill="var(--color-dusk)" opacity="0.6" />
      <Moon x={238} y={50} r={18} shadow={0.3} />
      <path d="M176 92 L200 80 L216 86 L240 76 L262 84 L294 78 V102 H176 Z" fill="var(--color-ink)" opacity="0.8" />

      {/* The workshop wall, cut around the window */}
      <path d="M0 0 H320 V180 H0 Z M176 14 V102 H294 V14 Z" fillRule="evenodd" fill="var(--color-plum)" />
      <circle cx="206" cy="86" r="70" fill="var(--color-amber)" opacity="0.07" />
      <rect x="176" y="14" width="118" height="88" fill="none" stroke="var(--color-ember)" strokeWidth="4" strokeLinejoin="round" />
      <path d="M235 14 V102 M176 58 H294" stroke="var(--color-ember)" strokeWidth="3" />
      <rect x="176" y="14" width="118" height="88" fill="none" {...thinInk} />

      {/* Brass chimes hanging from a rail */}
      <path d="M22 18 H124" stroke="var(--color-ember)" strokeWidth="4" strokeLinecap="round" />
      {(
        [
          [34, 46],
          [52, 58],
          [70, 68],
          [88, 56],
          [106, 44],
        ] as const
      ).map(([cx, len]) => (
        <g key={cx}>
          <path d={`M${cx} 18 V24`} {...thinInk} />
          <rect x={cx - 3.5} y="24" width="7" height={len} rx="3" fill={brass} {...ink} />
          <path d={`M${cx - 1} 28 V${18 + len}`} stroke="var(--color-amber)" strokeWidth="1" opacity="0.8" />
        </g>
      ))}

      {/* The bench */}
      <path d="M0 124 H320 V134 H0 Z" fill="var(--color-ember)" {...ink} />
      <path d="M0 134 H320 V180 H0 Z" fill="var(--color-ink)" />
      <path d="M14 134 V180 M306 134 V180" stroke="var(--color-plum-light)" strokeWidth="2" />

      {/* Gears scattered on the bench */}
      <path d={gearPath(56, 108, 15, 12)} fill={brass} {...ink} />
      <circle cx="56" cy="108" r="4" fill="var(--color-ember)" {...thinInk} />
      <path d={gearPath(84, 116, 8.5, 9)} fill="var(--color-pumpkin)" {...ink} />
      <circle cx="84" cy="116" r="2.4" fill="var(--color-ink)" />
      <path d={gearPath(126, 104, 19, 14)} fill={brass} {...ink} />
      <circle cx="126" cy="104" r="11" fill="none" {...thinInk} />
      <circle cx="126" cy="104" r="4" fill="var(--color-ember)" {...thinInk} />
      <path d={gearPath(158, 119, 6, 8)} fill={brass} {...ink} />
      <path d={gearPath(268, 117, 8, 9)} fill={brass} {...ink} />
      <circle cx="268" cy="117" r="2.4" fill="var(--color-ink)" />
      <path d="M284 123 L304 114 M286 121 L302 118" {...ink} stroke="var(--color-stone)" />

      {/* The candle */}
      <circle cx="210" cy="82" r="46" fill="var(--color-amber)" opacity="0.1" />
      <circle cx="210" cy="82" r="22" fill="var(--color-amber)" opacity="0.18" />
      <ellipse cx="210" cy="124" rx="16" ry="4" fill="var(--color-ember)" {...ink} />
      <rect x="203" y="94" width="14" height="30" rx="2" fill="var(--color-parchment)" {...ink} />
      <path d="M205 96 C206 100 205 104 206 106" fill="none" stroke="#e2d3b8" strokeWidth="2" strokeLinecap="round" />
      <path d="M210 94 V90" {...thinInk} />
      <path d="M210 72 C216 80 216 86 210 90 C204 86 204 80 210 72 Z" fill="var(--color-pumpkin)" {...thinInk} />
      <path d="M210 78 C213 82 213 86 210 88 C207 86 207 82 210 78 Z" fill="var(--color-amber)" />

      <Leaf x={186} y={100} rot={70} s={0.9} color="var(--color-leaf-red)" />
    </g>
  );
}
