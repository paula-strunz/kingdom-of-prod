import type { SVGProps } from "react";
import { vars } from "./parts";
import styles from "./scenes.module.css";

/*
 * The folk of Hollowmere: animal folk in clothes.
 *
 * Crows, wolves and foxes, rabbits and moths, drawn like chunky pixel sprites:
 * a heavy dark-plum outline with square joins, flat fills, blocky shapes with
 * stepped corners, tiny dot eyes with a square glint, and a big head on a
 * small body. Everyone in the village is one, the keeper included.
 *
 * Geometry, in units at s = 1 with the feet on (0, 0): feet from 0 to -3.5, the
 * coat up to -17, the head from -16 to -31, ears and antennae up to about -38
 * (a rabbit's to -42).
 */

export type Species = "crow" | "wolf" | "rabbit" | "moth";
export type Mood = "calm" | "cheer" | "panting" | "asleep" | "glum";
export type Kit = "none" | "scarf" | "satchel" | "book" | "key";

/** The sprite outline: dark plum, heavier than the scenery's ink, with square joins. */
const OUT = "#26111f";
/** The folk outline, for a scene that draws a limb or a prop of its own. */
export const FOLK_OUTLINE = OUT;
const line = {
  stroke: OUT,
  strokeWidth: 2.1,
  strokeLinejoin: "miter",
  strokeMiterlimit: 2.5,
  strokeLinecap: "square",
} as const satisfies SVGProps<SVGPathElement>;
const fine = { ...line, strokeWidth: 1.1 } as const;
const GLINT = "#fff4df";
const GOLD = "#e0aa3e";

/** Coat colors for the folk, from the muted autumn palette. None of them is the keeper's red. */
export const COAT = {
  mustard: "#bf892d",
  olive: "#6b7536",
  plum: "#7b3a5a",
  teal: "#2f6a66",
  slate: "#58608a",
  brown: "#8a5a32",
  mauve: "#8a6a8e",
} as const;

const KEEPER_RED = "#d0402c";
const SCARF = "#d9a33b";

type Fur = { fur: string; pale: string; dark: string };
const FURS: Record<Species, readonly Fur[]> = {
  // Crows: blue-black, but lit at the edge so they never sink into the night.
  crow: [
    { fur: "#3f3a60", pale: "#7a72a6", dark: "#a49db4" },
    { fur: "#384360", pale: "#6f7ca6", dark: "#a49db4" },
  ],
  wolf: [
    { fur: "#8d859c", pale: "#ecdcc0", dark: "#5f5870" },
    { fur: "#bd6d3b", pale: "#f0dcbc", dark: "#7e4224" },
    { fur: "#a49aa9", pale: "#ecdcc0", dark: "#6b6276" },
  ],
  // Cream, muted a little so it does not glare against the plum.
  rabbit: [
    { fur: "#e2cfb0", pale: "#f0e2c8", dark: "#cf8a86" },
    { fur: "#b5977c", pale: "#ead8bc", dark: "#cf8a86" },
  ],
  moth: [
    { fur: "#a8829f", pale: "#eee0cb", dark: "#7d5675" },
    { fur: "#b39873", pale: "#efe2c9", dark: "#86704e" },
  ],
};
const KEEPER_FUR: Fur = { fur: "#b3a9c0", pale: "#f0e1c6", dark: "#6b6276" };
const SPECIES: readonly Species[] = ["crow", "wolf", "rabbit", "moth"];

/** A small integer hash, so each villager gets the same look on every render. */
function hash(a: number, b: number): number {
  let h = Math.imul(Math.round(a * 10) ^ Math.imul(Math.round(b * 10), 0x45d9f3b), 0x9e3779b1);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  return h >>> 0;
}

/** A closed outline from its right half, listed from the bottom middle to the top middle, mirrored to the left. */
function sym(pts: readonly (readonly [number, number])[]): string {
  const right = pts.map(([x, y]) => `${x} ${y}`);
  const left = [...pts].reverse().map(([x, y]) => `${-x} ${y}`);
  return `M${right.join(" L")} L${left.join(" L")} Z`;
}

/** A box with stepped, pixel-style corners `c` deep. */
function box(x0: number, y0: number, x1: number, y1: number, c = 0): string {
  if (!c) return `M${x0} ${y0} H${x1} V${y1} H${x0} Z`;
  const h = c / 2;
  return (
    `M${x0 + c} ${y0} H${x1 - c} V${y0 + h} H${x1 - h} V${y0 + c} H${x1} V${y1 - c} H${x1 - h} V${y1 - h} H${x1 - c} V${y1} ` +
    `H${x0 + c} V${y1 - h} H${x0 + h} V${y1 - c} H${x0} V${y0 + c} H${x0 + h} V${y0 + h} H${x0 + c} Z`
  );
}

/** A limb or strap drawn twice, outline under color. */
function Band({ d, color, w }: { d: string; color: string; w: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={OUT} strokeWidth={w + 2.1} strokeLinecap="square" strokeLinejoin="miter" />
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="butt" strokeLinejoin="miter" />
    </>
  );
}

const HEADS: Record<Species, string> = {
  wolf: sym([[0, -16], [4.5, -16], [6, -17], [10, -17.6], [8, -20], [8.5, -27.5], [7, -29.5], [5, -31], [0, -31]]),
  rabbit: sym([[0, -16], [4.5, -16], [4.5, -17], [6.5, -17], [6.5, -18.5], [7.5, -18.5], [7.5, -27], [6.5, -27], [6.5, -29], [4.5, -29], [4.5, -30], [0, -30]]),
  moth: sym([[0, -16.5], [6, -16.5], [7.5, -18], [9.6, -18.8], [8.6, -21], [10, -23.2], [8.6, -25.2], [9.4, -27.8], [7, -28.6], [6.4, -30.6], [3.8, -30], [2, -31.4], [0, -30.6]]),
  crow: sym([[0, -16], [5, -16], [5, -17.5], [6.5, -17.5], [6.5, -18.5], [8, -18.5], [8, -26.5], [10.8, -28], [7.8, -29.4], [8.4, -32.2], [4.6, -30.6], [3.4, -34.4], [1.2, -31.2], [0, -32.4]]),
};

/** Eyes centred on y, `gap` apart, around cx. They blink unless closed. */
function Eyes({ sp, cx, y, gap, mood, look = 0, delay = 0 }: { sp: Species; cx: number; y: number; gap: number; mood: Mood; look?: number; delay?: number }) {
  const xs = [cx - gap / 2, cx + gap / 2];
  // On a crow's dark face the marks are drawn in amber, everywhere else in the outline color.
  const mark = sp === "crow" ? "var(--color-amber)" : OUT;
  const stroke = { fill: "none", stroke: mark, strokeWidth: 1.1, strokeLinecap: "square", strokeLinejoin: "miter" } as const;
  if (mood === "asleep") return <path d={xs.map((ex) => `M${ex - 1.5} ${y} H${ex + 1.5}`).join(" ")} {...stroke} />;
  if (mood === "cheer") return <path d={xs.map((ex) => `M${ex - 1.5} ${y + 0.8} L${ex} ${y - 0.8} L${ex + 1.5} ${y + 0.8}`).join(" ")} {...stroke} />;
  if (mood === "panting") {
    const [l, r] = xs as [number, number];
    return <path d={`M${l - 1.3} ${y - 1.3} L${l + 1} ${y} L${l - 1.3} ${y + 1.3} M${r + 1.3} ${y - 1.3} L${r - 1} ${y} L${r + 1.3} ${y + 1.3}`} {...stroke} />;
  }
  return (
    <g className={styles.blink} style={{ transformOrigin: `0px ${y}px`, ...vars({ d: `${delay}s` }) }}>
      {xs.map((ex) => {
        const px = ex + look;
        if (sp === "crow") {
          return (
            <g key={ex}>
              <rect x={ex - 1.4} y={y - 1.5} width="2.8" height="3" fill="var(--color-amber)" />
              <rect x={px - 0.5} y={y - 1} width="1.3" height="2.2" fill={OUT} />
              <rect x={px - 0.4} y={y - 1} width="0.6" height="0.6" fill={GLINT} />
            </g>
          );
        }
        if (sp === "moth") {
          // Sleepy: amber eyes under heavy lids.
          return (
            <g key={ex}>
              <rect x={ex - 1.5} y={y - 0.7} width="3" height="1.8" fill="var(--color-amber)" />
              <rect x={px - 0.4} y={y - 0.7} width="1.2" height="1.8" fill={OUT} />
              <rect x={ex - 1.8} y={y - 1.3} width="3.6" height="0.9" fill={OUT} />
            </g>
          );
        }
        return (
          <g key={ex}>
            <rect x={px - 0.85} y={y - 1.3} width="1.7" height="2.6" fill={OUT} />
            <rect x={px - 0.55} y={y - 1} width="0.65" height="0.65" fill={GLINT} />
          </g>
        );
      })}
      {mood === "glum" && <path d={xs.map((ex) => `M${ex - 1.6} ${y - 2.6} L${ex + 1.4} ${y - 1.9}`).join(" ")} {...stroke} strokeWidth={0.8} />}
    </g>
  );
}

/** The mouth: a small "w", an open mouth, or a frown. */
function Mouth({ cx, y, mood }: { cx: number; y: number; mood: Mood }) {
  if (mood === "cheer" || mood === "panting") {
    return (
      <g>
        <rect x={cx - 1.3} y={y - 0.3} width="2.6" height="2" fill={OUT} />
        <rect x={cx - 0.7} y={y + 0.9} width="1.4" height="0.8" fill="#d0605a" />
      </g>
    );
  }
  const d = mood === "glum" ? `M${cx - 1.3} ${y + 1} V${y + 0.2} H${cx + 1.3} V${y + 1}` : `M${cx - 1.4} ${y - 0.2} V${y + 0.6} H${cx + 1.4} V${y - 0.2}`;
  return <path d={d} fill="none" stroke={OUT} strokeWidth={0.8} strokeLinejoin="miter" />;
}

/**
 * A head of the given species: its shape, ears or crest or antennae, and the
 * face. `dx` turns the face a little to one side. `flop` folds a rabbit's right ear.
 */
function Head({
  sp,
  f,
  mood,
  dx = 0,
  delay = 0,
  look = 0,
  flop = false,
  hat = false,
  specs = false,
  blush = false,
}: {
  sp: Species;
  f: Fur;
  mood: Mood;
  dx?: number;
  delay?: number;
  look?: number;
  flop?: boolean;
  hat?: boolean;
  specs?: boolean;
  blush?: boolean;
}) {
  const ey = sp === "rabbit" ? -24 : sp === "crow" ? -24.6 : -25;
  const gap = sp === "rabbit" ? 6 : 6.6;
  return (
    <g>
      {/* Ears behind the head; each twitches now and then, the two out of step */}
      {sp === "wolf" &&
        [1, -1].map((side) => (
          <g key={side} transform={`scale(${side} 1)`}>
            <g className={styles.twitch} style={{ transformOrigin: "5px -29px", ...vars({ d: `${delay - (side > 0 ? 0 : 2.3)}s` }) }}>
              <path d="M2.5 -29 L4.5 -33.5 L7 -37.5 L8 -36.5 L8.6 -33 L8.6 -27 Z" fill={f.fur} {...line} />
              <path d="M5 -31.5 L6.6 -34.6 L7 -31 Z" fill={f.pale} />
            </g>
          </g>
        ))}
      {sp === "rabbit" && (
        <g>
          <g className={styles.twitch} style={{ transformOrigin: "-4px -29px", ...vars({ d: `${delay - 2.3}s` }) }}>
            <path d={box(-6.2, -42, -2.2, -28, 1.6)} fill={f.fur} {...line} />
            <path d="M-4.2 -39.6 V-30.5" stroke={f.dark} strokeWidth="1.5" />
          </g>
          {flop ? (
            <g className={styles.twitch} style={{ transformOrigin: "4px -29px", ...vars({ d: `${delay}s` }) }}>
              <path d="M2.2 -28 V-37 H3.8 V-38.6 H9.6 V-37 H11.2 V-32.6 H8.2 V-35 H6.2 V-28 Z" fill={f.fur} {...line} />
              <path d="M4.2 -30.5 V-36.6 H9.2" fill="none" stroke={f.dark} strokeWidth="1.4" />
            </g>
          ) : (
            <g className={styles.twitch} style={{ transformOrigin: "4px -29px", ...vars({ d: `${delay}s` }) }}>
              <path d={box(2.2, -42, 6.2, -28, 1.6)} fill={f.fur} {...line} />
              <path d="M4.2 -39.6 V-30.5" stroke={f.dark} strokeWidth="1.5" />
            </g>
          )}
        </g>
      )}
      {sp === "moth" &&
        !hat &&
        [1, -1].map((side) => (
          <g key={side} transform={`scale(${side} 1)`}>
            <g className={styles.twitch} style={{ transformOrigin: "2px -30px", ...vars({ d: `${delay - (side > 0 ? 0 : 1.7)}s` }) }}>
              <Band d="M2 -30 L3.4 -35 L6 -38" color={f.dark} w={1.1} />
              <rect x="5" y="-40" width="3" height="3" fill={f.dark} {...fine} />
            </g>
          </g>
        ))}

      {/* A crow is lit at the edge, like the moon behind it */}
      {sp === "crow" && <path d={HEADS.crow} fill="none" stroke={f.pale} strokeWidth="3.8" strokeLinejoin="miter" strokeMiterlimit={2.5} opacity="0.7" />}
      <path d={HEADS[sp]} fill={f.fur} {...line} />
      {sp === "crow" && <rect x="-5" y="-29" width="3" height="1.2" fill={f.pale} />}

      {/* The face */}
      {sp === "wolf" && <path d={`M${dx - 4.6} -16.6 V-19.5 H${dx - 3.6} V-21.4 H${dx - 1.6} V-22.6 H${dx + 1.6} V-21.4 H${dx + 3.6} V-19.5 H${dx + 4.6} V-16.6 Z`} fill={f.pale} />}
      {sp === "rabbit" && <path d={box(-5.6 + dx, -22.6, 5.6 + dx, -16.8, 2)} fill={f.pale} />}
      <g transform={dx ? `translate(${dx} 0)` : undefined}>
        <Eyes sp={sp} cx={0} y={ey} gap={gap} mood={mood} look={look} delay={delay} />
        {(blush || sp === "rabbit") && (
          <g fill="#d9837a" opacity="0.8">
            <rect x={-gap / 2 - 2.4} y={ey + 2.2} width="2" height="1.2" />
            <rect x={gap / 2 + 0.4} y={ey + 2.2} width="2" height="1.2" />
          </g>
        )}
        {sp === "wolf" && <rect x="-1.1" y="-22.4" width="2.2" height="1.4" fill={OUT} />}
        {sp === "rabbit" && <rect x="-0.8" y="-21.8" width="1.6" height="1" fill={f.dark} />}
        {sp === "crow" ? (
          <g>
            <path d="M-2.8 -22.6 H2.8 V-21.4 H1.6 L0.2 -18.4 L-1.6 -21.4 H-2.8 Z" fill={f.dark} {...fine} />
            {(mood === "cheer" || mood === "panting") && <path d="M-1.6 -20.6 H1.2" stroke={OUT} strokeWidth="0.9" />}
          </g>
        ) : (
          <Mouth cx={0} y={sp === "wolf" ? -20 : sp === "rabbit" ? -20.4 : -20.8} mood={mood} />
        )}
        {specs && (
          <g fill={GLINT} fillOpacity="0.18" stroke={GOLD} strokeWidth="0.9">
            <rect x={-gap / 2 - 2.1} y={ey - 2} width="4.2" height="3.8" />
            <rect x={gap / 2 - 2.1} y={ey - 2} width="4.2" height="3.8" />
            <path d={`M${-gap / 2 + 2.1} ${ey - 0.6} H${gap / 2 - 2.1} M${-gap / 2 - 2.1} ${ey - 1} L${-gap / 2 - 4.4} ${ey - 2} M${gap / 2 + 2.1} ${ey - 1} L${gap / 2 + 4.4} ${ey - 2}`} fill="none" />
          </g>
        )}
      </g>

      {hat && (
        <g>
          {/* A tall hat with a pumpkin band, and a gold leaf for office */}
          <path d={box(-6, -44, 6, -31, 1)} fill="#3b2848" {...line} />
          <rect x="-4.4" y="-42.4" width="1.3" height="9" fill="#5e4677" />
          <rect x="-6" y="-35.4" width="12" height="2.2" fill="var(--color-pumpkin)" />
          <path d={box(-10, -32, 10, -29.8)} fill="#3b2848" {...line} />
          <path d="M3.4 -36 V-40.4 H5.4 V-38.4 H6.6 V-36 Z" fill={GOLD} {...fine} strokeWidth={0.7} />
        </g>
      )}
    </g>
  );
}

const SHOULDER: [number, number] = [6.6, -13];

/** The coat: stepped shoulders flaring to the hem at `hem`. */
function coatPath(hem: number): string {
  return sym([[0, hem], [8, hem], [8, -11], [7, -11], [7, -14], [5.6, -14], [5.6, -16.6], [0, -16.6]]);
}

/**
 * A villager of Hollowmere, one of the animal folk. Stands on (x, y), facing us.
 *
 * - `species` picks crow, wolf (or fox), rabbit or moth. Without it the species,
 *   fur and a small extra (a scarf, a satchel, a book, a key) come from `look`,
 *   or from the position when no `look` is given, so a crowd is never a row of twins.
 * - `cloak` colors the coat.
 * - `reach` raises an arm toward a point (dx, dy) measured from (0, -24). The arm
 *   stays short; with `staff` a baton runs on to the point.
 * - `hat` is a tall hat and `chain` a chain of office. `specs` and `apron` dress
 *   the clockmaker; `mood` changes the face.
 */
export function Villager({
  x,
  y,
  s = 1,
  cloak = COAT.slate,
  reach,
  hat = false,
  opacity = 1,
  species,
  look,
  fur,
  mood = "calm",
  chain = false,
  specs = false,
  apron = false,
  staff = false,
  sway = true,
  kit,
  busyArm = false,
}: {
  x: number;
  y: number;
  s?: number;
  cloak?: string;
  reach?: [number, number];
  hat?: boolean;
  opacity?: number;
  species?: Species;
  /** Picks species, fur, and a small extra. Any integer. */
  look?: number;
  /** Which of the species' furs, as an index. */
  fur?: number;
  mood?: Mood;
  chain?: boolean;
  specs?: boolean;
  apron?: boolean;
  staff?: boolean;
  sway?: boolean;
  /** The small extra, chosen instead of by `look`. */
  kit?: Kit;
  /** The right arm is drawn by the scene (the clockmaker's hammer), so leave it out. */
  busyArm?: boolean;
}) {
  const seed = look ?? hash(x, y);
  const pick = (n: number, salt: number) => hash(seed, salt) % n;
  const sp = species ?? SPECIES[seed % SPECIES.length]!;
  const furs = FURS[sp];
  const f = furs[(fur ?? pick(furs.length, 1)) % furs.length]!;
  // The extra each species tends to carry, unless the clothes say otherwise.
  const extra = kit ?? (chain || apron ? "none" : pick(3, 2) === 1 ? "none" : sp === "wolf" ? "scarf" : sp === "rabbit" ? "satchel" : sp === "crow" ? "book" : "key");
  const delay = -(pick(50, 4) / 10);
  const tailSide = pick(2, 3) ? 1 : -1;

  // The reaching arm: short, aimed at the reach point (measured from (0, -24)).
  let arm: { hand: [number, number]; tip: [number, number]; side: 1 | -1 } | undefined;
  if (reach) {
    const tip: [number, number] = [reach[0], reach[1] - 24];
    const side = tip[0] < 0 ? -1 : 1;
    const sh: [number, number] = [SHOULDER[0] * side, SHOULDER[1]];
    const vx = tip[0] - sh[0];
    const vy = tip[1] - sh[1];
    const len = Math.hypot(vx, vy) || 1;
    const k = Math.min(1, 9 / len);
    arm = { hand: [sh[0] + vx * k, sh[1] + vy * k], tip, side };
  }
  const book = extra === "book" && arm?.side !== 1;
  const r2 = (n: number) => n.toFixed(2);

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <g className={sway ? styles.sway : undefined} style={{ transformOrigin: "0px 0px", ...vars({ d: `${delay}s` }) }}>
        {/* What sits behind: a fluffy tail, tail feathers, or folded wings worn like a cape */}
        {sp === "wolf" && (
          <g transform={`scale(${tailSide} 1)`}>
            <g className={styles.flick} style={{ transformOrigin: "6px -5px", ...vars({ d: `${delay * 0.7}s` }) }}>
              <path d="M5 -3.5 H10 V-5.5 H12.4 V-8 H14 V-14.4 H12.6 V-16.6 H9.4 V-14.4 H8.4 V-9.4 H5 Z" fill={f.fur} {...line} />
              <rect x="9.2" y="-16" width="4.2" height="3.2" fill={f.pale} />
            </g>
          </g>
        )}
        {sp === "crow" && <path d="M-5 -3.5 L-12.4 -2.4 L-10.6 -5 L-13 -7 L-6 -9 Z" fill={f.fur} {...line} />}
        {sp === "moth" &&
          [1, -1].map((side) => (
            <g key={side} transform={`scale(${side} 1)`}>
              <path d="M4 -15.6 H10 V-14 H12 V-10 H13.4 V-4.6 H12 V-2.4 H6 Z" fill={f.dark} {...line} />
              <rect x="9.2" y="-11.6" width="1.8" height="1.8" fill={f.pale} />
              <rect x="10.2" y="-6.4" width="1.8" height="1.8" fill={f.pale} />
            </g>
          ))}

        {/* Feet: paws, or a crow's grey toes */}
        {[1, -1].map((side) =>
          sp === "crow" ? (
            <path key={side} transform={`scale(${side} 1)`} d="M2.2 -4 H4.2 V-1.6 H6.2 V0 H0.8 V-1.6 H2.2 Z" fill={f.dark} {...fine} />
          ) : (
            <path key={side} transform={`scale(${side} 1)`} d={box(1.2, -3.6, 6.2, 0, 1)} fill={sp === "moth" ? f.dark : f.fur} {...fine} />
          ),
        )}

        {/* The coat, a seam and a gold button */}
        <path d={coatPath(-2.6)} fill={cloak} {...line} />
        <path d="M0 -14.8 V-3.6" stroke={OUT} strokeWidth="0.9" opacity="0.55" />
        {apron && (
          <g>
            <path d={box(-5, -13.6, 5, -2.8)} fill="#7f4f2c" {...fine} />
            <path d="M-2.4 -8 H2.4 V-5.2 H-2.4 Z" fill="none" stroke={OUT} strokeWidth="0.7" />
          </g>
        )}
        {!apron && <rect x="-1.1" y="-11.2" width="2.2" height="2.2" fill={GOLD} stroke={OUT} strokeWidth="0.6" />}

        {/* A moth's fluffy ruff */}
        {sp === "moth" && (
          <path
            d={sym([[0, -13], [1.6, -14.8], [3.2, -13], [4.8, -14.8], [6.4, -13], [8, -14.8], [9.4, -14], [9.4, -17.4], [8, -18.6], [0, -18.6]])}
            fill={f.pale}
            {...line}
          />
        )}

        {/* Sleeves and paws at rest, unless that arm is reaching */}
        {[1, -1].map((side) =>
          arm?.side === side || (busyArm && side === 1) ? null : (
            <g key={side} transform={`scale(${side} 1)`}>
              <path d={box(6.6, -14.6, 10.2, -8.4)} fill={cloak} {...line} />
              <rect x="6.8" y="-8.8" width="3.2" height="3" fill={f.fur} {...fine} />
            </g>
          ),
        )}

        {/* The small extra */}
        {extra === "scarf" && (
          <g>
            <path d={box(-6.8, -17.8, 6.8, -14.6, 1)} fill={SCARF} {...fine} />
            <path d="M2.4 -15 H5.4 V-8.6 H2.4 Z" fill={SCARF} {...fine} />
          </g>
        )}
        {extra === "satchel" && (
          <g>
            <Band d="M-5.4 -16 L5.4 -6.6" color="#6b7536" w={1.1} />
            <path d={box(3.2, -8.4, 10.4, -2.4, 1)} fill="#6b7536" {...fine} />
            <path d="M3.4 -6.2 H10.2" stroke={OUT} strokeWidth="0.7" />
          </g>
        )}
        {extra === "key" && (
          <g>
            <path d="M-3 -16.6 L0 -12.2 L3 -16.6" fill="none" stroke={GOLD} strokeWidth="0.7" />
            <path d="M-1.3 -12.8 H1.3 V-10.6 H0.5 V-6.4 H1.6 V-5.2 H0.5 V-4.4 H-0.5 V-10.6 H-1.3 Z" fill={GOLD} stroke={OUT} strokeWidth="0.6" />
          </g>
        )}
        {book && (
          <g>
            <path d={box(2.4, -13, 8.6, -4.6)} fill="#5d2848" {...fine} />
            <path d="M3.4 -12.4 V-5.2" stroke="#e8d6b8" strokeWidth="1" />
            <rect x="7" y="-10" width="3.2" height="3.2" fill={f.fur} {...fine} />
          </g>
        )}
        {chain && (
          <g>
            <Band d="M-5.6 -16.4 L0 -11.6 L5.6 -16.4" color={GOLD} w={0.9} />
            <path d={box(-2, -13, 2, -9, 1)} fill={GOLD} {...fine} />
            <rect x="-0.6" y="-11.6" width="1.2" height="1.2" fill="var(--color-pumpkin-deep)" />
          </g>
        )}

        <Head sp={sp} f={f} mood={mood} delay={delay} flop={pick(2, 5) === 0} hat={hat} specs={specs} />

        {/* The reaching arm in front, and the mayor's baton running on to the point */}
        {arm && staff && (
          <g>
            <Band d={`M${r2(arm.hand[0])} ${r2(arm.hand[1])} L${r2(arm.tip[0])} ${r2(arm.tip[1])}`} color="var(--color-ember)" w={1.3} />
            <path d={box(arm.tip[0] - 1.9, arm.tip[1] - 1.9, arm.tip[0] + 1.9, arm.tip[1] + 1.9, 1)} fill={GOLD} {...fine} />
          </g>
        )}
        {arm && (
          <g>
            <Band d={`M${arm.side * 5.4} -13 L${r2(arm.hand[0])} ${r2(arm.hand[1])}`} color={cloak} w={3.4} />
            <rect x={r2(arm.hand[0] - 1.7)} y={r2(arm.hand[1] - 1.7)} width="3.4" height="3.4" fill={f.fur} {...fine} />
          </g>
        )}

        {mood === "panting" && (
          <g>
            {/* Out of breath: a drop of sweat, and puffs from the mouth */}
            <path d="M-10.6 -31 H-9.6 V-29.6 H-8.8 V-27 H-11.4 V-29.6 H-10.6 Z" fill="#cfe6f0" {...fine} strokeWidth={0.6} />
            <g className={styles.puff} style={{ transformOrigin: "8px -19px", ...vars({ d: "0s", px: 5 }) }}>
              <rect x="7.6" y="-20.6" width="3" height="3" fill="var(--color-parchment)" />
              <rect x="11" y="-19.2" width="2" height="2" fill="var(--color-parchment)" />
            </g>
            <g className={styles.puff} style={{ transformOrigin: "-8px -19px", ...vars({ d: "-0.55s", px: -5 }) }}>
              <rect x="-10.4" y="-20" width="2.6" height="2.6" fill="var(--color-parchment)" />
            </g>
          </g>
        )}
      </g>
    </g>
  );
}

/**
 * The keeper: the player's character, a young grey wolf. A bright red coat, a
 * mustard scarf blowing back, and a lit hand lantern, so she is the first
 * thing you find in every scene. Stands on (x, y) facing right; `flip` faces
 * left. `from` makes her walk in from that many units behind her. `thinking`
 * tilts her head and lifts her eyes under the thought bubble.
 */
export function Keeper({
  x,
  y,
  s = 1,
  flip = false,
  from,
  stride = false,
  delay = 0,
  thinking = false,
}: {
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  from?: number;
  stride?: boolean | "long";
  delay?: number;
  thinking?: boolean;
}) {
  const walking = from !== undefined;
  const legs = [walking || stride ? styles.stride : "", stride === "long" ? styles.strideLong : ""].join(" ");
  const f = KEEPER_FUR;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} data-keeper="">
      <g className={walking ? styles.walkIn : undefined} style={vars({ from: from ?? 0, d: `${delay}s` })}>
        {/* Lantern glow behind everything */}
        <circle cx="11" cy="-6" r="15" fill="var(--color-amber)" opacity="0.13" />
        <circle cx="11" cy="-6" r="8" fill="var(--color-amber)" opacity="0.16" />
        {/* Legs in two held frames, swinging from the hip */}
        <g className={legs} style={vars({ d: `${delay}s` })}>
          <g className={styles.legA} style={{ transformOrigin: "-3px -6px" }}>
            <path d="M-4.6 -6 H-1.4 V-3.4 H-4.6 Z" fill="#6a4048" {...fine} />
            <path d={box(-5.6, -3.6, -0.6, 0, 1)} fill={f.fur} {...fine} />
          </g>
          <g className={styles.legB} style={{ transformOrigin: "3px -6px" }}>
            <path d="M1.4 -6 H4.6 V-3.4 H1.4 Z" fill="#6a4048" {...fine} />
            <path d={box(1, -3.6, 6, 0, 1)} fill={f.fur} {...fine} />
          </g>
        </g>
        <g className={styles.breathe}>
          {/* A fluffy tail behind her */}
          <g className={styles.flick} style={{ transformOrigin: "-6px -7px", ...vars({ d: "-1.3s" }) }}>
            <path d="M-5 -5 H-11 V-7 H-13.6 V-9.6 H-15.4 V-15.4 H-14 V-17.6 H-10.8 V-15.4 H-9.8 V-10.4 H-5 Z" fill={f.fur} {...line} />
            <rect x="-14.6" y="-17" width="4.2" height="3.2" fill={f.pale} />
          </g>
          {/* The red coat, its hem and a gold button */}
          <path d={coatPath(-4.6)} fill={KEEPER_RED} {...line} />
          <path d="M0.8 -14.8 V-5.6" stroke={OUT} strokeWidth="0.9" opacity="0.5" />
          <rect x="-0.5" y="-11.2" width="2.2" height="2.2" fill={GOLD} stroke={OUT} strokeWidth="0.6" />
          {/* The far arm at her side */}
          <path d={box(-10.2, -14.6, -6.6, -8.4)} fill={KEEPER_RED} {...line} />
          <rect x="-10" y="-8.8" width="3.2" height="3" fill={f.fur} {...fine} />

          {/* Head, tilted when she is thinking */}
          <g transform={thinking ? "rotate(-7 1 -16)" : undefined}>
            <Head sp="wolf" f={f} mood="calm" dx={1.4} delay={-2.1} look={thinking ? 0.4 : 0} blush />
          </g>
          {/* The mustard scarf, one end hanging down */}
          <path d={box(-6.8, -18, 7, -14.6, 1)} fill={SCARF} {...fine} />
          <path d="M-4.6 -15 H-1.6 V-8.4 H-4.6 Z" fill={SCARF} {...fine} />

          {/* Near arm out, holding up the lantern: a dark frame with four lit panes */}
          <path d={box(6.6, -14.6, 11.2, -10.2)} fill={KEEPER_RED} {...line} />
          <rect x="8" y="-11" width="3.4" height="3" fill={f.fur} {...fine} />
          <path d="M8.4 -6.8 V-8.6 H11 V-6.8" fill="none" stroke={OUT} strokeWidth="1" />
          <path d={box(6.8, -7, 12.6, -0.6, 0.8)} fill="#4a2730" {...fine} />
          <g className={styles.flicker} style={{ transformOrigin: "9.7px -3.8px" }}>
            <path d="M7.9 -6 H9.4 V-4.1 H7.9 Z M10 -6 H11.5 V-4.1 H10 Z M7.9 -3.5 H9.4 V-1.6 H7.9 Z M10 -3.5 H11.5 V-1.6 H10 Z" fill="var(--color-amber)" />
          </g>
        </g>
        {thinking && (
          <g className={styles.rise} style={vars({ rise: 4 })}>
            <rect x="8" y="-42" width="2.4" height="2.4" fill="var(--color-parchment)" />
            <rect x="10.6" y="-46.6" width="3.2" height="3.2" fill="var(--color-parchment)" />
            <path d={box(6, -60, 26, -48, 3)} fill="var(--color-parchment)" {...fine} />
            <g className={styles.glow} fill={OUT}>
              <rect x="10" y="-55" width="2.4" height="2.4" />
              <rect x="14.8" y="-55" width="2.4" height="2.4" />
              <rect x="19.6" y="-55" width="2.4" height="2.4" />
            </g>
          </g>
        )}
      </g>
    </g>
  );
}

