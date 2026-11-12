import type { Tier } from "../../engine/types";
import { Keeper } from "./folk";
import { Fog, House, Moon, Pumpkin, Sky, ink, thinInk, vars } from "./parts";
import { Backdrop, Seams, WIDE_VIEWBOX } from "./Wings";
import styles from "./scenes.module.css";

/** Where each quest's place sits on the map, in play order. */
export const STOPS = [
  { x: 44, y: 142 },
  { x: 104, y: 100 },
  { x: 164, y: 138 },
  { x: 222, y: 92 },
  { x: 284, y: 128 },
] as const;
const START = { x: -14, y: 166 };

const LANTERN_FILL: Record<Tier, string> = {
  wise: "var(--color-amber)",
  muddled: "#6a3d1a",
  poor: "var(--color-night)",
};

function Gate({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 11} y={y - 22} width="5" height="20" fill="var(--color-stone)" {...thinInk} />
      <rect x={x + 6} y={y - 22} width="5" height="20" fill="var(--color-stone)" {...thinInk} />
      <path d={`M${x - 8} ${y - 21} Q${x} ${y - 34} ${x + 8} ${y - 21}`} fill="none" {...ink} strokeWidth={2} />
    </g>
  );
}

function Well({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x - 10} ${y - 20} L${x} ${y - 28} L${x + 10} ${y - 20} Z`} fill="var(--color-ink)" {...thinInk} />
      <path d={`M${x - 7} ${y - 20} V${y - 8} M${x + 7} ${y - 20} V${y - 8}`} {...ink} stroke="var(--color-ember)" strokeWidth={2} />
      <path d={`M${x - 9} ${y - 10} V${y - 3} Q${x} ${y + 1} ${x + 9} ${y - 3} V${y - 10} Z`} fill="var(--color-stone)" {...thinInk} />
      <ellipse cx={x} cy={y - 10} rx="9" ry="2.5" fill="var(--color-night)" {...thinInk} />
    </g>
  );
}

function Workshop({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <House x={x - 12} y={y - 2} w={24} h={16} lit />
      <circle cx={x} cy={y - 26} r="5.5" fill="var(--color-parchment)" {...thinInk} />
      <path d={`M${x} ${y - 26} V${y - 30} M${x} ${y - 26} h3`} {...thinInk} />
    </g>
  );
}

function Tower({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 7} y={y - 30} width="14" height="28" fill="var(--color-plum-light)" {...thinInk} />
      <path d={`M${x - 9} ${y - 30} L${x} ${y - 42} L${x + 9} ${y - 30} Z`} fill="var(--color-ink)" {...thinInk} />
      <rect x={x - 3} y={y - 25} width="6" height="7" fill="var(--color-amber)" {...thinInk} />
    </g>
  );
}

function Market({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x - 10} ${y - 16} V${y - 2} M${x + 10} ${y - 16} V${y - 2}`} {...ink} stroke="var(--color-ember)" strokeWidth={2} />
      <path d={`M${x - 13} ${y - 16} L${x} ${y - 24} L${x + 13} ${y - 16} Z`} fill="var(--color-pumpkin-deep)" {...thinInk} />
      <Pumpkin x={x - 4} y={y - 3} s={0.45} />
      <Pumpkin x={x + 4} y={y - 3} s={0.45} />
    </g>
  );
}

const ICONS = [Gate, Well, Workshop, Tower, Market];

/**
 * The map of Hollowmere for the travel beat. Five places on one road. Each
 * finished place keeps a lantern in the state the player earned there, and the
 * keeper walks from the last place to the next one.
 */
export function VillageMap({
  index,
  tiers,
  alt,
  className,
}: {
  index: number;
  tiers: readonly Tier[];
  alt: string;
  className?: string;
}) {
  const to = STOPS[index] ?? STOPS[0];
  const from = index > 0 ? (STOPS[index - 1] ?? START) : START;
  const road = [START, ...STOPS].map((p) => `${p.x} ${p.y}`).join(" L");
  const walked = [START, ...STOPS.slice(0, index + 1)].map((p) => `${p.x} ${p.y}`).join(" L");

  return (
    <svg className={className} data-map={index} role="img" aria-label={alt} viewBox={WIDE_VIEWBOX} preserveAspectRatio="xMidYMid slice">
      <Backdrop id="map" />
      <Sky horizon={70} />
      <Moon x={36} y={28} r={9} />
      <path d="M0 74 C40 60 80 70 120 64 S220 52 260 62 S300 66 320 62 V180 H0 Z" fill="var(--color-plum-light)" opacity="0.6" />
      <path d="M0 96 C60 84 130 92 190 86 S280 84 320 92 V180 H0 Z" fill="var(--color-plum)" />
      {/* The river, and the bridge on the last stretch of road */}
      <path d="M262 60 C244 84 262 104 252 124 S262 160 250 180" fill="none" stroke="var(--color-stone)" strokeWidth="11" strokeLinecap="round" opacity="0.6" />
      <path d="M262 60 C244 84 262 104 252 124 S262 160 250 180" fill="none" stroke="var(--color-mist)" strokeWidth="1" strokeDasharray="5 9" opacity="0.5" />
      <path d="M244 104 L262 114" stroke="var(--color-ember)" strokeWidth="5" strokeLinecap="round" />
      <Fog y={150} opacity={0.14} amp={5} />

      {/* The road: all of it faint, the part already walked in lantern light */}
      <path d={`M${road}`} fill="none" stroke="var(--color-mist)" strokeWidth="1.6" strokeDasharray="1 5" strokeLinecap="round" opacity="0.7" />
      <path d={`M${walked}`} fill="none" stroke="var(--color-amber)" strokeWidth="2" strokeDasharray="1 5" strokeLinecap="round" />

      {STOPS.map((stop, i) => {
        const Icon = ICONS[i]!;
        const tier = tiers[i];
        return (
          <g key={i} data-stop={i} data-state={tier ?? (i === index ? "next" : "ahead")} opacity={i > index ? 0.55 : 1}>
            <Icon x={stop.x} y={stop.y - 4} />
            {tier && (
              <g>
                {tier === "wise" && <circle cx={stop.x + 16} cy={stop.y - 12} r="9" fill="var(--color-amber)" opacity="0.2" />}
                <path d={`M${stop.x + 16} ${stop.y} V${stop.y - 8}`} {...thinInk} />
                <rect x={stop.x + 13} y={stop.y - 16} width="6" height="8" rx="1.5" fill={LANTERN_FILL[tier]} {...thinInk} stroke={tier === "poor" ? "var(--color-stone)" : "var(--color-ink)"} />
              </g>
            )}
            {i === index && <circle className={styles.pulse} cx={stop.x} cy={stop.y} r="7" fill="none" stroke="var(--color-amber)" strokeWidth="1.5" />}
          </g>
        );
      })}

      <g className={styles.mapWalk} style={vars({ dx: from.x - to.x, dy: from.y - to.y })}>
        <Keeper x={to.x} y={to.y + 2} s={0.62} stride="long" />
      </g>
      <Seams id="map" />
    </svg>
  );
}
