import { COAT, Keeper, Villager } from "./folk";
import { Appear, Bob, Fog, HangingLantern, House, LanternPost, Leaf, Moon, Sky, ink, thinInk, type SceneProps } from "./parts";

const CROWD = [
  { x: 40, y: 182, s: 1.15, cloak: COAT.slate, reach: [16, -18], look: 0 },
  { x: 78, y: 186, s: 1.3, cloak: COAT.plum, reach: [14, -22], look: 1 },
  { x: 116, y: 182, s: 1.1, cloak: COAT.mustard, reach: [4, -24], look: 2 },
  { x: 200, y: 182, s: 1.1, cloak: COAT.olive, reach: [-4, -24], look: 3 },
  { x: 238, y: 186, s: 1.3, cloak: COAT.teal, reach: [-14, -22], look: 4 },
  { x: 280, y: 182, s: 1.15, cloak: COAT.brown, reach: [-16, -18], look: 5 },
] as const;

/**
 * The village gate at dusk. The keeper stands in the gateway while the crowd
 * jumps and reaches for two unlit lanterns. Dark lanes run away behind.
 *
 * Outcomes: wise lights the two busy lanes; muddled lights one lane and one
 * short street; poor lights the two short streets and leaves the lanes dark.
 */
export function LanternPleas({ outcome, thinking }: SceneProps) {
  const lanes = outcome === "wise" ? [true, true] : outcome === "muddled" ? [true, false] : [false, false];
  const streets = outcome === "poor" ? [true, true] : outcome === "muddled" ? [false, true] : [false, false];
  const laneFill = (lit: boolean | undefined) => (lit ? "var(--color-ember)" : "var(--color-night)");

  return (
    <g>
      <Sky horizon={112} tint="var(--place-gate)" />
      <Moon x={52} y={44} r={13} />

      {/* Ground and the lanes stretching away between the houses */}
      <rect y="108" width="320" height="72" fill="var(--color-plum)" />
      <path d="M118 180 L150 108 H158 L146 180 Z" fill={laneFill(lanes[0])} />
      <path d="M210 180 L168 108 H176 L238 180 Z" fill={laneFill(lanes[1])} />
      <House x={112} y={112} w={20} h={14} lit={lanes[0]} />
      <House x={136} y={110} w={12} h={9} />
      <House x={176} y={110} w={14} h={10} />
      <House x={194} y={114} w={22} h={15} lit={lanes[1]} />
      <House x={20} y={118} w={30} h={20} lit={streets[0]} />
      <House x={262} y={120} w={34} h={22} lit={streets[1]} />
      <Fog y={116} opacity={0.18} amp={4} />

      {/* Who walks the lanes after dusk */}
      {outcome === "wise" && (
        <Appear delay={1.2}>
          <Villager x={147} y={134} s={0.42} cloak="var(--color-mist)" />
          <Villager x={153} y={124} s={0.32} cloak="var(--color-mist)" />
          <Villager x={190} y={132} s={0.42} cloak="var(--color-mist)" />
          <Villager x={180} y={122} s={0.3} cloak="var(--color-mist)" />
        </Appear>
      )}
      {outcome === "poor" && (
        <Appear delay={1.2}>
          <g opacity="0.55">
            <Villager x={146} y={136} s={0.34} cloak="var(--color-stone)" />
            <Villager x={152} y={133} s={0.28} cloak="var(--color-stone)" />
          </g>
        </Appear>
      )}

      <Keeper x={160} y={152} s={1.15} from={outcome ? undefined : -120} thinking={thinking} />

      {/* The gate: two stone pillars and an iron arch */}
      {[82, 222].map((px) => (
        <g key={px}>
          <rect x={px} y="46" width="16" height="104" fill="var(--color-stone)" {...ink} />
          <path d={`M${px} 66 H${px + 16} M${px} 88 H${px + 16} M${px} 110 H${px + 16} M${px} 132 H${px + 16} M${px + 8} 46 V66 M${px + 5} 88 V110 M${px + 11} 110 V132`} {...thinInk} fill="none" opacity="0.7" />
          <path d={`M${px - 3} 46 H${px + 19} L${px + 16} 40 H${px} Z`} fill="var(--color-plum-light)" {...ink} />
        </g>
      ))}
      <path d="M98 56 Q160 18 222 56" fill="none" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
      <path d="M98 64 Q160 30 222 64" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />
      <path d="M120 49 V58 M200 49 V58" {...ink} />

      {/* The two lanterns: unlit on the gate, then wherever the keeper sent them */}
      {!outcome && (
        <>
          <HangingLantern x={120} y={58} s={1.35} />
          <HangingLantern x={200} y={58} s={1.35} />
        </>
      )}
      {lanes[0] && (
        <Appear delay={0.3}>
          <LanternPost x={126} y={150} h={34} lit />
        </Appear>
      )}
      {lanes[1] && (
        <Appear delay={0.7}>
          <LanternPost x={206} y={150} h={34} lit />
        </Appear>
      )}
      {streets[0] && (
        <Appear delay={0.3}>
          <LanternPost x={52} y={140} h={30} lit />
        </Appear>
      )}
      {streets[1] && (
        <Appear delay={0.7}>
          <LanternPost x={250} y={142} h={30} lit />
        </Appear>
      )}

      {/* The crowd: jumping and reaching, until the choice is made */}
      {CROWD.map((v, i) => (
        <Bob key={v.x} on={!outcome} delay={-i * 0.17}>
          <Villager
            x={v.x}
            y={v.y}
            s={v.s}
            cloak={v.cloak}
            look={v.look}
            mood={outcome ? "calm" : "cheer"}
            reach={outcome ? undefined : [v.reach[0], v.reach[1]]}
          />
        </Bob>
      ))}

      <Fog y={166} opacity={0.22} amp={4} />
      <Leaf x={250} y={30} rot={30} s={1.2} color="var(--color-leaf-gold)" />
      <Leaf x={296} y={78} rot={-20} color="var(--color-pumpkin)" />
      <Leaf x={14} y={96} rot={60} s={0.9} />
    </g>
  );
}
