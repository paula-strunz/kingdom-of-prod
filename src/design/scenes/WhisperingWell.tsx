import { COAT, Keeper, Villager } from "./folk";
import { Appear, Bob, Fog, Leaf, Moon, Sky, ink, thinInk, vars, type SceneProps } from "./parts";
import styles from "./scenes.module.css";

const CX = 150;

/** The well with its roof. `hw` is half the width of the stone drum. */
function Well({ hw }: { hw: number }) {
  const x0 = CX - hw;
  const x1 = CX + hw;
  const at = (f: number) => (CX + f * hw).toFixed(1);
  return (
    <g>
      <path d={`M${x0 - 10} 64 L${CX} 40 L${x1 + 10} 64 Z`} fill="var(--color-ink)" {...ink} />
      <path d={`M${x0 - 6} 64 L${CX} 44 L${x1 + 6} 64`} fill="none" stroke="var(--color-ember)" strokeWidth="1.2" />
      <rect x={x0 + 6} y="62" width="6" height="58" fill="var(--color-ember)" {...ink} />
      <rect x={x1 - 12} y="62" width="6" height="58" fill="var(--color-ember)" {...ink} />
      <rect x={x0} y="66" width={hw * 2} height="5" rx="2" fill="var(--color-ember)" {...ink} />

      <path d={`M${x0} 120 V150 C${x0} 158 ${x1} 158 ${x1} 150 V120 Z`} fill="var(--color-stone)" {...ink} />
      <path
        d={`M${x0} 132 C${x0 + 16} 137 ${x1 - 16} 137 ${x1} 132 M${x0} 143 C${x0 + 16} 148 ${x1 - 16} 148 ${x1} 143 M${at(-0.6)} 122 V134 M${CX} 124 V136 M${at(0.6)} 122 V134 M${at(-0.33)} 135 V145 M${at(0.33)} 135 V145 M${at(-0.66)} 145 V155 M${CX} 147 V157 M${at(0.66)} 145 V155`}
        fill="none"
        {...thinInk}
        opacity="0.7"
      />
      <ellipse cx={CX} cy="120" rx={hw} ry="8" fill="var(--color-plum-light)" {...ink} />
      <ellipse cx={CX} cy="120" rx={hw - 8} ry="5" fill="var(--color-night)" />
    </g>
  );
}

/** A bucket on a rope hanging from the beam. `frayed` draws the worn rope. */
function Bucket({ x, frayed = false }: { x: number; frayed?: boolean }) {
  return (
    <g>
      <path d={`M${x} 71 V96`} stroke="var(--color-stone)" strokeWidth="1.8" strokeLinecap="round" />
      {frayed && (
        <path d={`M${x} 80 L${x - 3} 84 M${x} 80 L${x + 3} 85 M${x} 81 L${x - 1} 86`} {...thinInk} stroke="var(--color-mist)" strokeWidth={0.8} />
      )}
      <path d={`M${x - 8} 96 Q${x} 90 ${x + 8} 96`} fill="none" {...thinInk} />
      <path d={`M${x - 9} 96 H${x + 9} L${x + 6} 108 H${x - 6} Z`} fill="var(--color-ember)" {...ink} />
      <path d={`M${x - 7.5} 101 H${x + 7.5}`} {...thinInk} />
    </g>
  );
}

const QUEUE = [
  { x: 262, y: 154, cloak: COAT.slate, look: 2 },
  { x: 279, y: 157, cloak: COAT.mustard, look: 1 },
  { x: 296, y: 154, cloak: COAT.olive, look: 3 },
  { x: 312, y: 158, cloak: COAT.plum, look: 4 },
] as const;

/**
 * The old well in the marsh. Whispers rise from it. The keeper faces the mayor,
 * who points down into the well.
 *
 * Outcomes: wise hangs a second bucket and the queue is gone; muddled widens
 * the well a little and the queue stays; poor digs a grand well and the queue
 * stays, still with one bucket.
 */
export function WhisperingWell({ outcome, thinking }: SceneProps) {
  const hw = outcome === "poor" ? 52 : outcome === "muddled" ? 42 : 36;
  const queue = outcome === "muddled" || outcome === "poor";

  return (
    <g>
      <Sky horizon={118} tint="var(--place-well)" />
      <Moon x={258} y={38} r={15} />
      <Fog y={92} opacity={0.16} amp={8} />
      <path d="M0 132 C60 124 120 130 170 126 S270 122 320 130 V180 H0 Z" fill="var(--color-plum)" {...thinInk} />
      {/* Reeds: this is marsh ground */}
      <path d="M18 134 V116 M23 134 V120 M28 134 V112 M296 132 V114 M302 132 V120 M48 132 V122" stroke="var(--color-moss)" strokeWidth="1.6" strokeLinecap="round" />
      <Fog y={118} opacity={0.2} amp={5} />

      {/* The earth dug out for the grand well */}
      {outcome === "poor" && (
        <Appear delay={0.4}>
          <path d="M50 158 C56 140 78 138 88 158 Z M30 160 C34 150 48 148 54 160 Z" fill="var(--color-ember)" {...ink} />
          <path d="M92 158 L104 126 M100 124 L108 128" {...ink} stroke="var(--color-stone)" strokeWidth={2} />
        </Appear>
      )}

      <g key={hw} className={outcome ? styles.appear : undefined}>
        <Well hw={hw} />
      </g>
      {outcome === "wise" ? (
        <>
          <Bucket x={138} />
          <Appear rise delay={0.5}>
            <Bucket x={163} />
          </Appear>
        </>
      ) : (
        <Bucket x={CX} frayed />
      )}

      {/* The well whispers when the wind is low */}
      {!outcome &&
        [140, 150, 160].map((x, i) => (
          <g key={x} transform={`translate(${x} ${114 - (i % 2) * 3})`}>
            <path className={styles.wisp} style={vars({ d: `${-i * 1.2}s` })} d="M0 0 q4 -5 0 -10 q-4 -5 0 -10" fill="none" stroke="var(--color-mist)" strokeWidth="1.3" strokeLinecap="round" />
          </g>
        ))}

      {/* The queue at dawn: one bucket, many villagers */}
      {queue && (
        <Appear delay={0.8}>
          {QUEUE.map((v) => (
            <Villager key={v.x} x={v.x} y={v.y} s={0.95} cloak={v.cloak} look={v.look} mood="glum" />
          ))}
        </Appear>
      )}
      {outcome === "wise" && (
        <Appear delay={1}>
          <Villager x={288} y={156} s={0.95} cloak={COAT.olive} species="wolf" fur={1} kit="none" reach={[13.7, 7.2]} />
          <path d="M296 136 H306 L304 145 H298 Z" fill="var(--color-ember)" {...thinInk} />
        </Appear>
      )}

      {/* The mayor, tall hat and chain of office, pointing down into the well */}
      <Bob on={!outcome} delay={-0.2}>
        <Villager
          x={226}
          y={152}
          s={1.3}
          species="crow"
          cloak={COAT.plum}
          fur={0}
          hat
          chain
          staff
          reach={outcome === "wise" ? undefined : [-31, 7]}
        />
      </Bob>

      <Keeper x={68} y={156} s={1.25} from={outcome ? undefined : -90} thinking={thinking} />

      <Fog y={152} opacity={0.32} amp={6} />
      <Fog y={166} opacity={0.22} amp={4} />
      <Leaf x={92} y={150} rot={-30} color="var(--color-leaf-gold)" />
      <Leaf x={280} y={166} rot={50} s={1.1} />
      <Leaf x={40} y={60} rot={15} s={0.9} color="var(--color-pumpkin)" />
    </g>
  );
}
