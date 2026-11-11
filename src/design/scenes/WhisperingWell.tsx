import { Fog, Leaf, Moon, Sky, Villager, ink, thinInk } from "./parts";

/** The mayor beside an old stone well in the fog, pointing down into it. A bucket hangs from a frayed rope. */
export function WhisperingWell() {
  return (
    <g>
      <Sky horizon={118} />
      <Moon x={258} y={38} r={15} />
      <Fog y={92} opacity={0.16} amp={8} />
      <path d="M0 132 C60 124 120 130 170 126 S270 122 320 130 V180 H0 Z" fill="var(--color-plum)" {...thinInk} />
      <Fog y={118} opacity={0.2} amp={5} />

      {/* Roof and posts */}
      <path d="M104 64 L150 40 L196 64 Z" fill="var(--color-ink)" {...ink} />
      <path d="M108 64 L150 44 L192 64" fill="none" stroke="var(--color-ember)" strokeWidth="1.2" />
      <rect x="120" y="62" width="6" height="58" fill="var(--color-ember)" {...ink} />
      <rect x="174" y="62" width="6" height="58" fill="var(--color-ember)" {...ink} />
      <rect x="114" y="66" width="72" height="5" rx="2" fill="var(--color-ember)" {...ink} />

      {/* Frayed rope and the single bucket */}
      <path d="M150 71 V80" {...ink} stroke="var(--color-stone)" strokeWidth={2.2} />
      <path d="M150 80 L147 84 M150 80 L153 85 M150 81 L149 86" {...thinInk} stroke="var(--color-mist)" strokeWidth={0.8} />
      <path d="M150 83 V96" stroke="var(--color-stone)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M142 96 Q150 90 158 96" fill="none" {...thinInk} />
      <path d="M141 96 H159 L156 108 H144 Z" fill="var(--color-ember)" {...ink} />
      <path d="M142.5 101 H157.5" {...thinInk} />

      {/* The well: stone drum with a dark mouth */}
      <path d="M114 120 V150 C114 158 186 158 186 150 V120 Z" fill="var(--color-stone)" {...ink} />
      <path
        d="M114 132 C130 137 170 137 186 132 M114 143 C130 148 170 148 186 143 M128 122 V134 M150 124 V136 M172 122 V134 M138 135 V145 M162 135 V145 M126 145 V155 M150 147 V157 M174 145 V155"
        fill="none"
        {...thinInk}
        opacity="0.7"
      />
      <ellipse cx="150" cy="120" rx="36" ry="8" fill="var(--color-plum-light)" {...ink} />
      <ellipse cx="150" cy="120" rx="28" ry="5" fill="var(--color-night)" />

      {/* The mayor, tall hat and chain of office, pointing down into the well */}
      <Villager x={226} y={152} s={1.3} cloak="var(--color-dusk)" hat reach={[-31, 7]} />
      <circle cx="186" cy="127" r="2.2" fill="#d9c3a5" {...thinInk} />
      <path d="M220 122 Q226 130 232 122" fill="none" stroke="var(--color-amber)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="226" cy="128" r="1.8" fill="var(--color-amber)" />

      <Fog y={152} opacity={0.32} amp={6} />
      <Fog y={166} opacity={0.22} amp={4} />
      <Leaf x={92} y={150} rot={-30} color="var(--color-leaf-gold)" />
      <Leaf x={280} y={160} rot={50} s={1.1} />
      <Leaf x={40} y={60} rot={15} s={0.9} color="var(--color-pumpkin)" />
    </g>
  );
}
