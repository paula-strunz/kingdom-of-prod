import { Fog, House, Leaf, Pumpkin, Sky, Villager, ink, thinInk } from "./parts";

/** A pile of pumpkins, rows of 4, 3, 2 and 1, resting on y. */
function Pile({ x, y }: { x: number; y: number }) {
  const rows = [4, 3, 2, 1];
  return (
    <g>
      {rows.map((count, row) =>
        Array.from({ length: count }, (_, i) => (
          <Pumpkin key={`${row}-${i}`} x={x + (i - (count - 1) / 2) * 17} y={y - row * 11} s={0.95} />
        )),
      )}
    </g>
  );
}

/** A stall: striped awning on two poles over a table. */
function Stall({ x, w }: { x: number; w: number }) {
  const stripes = Math.round(w / 12);
  const sw = w / stripes;
  return (
    <g>
      <path d={`M${x + 4} 74 V150 M${x + w - 4} 74 V150`} stroke="var(--color-ember)" strokeWidth="3" strokeLinecap="round" />
      {Array.from({ length: stripes }, (_, i) => (
        <path
          key={i}
          d={`M${x + i * sw} 66 H${x + (i + 1) * sw} V78 Q${x + (i + 0.5) * sw} 84 ${x + i * sw} 78 Z`}
          fill={i % 2 ? "var(--color-parchment)" : "var(--color-pumpkin-deep)"}
          {...thinInk}
        />
      ))}
      <path d={`M${x - 3} 66 L${x + w / 2} 58 L${x + w + 3} 66 Z`} fill="var(--color-pumpkin-deep)" {...ink} />
      <rect x={x} y="136" width={w} height="10" fill="var(--color-ember)" {...ink} />
      <path d={`M${x + 6} 146 V160 M${x + w - 6} 146 V160`} {...ink} />
    </g>
  );
}

/** A market square in thick fog, crowded with dim figures. The pumpkin stalls are piled high and untouched. */
export function CountingFog() {
  return (
    <g>
      <Sky horizon={96} stars={false} />
      {/* Houses around the square, half lost in fog */}
      <g opacity="0.6">
        <House x={8} y={104} w={36} h={30} />
        <House x={54} y={100} w={28} h={24} />
        <House x={128} y={98} w={40} h={30} />
        <House x={226} y={100} w={30} h={26} />
        <House x={270} y={104} w={40} h={32} />
      </g>
      <Fog y={74} opacity={0.22} amp={8} />
      <rect y="120" width="320" height="60" fill="var(--color-plum)" />
      <path d="M0 140 H320 M0 160 H320 M20 120 L10 180 M70 120 L64 180 M120 120 L118 180 M170 120 V180 M220 120 L224 180 M270 120 L278 180" stroke="var(--color-plum-light)" strokeWidth="1" opacity="0.7" />

      {/* Dim figures, far ones fainter */}
      <g opacity="0.45">
        <Villager x={140} y={126} s={0.8} cloak="var(--color-stone)" />
        <Villager x={170} y={124} s={0.75} cloak="var(--color-stone)" />
        <Villager x={196} y={128} s={0.8} cloak="var(--color-stone)" />
        <Villager x={118} y={130} s={0.85} cloak="var(--color-stone)" />
      </g>
      <Fog y={112} opacity={0.26} amp={5} />

      <Stall x={10} w={92} />
      <Pile x={56} y={134} />
      <Stall x={218} w={92} />
      <Pile x={264} y={134} />

      <g opacity="0.7">
        <Villager x={126} y={160} s={1.05} cloak="var(--color-plum-light)" />
        <Villager x={160} y={166} s={1.15} cloak="var(--color-dusk)" />
        <Villager x={194} y={158} s={1} cloak="var(--color-plum-light)" />
      </g>

      <Fog y={138} opacity={0.3} amp={6} />
      <Fog y={160} opacity={0.3} amp={4} />
      <Leaf x={104} y={170} rot={40} color="var(--color-leaf-gold)" />
      <Leaf x={232} y={174} rot={-30} s={0.9} />
    </g>
  );
}
