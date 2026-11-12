/**
 * The wings: more of each place, drawn to the left and right of its 320-unit
 * scene, so that a wide screen is filled from edge to edge by the place itself.
 * A phone never sees them.
 *
 * `Backdrop` goes under the scene and `Seams` goes over it: outdoors, a tree
 * stands on each edge of the scene, where its ground meets the wing's ground.
 */
import { Fog, House, HangingLantern, Sky, gearPath, ink, thinInk } from "./parts";

/** How far the wings reach on each side, in scene units. */
export const WING = 400;
/** The viewBox of a scene with its wings. The scene itself is still x 0 to 320. */
export const WIDE_VIEWBOX = `${-WING} 0 ${320 + 2 * WING} 180`;

const LEFT = -WING;
const FULL = 320 + 2 * WING;
const TILES = [-640, -320, 320, 640];

type Outdoor = {
  /** Same values as the scene's own <Sky>. */
  horizon: number;
  stars?: boolean;
  tint?: string;
  /** Where the scene's ground starts, at its left and right edges. */
  ground: readonly [number, number];
  /** Top of the far hills at the left and right edges, if the scene has any. */
  far?: readonly [number, number];
  houses: "lit" | "dark" | "faint" | "none";
  /** Fog bands: [y, opacity]. */
  fog: readonly (readonly [number, number])[];
};

const OUTDOOR: Record<string, Outdoor> = {
  "lantern-pleas": { horizon: 112, tint: "var(--place-gate)", ground: [108, 108], houses: "dark", fog: [[116, 0.18], [166, 0.22]] },
  "whispering-well": { horizon: 118, tint: "var(--place-well)", ground: [132, 130], houses: "none", fog: [[92, 0.16], [118, 0.2], [152, 0.32], [166, 0.22]] },
  "counting-fog": { horizon: 96, stars: false, tint: "var(--place-market)", ground: [120, 120], houses: "faint", fog: [[74, 0.22], [112, 0.26], [138, 0.3], [160, 0.3]] },
  map: { horizon: 70, ground: [96, 92], far: [74, 62], houses: "none", fog: [[150, 0.14]] },
  "ending-thrives": { horizon: 104, ground: [124, 120], far: [106, 98], houses: "lit", fog: [[164, 0.18]] },
  "ending-muddles": { horizon: 104, ground: [124, 120], far: [106, 98], houses: "dark", fog: [[128, 0.2], [156, 0.3]] },
  "ending-fog": { horizon: 104, ground: [124, 120], far: [106, 98], houses: "dark", fog: [[74, 0.24], [96, 0.4], [120, 0.5], [150, 0.5]] },
};

/** A dark pine standing on (x, base). */
function Pine({ x, base, h = 46 }: { x: number; base: number; h?: number }) {
  const w = h * 0.3;
  const tier = (top: number, half: number, bottom: number) =>
    `M${x} ${base - top} L${x - half} ${base - bottom} H${x + half} Z`;
  return (
    <g>
      <path d={`M${x} ${base} V${base - h * 0.3}`} stroke="var(--color-ink)" strokeWidth={h * 0.07} />
      <path
        d={`${tier(h, w * 0.55, h * 0.62)} ${tier(h * 0.76, w * 0.8, h * 0.36)} ${tier(h * 0.5, w, h * 0.12)}`}
        fill="var(--color-ink)"
        stroke="var(--color-plum-light)"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** Houses and pines scattered along one wing. `dir` is -1 for the left wing and 1 for the right. */
function Hamlet({ dir, ground, houses }: { dir: -1 | 1; ground: number; houses: Outdoor["houses"] }) {
  const at = (d: number) => (dir === 1 ? 320 + d : -d);
  const homes = [
    { d: 62, w: 30, h: 22, up: 12, lit: true },
    { d: 128, w: 24, h: 18, up: 4, lit: false },
    { d: 196, w: 34, h: 24, up: 16, lit: true },
    { d: 282, w: 26, h: 20, up: 6, lit: false },
    { d: 350, w: 32, h: 22, up: 14, lit: true },
  ];
  const pines = [
    { d: 34, up: 20, h: 50 },
    { d: 100, up: 2, h: 34 },
    { d: 164, up: 26, h: 58 },
    { d: 240, up: 4, h: 38 },
    { d: 316, up: 22, h: 52 },
    { d: 384, up: 8, h: 40 },
  ];
  return (
    <g>
      {pines.map((p) => (
        <Pine key={p.d} x={at(p.d)} base={ground + p.up} h={p.h} />
      ))}
      {houses !== "none" && (
        <g opacity={houses === "faint" ? 0.6 : 1}>
          {homes.map((home) => (
            <House
              key={home.d}
              x={at(home.d) - home.w / 2}
              y={ground + home.up}
              w={home.w}
              h={home.h}
              lit={houses === "lit" || (houses === "dark" && home.lit && home.d > 150)}
            />
          ))}
        </g>
      )}
    </g>
  );
}

/** Shelves of clock parts along one wall of the workshop. */
function Shelves({ x }: { x: number }) {
  const brass = "var(--color-leaf-gold)";
  return (
    <g>
      {[52, 92].map((y) => (
        <path key={y} d={`M${x} ${y} h150 M${x + 10} ${y} v6 M${x + 140} ${y} v6`} {...ink} stroke="var(--color-ember)" strokeWidth={3} />
      ))}
      <path d={gearPath(x + 24, 40, 10, 10)} fill={brass} {...ink} />
      <circle cx={x + 24} cy="40" r="3" fill="var(--color-ember)" {...thinInk} />
      <circle cx={x + 62} cy="38" r="11" fill="var(--color-parchment)" {...ink} />
      <path d={`M${x + 62} 38 v-7 M${x + 62} 38 h5`} {...thinInk} />
      <rect x={x + 92} y="30" width="7" height="21" fill="var(--color-leaf-red)" {...thinInk} />
      <rect x={x + 100} y="34" width="6" height="17" fill="var(--color-moss)" {...thinInk} />
      <rect x={x + 107} y="28" width="8" height="23" fill="var(--color-stone)" {...thinInk} />
      <path d={gearPath(x + 132, 43, 7, 8)} fill="var(--color-pumpkin)" {...ink} />
      <rect x={x + 16} y="70" width="18" height="21" rx="2" fill="var(--color-ember)" {...ink} />
      <circle cx={x + 25} cy="79" r="5" fill="var(--color-parchment)" {...thinInk} />
      <path d={gearPath(x + 58, 81, 9, 9)} fill={brass} {...ink} />
      <path d={gearPath(x + 80, 84, 6, 8)} fill={brass} {...ink} />
      <rect x={x + 108} y="72" width="26" height="19" rx="2" fill="var(--color-plum-light)" {...ink} />
      <path d={`M${x + 108} 80 h26`} {...thinInk} />
    </g>
  );
}

/** A shelf of books and a wall lantern in the keeper's room. */
function Study({ x }: { x: number }) {
  const books = [
    [0, 20, "var(--color-leaf-red)"],
    [8, 26, "var(--color-moss)"],
    [16, 18, "var(--color-stone)"],
    [24, 24, "var(--color-pumpkin-deep)"],
    [34, 22, "var(--color-plum-light)"],
    [42, 27, "var(--color-leaf-gold)"],
    [52, 19, "var(--color-stone)"],
    [60, 25, "var(--color-leaf-red)"],
  ] as const;
  return (
    <g>
      <path d={`M${x} 78 h96`} {...ink} stroke="var(--color-ember)" strokeWidth={3.5} />
      {books.map(([dx, h, fill]) => (
        <rect key={dx} x={x + 10 + dx} y={76 - h} width="7" height={h} fill={fill} {...thinInk} />
      ))}
      <path d={`M${x + 130} 34 h12`} {...ink} strokeWidth={2} />
      <HangingLantern x={x + 142} y={34} s={1.2} lit />
      <rect x={x + 6} y="100" width="62" height="40" fill="var(--color-night)" stroke="var(--color-ember)" strokeWidth="3" />
      <path d={`M${x + 12} 132 l14 -16 l10 9 l12 -15 l14 22`} fill="none" {...thinInk} stroke="var(--color-mist)" />
    </g>
  );
}

/** Everything behind the scene: the sky and ground of the place, carried on to both sides. */
export function Backdrop({ id }: { id: string }) {
  if (id === "clockmakers-night") {
    return (
      <g>
        <rect x={LEFT} width={FULL} height="180" fill="var(--color-plum)" />
        <rect x={LEFT} width={FULL} height="180" fill="var(--place-workshop)" opacity="0.35" />
        <rect x={LEFT} width={FULL} height="180" fill="var(--color-plum)" opacity="0.35" />
        {[-360, -180, 344, 524].map((x) => (
          <Shelves key={x} x={x} />
        ))}
        <rect x={LEFT} y="124" width={FULL} height="10" fill="var(--color-ember)" {...ink} />
        <rect x={LEFT} y="134" width={FULL} height="46" fill="var(--color-ink)" />
      </g>
    );
  }
  if (id === "barons-raven") {
    return (
      <g>
        <rect x={LEFT} width={FULL} height="180" fill="var(--color-plum)" />
        {[-380, -190, 350, 540].map((x) => (
          <Study key={x} x={x} />
        ))}
      </g>
    );
  }
  const place = OUTDOOR[id];
  if (!place) return <rect x={LEFT} width={FULL} height="180" fill="var(--color-plum)" />;
  return (
    <g>
      {TILES.map((dx) => (
        <g key={dx} transform={`translate(${dx} 0)`}>
          <Sky horizon={place.horizon} stars={place.stars} tint={place.tint} />
        </g>
      ))}
      {place.far && (
        <g fill="var(--color-plum-light)" opacity="0.58">
          <rect x={LEFT} y={place.far[0]} width={WING} height="180" />
          <rect x="320" y={place.far[1]} width={WING} height="180" />
        </g>
      )}
      <rect x={LEFT} y={place.ground[0]} width={WING + 160} height="180" fill="var(--color-plum)" />
      <rect x="160" y={place.ground[1]} width={WING + 160} height="180" fill="var(--color-plum)" />
      <Hamlet dir={-1} ground={place.ground[0]} houses={place.houses} />
      <Hamlet dir={1} ground={place.ground[1]} houses={place.houses} />
      {place.fog.map(([y, opacity]) =>
        TILES.map((dx) => (
          <g key={`${y}-${dx}`} transform={`translate(${dx} 0)`}>
            <Fog y={y} opacity={opacity} amp={5} />
          </g>
        )),
      )}
    </g>
  );
}

/** Drawn over the scene: a tree on each of its edges, outdoors, to cover the join with the wings. */
export function Seams({ id }: { id: string }) {
  if (id === "clockmakers-night") {
    // The bench runs on: cover the ink line at each end of the scene's own bench.
    return (
      <g>
        <rect x="-3" y="125" width="6" height="8" fill="var(--color-ember)" />
        <rect x="317" y="125" width="6" height="8" fill="var(--color-ember)" />
      </g>
    );
  }
  const place = OUTDOOR[id];
  if (!place) return null;
  const base = (ground: number) => Math.min(ground + 34, 172);
  return (
    <g>
      {/* Undergrowth at the foot of each edge, down to the bottom of the scene. */}
      <path
        d="M-22 181 C-22 166 -12 160 -5 166 C-2 156 10 158 9 170 C15 168 18 176 16 181 Z M304 181 C302 176 305 168 311 170 C310 158 322 156 325 166 C332 160 342 166 342 181 Z"
        fill="var(--color-ink)"
        stroke="var(--color-plum-light)"
        strokeWidth="0.6"
      />
      <Pine x={-7} base={base(place.ground[0])} h={70} />
      <Pine x={-24} base={base(place.ground[0]) - 12} h={46} />
      <Pine x={327} base={base(place.ground[1])} h={70} />
      <Pine x={344} base={base(place.ground[1]) - 12} h={46} />
    </g>
  );
}
