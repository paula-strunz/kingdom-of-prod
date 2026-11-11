import { Fog, HangingLantern, House, Leaf, Moon, Sky, Villager, ink, thinInk } from "./parts";

/** A crowd at the village gate at dusk, reaching toward two unlit lanterns. Dark lanes run away behind. */
export function LanternPleas() {
  return (
    <g>
      <Sky horizon={112} />
      <Moon x={52} y={44} r={13} />

      {/* Ground and the dark lanes stretching away between the houses */}
      <rect y="108" width="320" height="72" fill="var(--color-plum)" />
      <path d="M118 180 L150 108 H158 L146 180 Z" fill="var(--color-night)" />
      <path d="M210 180 L168 108 H176 L238 180 Z" fill="var(--color-night)" />
      <House x={112} y={112} w={20} h={14} />
      <House x={136} y={110} w={12} h={9} />
      <House x={176} y={110} w={14} h={10} />
      <House x={194} y={114} w={22} h={15} />
      <House x={20} y={118} w={30} h={20} />
      <House x={262} y={120} w={34} h={22} />
      <Fog y={116} opacity={0.18} amp={4} />

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

      {/* Two unlit lanterns */}
      <HangingLantern x={120} y={58} s={1.35} />
      <HangingLantern x={200} y={58} s={1.35} />

      {/* The crowd, reaching up */}
      <Villager x={40} y={182} s={1.15} cloak="var(--color-plum-light)" reach={[16, -18]} />
      <Villager x={78} y={186} s={1.3} cloak="var(--color-dusk)" reach={[14, -22]} />
      <Villager x={116} y={180} s={1.1} cloak="var(--color-ember)" reach={[4, -24]} />
      <Villager x={156} y={188} s={1.35} cloak="var(--color-plum-light)" />
      <Villager x={196} y={180} s={1.1} cloak="var(--color-moss)" reach={[-4, -24]} />
      <Villager x={236} y={186} s={1.3} cloak="var(--color-dusk)" reach={[-14, -22]} />
      <Villager x={278} y={182} s={1.15} cloak="var(--color-ember)" reach={[-16, -18]} />

      <Fog y={166} opacity={0.22} amp={4} />
      <Leaf x={250} y={30} rot={30} s={1.2} color="var(--color-leaf-gold)" />
      <Leaf x={296} y={78} rot={-20} color="var(--color-pumpkin)" />
      <Leaf x={14} y={96} rot={60} s={0.9} />
    </g>
  );
}
