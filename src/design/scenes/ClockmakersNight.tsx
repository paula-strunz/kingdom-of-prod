import { COAT, FOLK_OUTLINE, Keeper, Villager } from "./folk";
import { Appear, Leaf, Moon, gearPath, ink, thinInk, vars, type SceneProps } from "./parts";
import styles from "./scenes.module.css";

const brass = "var(--color-leaf-gold)";
const CLOCK = { x: 136, y: 96, r: 25 };

/** The festival clock, assembled. `broken` cracks the face and throws a spring. */
function Clock({ broken }: { broken: boolean }) {
  const { x, y, r } = CLOCK;
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const p = (rad: number) => `${(x + rad * Math.sin(a)).toFixed(1)} ${(y - rad * Math.cos(a)).toFixed(1)}`;
    return `M${p(r - 6)} L${p(r - 3)}`;
  }).join(" ");
  return (
    <g>
      <path d={`M${x - 16} 124 L${x - 10} ${y + r - 4} H${x + 10} L${x + 16} 124 Z`} fill="var(--color-ember)" {...ink} />
      <circle cx={x} cy={y} r={r} fill={brass} {...ink} />
      <circle cx={x} cy={y} r={r - 4} fill="var(--color-parchment)" {...thinInk} />
      <path d={ticks} {...thinInk} />
      {broken ? (
        <>
          <path d={`M${x - 14} ${y - 12} L${x - 4} ${y - 4} L${x - 9} ${y + 3} L${x + 2} ${y + 14}`} fill="none" {...thinInk} />
          <path d={`M${x} ${y} L${x + 10} ${y + 9}`} {...ink} strokeWidth={2.2} />
          <path d={`M${x} ${y} L${x - 13} ${y + 6}`} {...ink} />
          <g className={styles.boing} style={{ transformOrigin: `${x + 14}px ${y - 16}px`, ...vars({ d: "0.9s" }) }}>
            <path
              d={`M${x + 14} ${y - 16} l8 -3 l-5 -5 l9 -3 l-5 -5 l9 -3 l-5 -5 l8 -3`}
              fill="none"
              stroke="var(--color-stone)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d={gearPath(x + 40, y - 45, 5, 7)} fill={brass} {...thinInk} />
          </g>
        </>
      ) : (
        <>
          <path d={`M${x} ${y} L${x - 9} ${y - 7}`} {...ink} strokeWidth={2.2} />
          <g className={styles.spin} style={{ transformOrigin: `${x}px ${y}px`, ...vars({ t: "9s" }) }}>
            <path d={`M${x} ${y} V${y - r + 8}`} {...ink} />
          </g>
        </>
      )}
      <circle cx={x} cy={y} r="2" fill="var(--color-ink)" />
    </g>
  );
}

/**
 * The clockmaker's workshop, indoors, by candlelight. The keeper comes in on
 * the right; the clockmaker hammers at the bench among turning gears.
 *
 * Outcomes: wise is a plain clock keeping time under the full moon, with the
 * chimes still on their rail and the clockmaker asleep; muddled is the clock
 * still in pieces while the festival lights are already up outside; poor is a
 * finished clock with a cracked face and a spring thrown out.
 */
export function ClockmakersNight({ outcome, thinking }: SceneProps) {
  const built = outcome === "wise" || outcome === "poor";
  const hammering = !built;

  return (
    <g>
      {/* The night outside the window */}
      <rect x="176" y="14" width="118" height="88" fill="var(--color-night)" />
      <rect x="176" y="70" width="118" height="32" fill="var(--color-dusk)" opacity="0.6" />
      <Moon x={238} y={50} r={18} shadow={outcome ? 0 : 0.3} />
      <path d="M176 92 L200 80 L216 86 L240 76 L262 84 L294 78 V102 H176 Z" fill="var(--color-ink)" opacity="0.8" />
      {/* The festival has begun without the clock */}
      {outcome === "muddled" && (
        <Appear delay={0.4}>
          <path d="M176 70 Q206 84 235 72 Q266 60 294 74" fill="none" {...thinInk} stroke="var(--color-mist)" />
          {(
            [
              [188, 76, "var(--color-pumpkin)"],
              [202, 79, "var(--color-amber)"],
              [217, 77, "var(--color-leaf-red)"],
              [250, 67, "var(--color-amber)"],
              [264, 66, "var(--color-pumpkin)"],
              [279, 69, "var(--color-leaf-red)"],
            ] as const
          ).map(([cx, cy, fill]) => (
            <circle key={cx} className={styles.glow} cx={cx} cy={cy} r="2.6" fill={fill} />
          ))}
        </Appear>
      )}

      {/* The workshop wall, cut around the window */}
      <path d="M0 0 H320 V180 H0 Z M176 14 V102 H294 V14 Z" fillRule="evenodd" fill="var(--color-plum)" />
      <rect width="320" height="180" fill="var(--place-workshop)" opacity="0.35" />
      <path d="M0 0 H320 V180 H0 Z M176 14 V102 H294 V14 Z" fillRule="evenodd" fill="var(--color-plum)" opacity="0.35" />
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

      {/* The clockmaker behind his bench: an old moth in spectacles and a leather apron, a brass key at his throat */}
      <g transform={outcome === "poor" ? "translate(0 8)" : undefined}>
        <Villager
          x={96}
          y={128}
          s={1.25}
          species="moth"
          cloak={COAT.olive}
          fur={0}
          kit="key"
          specs
          apron
          busyArm={hammering}
          mood={outcome === "wise" ? "asleep" : outcome === "poor" ? "glum" : "calm"}
        />
        {hammering && (
          <g className={styles.tap} style={{ transformOrigin: "104px 112px" }}>
            {/* His working arm, drawn like the folk: heavy outline, square paw */}
            <path d="M104 112 L111 106" fill="none" stroke={FOLK_OUTLINE} strokeWidth={6.4} strokeLinecap="square" />
            <path d="M104 112 L111 106" fill="none" stroke={COAT.olive} strokeWidth={4} />
            <path d="M112 105 L117.6 93" fill="none" stroke={FOLK_OUTLINE} strokeWidth={3.6} strokeLinecap="square" />
            <path d="M112 105 L117.6 93" fill="none" stroke="var(--color-ember)" strokeWidth={1.6} />
            <rect x="113" y="86" width="11" height="6" fill="var(--color-stone)" stroke={FOLK_OUTLINE} strokeWidth={1.6} transform="rotate(25 118.5 89)" />
            <rect x="109.6" y="102.6" width="4.4" height="4.4" fill="#a8829f" stroke={FOLK_OUTLINE} strokeWidth={1.3} />
          </g>
        )}
      </g>
      {outcome === "wise" && (
        <g fill="none" {...thinInk} stroke="var(--color-parchment)" strokeWidth={1.3}>
          <path className={styles.wisp} style={vars({ d: "0s" })} d="M112 84 h5 l-5 6 h5" />
          <path className={styles.wisp} style={vars({ d: "-1.8s" })} d="M121 74 h4 l-4 5 h4" />
        </g>
      )}

      <Keeper x={293} y={125} s={1.3} flip from={outcome ? undefined : -70} thinking={thinking} />

      {/* The bench */}
      <path d="M0 124 H320 V134 H0 Z" fill="var(--color-ember)" {...ink} />
      <path d="M0 134 H320 V180 H0 Z" fill="var(--color-ink)" />
      <path d="M14 134 V180 M306 134 V180" stroke="var(--color-plum-light)" strokeWidth="2" />

      {/* The clock: in pieces, or put together */}
      <g className={styles.spinBack} style={{ transformOrigin: "40px 110px", ...vars({ t: "10s" }) }}>
        <path d={gearPath(40, 110, 13, 12)} fill={brass} {...ink} />
        <circle cx="40" cy="110" r="4" fill="var(--color-ember)" {...thinInk} />
      </g>
      <path d={gearPath(66, 117, 7.5, 9)} fill="var(--color-pumpkin)" {...ink} />
      <circle cx="66" cy="117" r="2.2" fill="var(--color-ink)" />
      {built ? (
        <Appear rise>
          <Clock broken={outcome === "poor"} />
        </Appear>
      ) : (
        <>
          <g className={styles.spin} style={{ transformOrigin: "136px 104px", ...vars({ t: "16s" }) }}>
            <path d={gearPath(136, 104, 19, 14)} fill={brass} {...ink} />
            <circle cx="136" cy="104" r="11" fill="none" {...thinInk} />
            <circle cx="136" cy="104" r="4" fill="var(--color-ember)" {...thinInk} />
          </g>
          <path d={gearPath(166, 119, 6, 8)} fill={brass} {...ink} />
        </>
      )}
      <path d={gearPath(258, 117, 8, 9)} fill={brass} {...ink} />
      <circle cx="258" cy="117" r="2.4" fill="var(--color-ink)" />

      {/* The candle */}
      <circle cx="210" cy="82" r="46" fill="var(--color-amber)" opacity="0.1" />
      <circle cx="210" cy="82" r="22" fill="var(--color-amber)" opacity="0.18" />
      <ellipse cx="210" cy="124" rx="16" ry="4" fill="var(--color-ember)" {...ink} />
      <rect x="203" y="94" width="14" height="30" rx="2" fill="var(--color-parchment)" {...ink} />
      <path d="M205 96 C206 100 205 104 206 106" fill="none" stroke="#e2d3b8" strokeWidth="2" strokeLinecap="round" />
      <path d="M210 94 V90" {...thinInk} />
      <g className={styles.flicker} style={{ transformOrigin: "210px 90px" }}>
        <path d="M210 72 C216 80 216 86 210 90 C204 86 204 80 210 72 Z" fill="var(--color-pumpkin)" {...thinInk} />
        <path d="M210 78 C213 82 213 86 210 88 C207 86 207 82 210 78 Z" fill="var(--color-amber)" />
      </g>

      <Leaf x={186} y={100} rot={70} s={0.9} color="var(--color-leaf-red)" />
    </g>
  );
}
