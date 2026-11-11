import { Fog, Leaf, Moon, Sky, ink, thinInk } from "./parts";

/** A raven on a windowsill holding a sealed letter. Beyond, a sagging wooden bridge over a misty river. */
export function BaronsRaven() {
  return (
    <g>
      {/* The view: hills, a misty river and the sagging bridge */}
      <Sky horizon={96} />
      <Moon x={70} y={36} r={10} />
      <path d="M0 96 C50 82 90 90 130 86 S220 76 260 86 S300 92 320 88 V180 H0 Z" fill="var(--color-plum-light)" opacity="0.8" />
      <path d="M0 108 C60 100 120 106 180 102 S280 100 320 106 V180 H0 Z" fill="var(--color-plum)" />
      <path d="M0 118 C80 112 200 116 320 114 V150 C220 154 100 150 0 154 Z" fill="var(--color-stone)" opacity="0.55" />
      <path d="M30 128 H60 M90 136 H130 M170 130 H200 M230 140 H270 M50 146 H80" stroke="var(--color-mist)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <Fog y={116} opacity={0.24} amp={4} />

      {/* Bridge: deck sags in the middle, ropes droop */}
      <path d="M56 98 V122 M64 98 V122 M248 96 V120 M256 96 V120" stroke="var(--color-ember)" strokeWidth="3" strokeLinecap="round" />
      <path d="M56 110 Q156 140 256 108" fill="none" stroke="var(--color-ember)" strokeWidth="4" strokeLinecap="round" />
      <path d="M56 110 Q156 140 256 108" fill="none" {...thinInk} />
      <path
        d="M76 114 L76 119 M90 117 L90 123 M104 120 L104 126 M132 124 L132 130 M146 125 L146 131 M174 125 L174 130 M188 123 L188 129 M216 118 L216 124 M230 115 L230 120"
        stroke="var(--color-ember)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M56 98 Q156 124 256 96" fill="none" stroke="var(--color-stone)" strokeWidth="1.2" />
      <path d="M118 112 L118 127 M160 116 V130 M202 110 V124" stroke="var(--color-stone)" strokeWidth="0.8" />
      <Fog y={132} opacity={0.3} amp={5} />

      {/* The room around the window, and the sill */}
      <path d="M0 0 H320 V180 H0 Z M28 12 V146 H292 V12 Z" fillRule="evenodd" fill="var(--color-plum)" />
      <rect x="28" y="12" width="264" height="134" fill="none" stroke="var(--color-ember)" strokeWidth="5" />
      <rect x="28" y="12" width="264" height="134" fill="none" {...thinInk} />
      <path d="M160 12 V146" stroke="var(--color-ember)" strokeWidth="3" />
      <path d="M16 146 H304 V158 H16 Z" fill="var(--color-ember)" {...ink} />
      <path d="M22 158 H298 V164 H22 Z" fill="var(--color-ink)" />

      {/* The raven */}
      <path d="M262 146 L284 156 L282 150 L290 152 L272 140 Z" fill="var(--color-ink)" {...ink} />
      <path d="M206 146 C198 128 206 108 226 104 C246 102 262 116 266 140 L262 146 Z" fill="var(--color-ink)" {...ink} />
      <path d="M222 118 C236 116 250 126 256 140" fill="none" stroke="var(--color-plum-light)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M230 124 C240 124 248 132 252 142" fill="none" stroke="var(--color-plum-light)" strokeWidth="1" strokeLinecap="round" />
      <circle cx="214" cy="100" r="11" fill="var(--color-ink)" {...ink} />
      <circle cx="210" cy="97" r="2" fill="var(--color-amber)" />
      <path d="M204 99 L186 104 L204 105 Z" fill="var(--color-stone)" {...thinInk} />
      <path d="M220 146 V150 L216 152 M220 150 L224 152 M238 146 V150 L234 152 M238 150 L242 152" {...thinInk} stroke="var(--color-stone)" strokeWidth={1.2} />

      {/* The sealed letter in its beak */}
      <g transform="rotate(-10 176 108)">
        <rect x="160" y="100" width="30" height="20" rx="1.5" fill="var(--color-parchment)" {...ink} />
        <path d="M160 100 L175 112 L190 100" fill="none" {...thinInk} />
        <circle cx="175" cy="112" r="4" fill="var(--color-leaf-red)" {...thinInk} />
      </g>

      <Leaf x={60} y={152} rot={-60} s={1.1} color="var(--color-leaf-gold)" />
      <Leaf x={110} y={40} rot={20} s={0.9} color="var(--color-pumpkin)" />
    </g>
  );
}
