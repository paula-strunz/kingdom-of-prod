import { COAT, Keeper, Villager } from "./folk";
import { Appear, Bob, Cart, Fog, HangingLantern, House, Leaf, Pumpkin, Sky, ink, thinInk, vars, type SceneProps } from "./parts";
import styles from "./scenes.module.css";

/** A pile of pumpkins, one row per entry, resting on y. */
function Pile({ x, y, rows, dim = 1 }: { x: number; y: number; rows: readonly number[]; dim?: number }) {
  return (
    <g>
      {rows.map((count, row) =>
        Array.from({ length: count }, (_, i) => (
          <Pumpkin key={`${row}-${i}`} x={x + (i - (count - 1) / 2) * 17} y={y - row * 11} s={0.95} dim={dim} />
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

/** The fog-counter's tally board on its pole: what is counted, and how many. */
function Tally({ x, counting, marks }: { x: number; counting: "visitors" | "pumpkins"; marks: number }) {
  const strokes = Array.from({ length: marks }, (_, i) => {
    const col = i % 7;
    const row = Math.floor(i / 7);
    return `M${x + 15 + col * 3.6} ${103 + row * 9} v6`;
  }).join(" ");
  return (
    <g>
      <path d={`M${x + 22} 124 V178`} {...ink} stroke="var(--color-ember)" strokeWidth={2.4} />
      <rect x={x} y="98" width="44" height="26" rx="2" fill="var(--color-parchment)" {...ink} />
      {counting === "visitors" ? (
        <g fill="var(--color-ink)">
          <circle cx={x + 7.5} cy="105" r="2.6" />
          <path d={`M${x + 3.5} 119 C${x + 3.5} 111 ${x + 11.5} 111 ${x + 11.5} 119 Z`} />
        </g>
      ) : (
        <Pumpkin x={x + 7.5} y={117} s={0.5} />
      )}
      <path d={strokes} fill="none" stroke="var(--color-ink)" strokeWidth="1.3" strokeLinecap="round" />
    </g>
  );
}

/** A little sign on a post, with a pumpkin painted on it. */
function Sign({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x} ${y} V${y - 22}`} {...ink} stroke="var(--color-ember)" strokeWidth={2} />
      <rect x={x - 9} y={y - 36} width="18" height="14" rx="1.5" fill="var(--color-parchment)" {...ink} />
      <Pumpkin x={x} y={y - 25} s={0.5} />
    </g>
  );
}

const VISITORS = [
  { x: 140, y: 126, s: 0.8 },
  { x: 170, y: 124, s: 0.75 },
  { x: 196, y: 128, s: 0.8 },
  { x: 118, y: 130, s: 0.85 },
];
const MORE_VISITORS = [
  { x: 154, y: 134, s: 0.9 },
  { x: 184, y: 136, s: 0.9 },
  { x: 212, y: 132, s: 0.85 },
  { x: 104, y: 136, s: 0.9 },
  { x: 128, y: 140, s: 0.95 },
];

/**
 * The market square in thick fog. Before the choice: visitors drift between
 * stalls piled high with unsold pumpkins, and the fog-counter runs up with a
 * full tally board. After: empty stalls and coins, lovely signs over softening
 * pumpkins, or a square full of strangers while the growers cart their crop away.
 */
export function CountingFog({ outcome, thinking }: SceneProps) {
  const rows = outcome === "wise" ? [1] : outcome === "poor" ? [] : [4, 3, 2, 1];
  const crowded = outcome === "poor" || outcome === "muddled";

  return (
    <g>
      <Sky horizon={96} stars={false} tint="var(--place-market)" />
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

      {/* Visitors in the fog, far ones fainter. They leave once the market sells. */}
      {outcome !== "wise" && (
        <g opacity="0.45">
          {VISITORS.map((v, i) => (
            <g key={v.x} className={styles.drift} style={vars({ d: `${-i * 2.1}s` })}>
              <Villager {...v} cloak="var(--color-stone)" />
            </g>
          ))}
        </g>
      )}
      {crowded && (
        <Appear delay={0.4}>
          <g opacity="0.5">
            {MORE_VISITORS.map((v, i) => (
              <g key={v.x} className={styles.drift} style={vars({ d: `${-i * 1.7 - 1}s` })}>
                <Villager {...v} cloak="var(--color-stone)" />
              </g>
            ))}
          </g>
        </Appear>
      )}
      <Fog y={112} opacity={0.26} amp={5} />

      <Stall x={10} w={92} />
      <Pile x={56} y={134} rows={rows} dim={outcome === "muddled" ? 0.5 : 1} />
      <Stall x={218} w={92} />
      <Pile x={264} y={134} rows={rows} dim={outcome === "muddled" ? 0.5 : 1} />

      {/* Sold out by nightfall: lanterns lit, coins on the tables, buyers carrying pumpkins home */}
      {outcome === "wise" && (
        <Appear delay={0.4}>
          <HangingLantern x={30} y={80} s={0.9} lit />
          <HangingLantern x={290} y={80} s={0.9} lit />
          {[22, 30, 38, 84, 232, 240, 290, 298].map((cx, i) => (
            <ellipse key={cx} cx={cx} cy={134 - (i % 2)} rx="3" ry="1.6" fill="var(--color-amber)" {...thinInk} strokeWidth={0.6} />
          ))}
          <Villager x={214} y={164} s={1.05} cloak={COAT.mustard} species="moth" kit="none" mood="cheer" reach={[-11.4, 10.7]} />
          <Pumpkin x={202} y={154} s={0.6} />
          <Villager x={88} y={162} s={1} cloak={COAT.plum} species="crow" kit="none" mood="cheer" reach={[12, 10]} />
          <Pumpkin x={100} y={152} s={0.6} />
        </Appear>
      )}
      {outcome === "muddled" && (
        <Appear rise delay={0.5}>
          <Sign x={20} y={178} />
          <Sign x={236} y={176} />
          <Sign x={296} y={178} />
        </Appear>
      )}
      {/* The growers load what they could not sell, and go */}
      {outcome === "poor" && (
        <g className={styles.leave}>
          <Cart x={276} y={176} s={1.5} load />
          <Villager x={308} y={178} s={1.05} cloak={COAT.olive} species="wolf" fur={1} />
        </g>
      )}

      <Keeper x={118} y={178} s={1.2} from={-140} thinking={thinking} />

      {/* The fog-counter, out of breath, and the tally board */}
      <g className={outcome ? undefined : styles.runIn}>
        <Tally x={172} counting={outcome === "wise" ? "pumpkins" : "visitors"} marks={outcome === "wise" ? 4 : crowded ? 14 : 10} />
        <Bob on={!outcome} delay={0.1}>
          <Villager
            x={181}
            y={178}
            s={1.15}
            species="rabbit"
            cloak={COAT.teal}
            fur={0}
            kit="satchel"
            mood={outcome ? "calm" : "panting"}
            reach={[18, -6]}
          />
        </Bob>
      </g>

      <Fog y={150} opacity={0.24} amp={6} />
      <Fog y={168} opacity={0.26} amp={4} />
      <Leaf x={64} y={172} rot={40} color="var(--color-leaf-gold)" />
      <Leaf x={250} y={160} rot={-30} s={0.9} />
    </g>
  );
}
