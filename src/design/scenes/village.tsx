import { Fog, HangingLantern, House, Leaf, Moon, Sky, ink } from "./parts";

const HOUSES = [
  { x: 14, y: 124, w: 32, h: 24 },
  { x: 58, y: 116, w: 26, h: 20 },
  { x: 88, y: 120, w: 30, h: 22 },
  { x: 204, y: 118, w: 28, h: 22 },
  { x: 240, y: 126, w: 30, h: 24 },
  { x: 276, y: 116, w: 30, h: 22 },
  { x: 30, y: 168, w: 40, h: 30 },
  { x: 244, y: 170, w: 44, h: 32 },
];

const LANTERNS = [
  { x: 108, y: 176 },
  { x: 192, y: 164 },
  { x: 132, y: 136 },
  { x: 176, y: 124 },
];

/**
 * Hollowmere seen from the lane at the end of the story. The three endings draw
 * the same village with a different number of lights and a different depth of fog.
 */
export function Village({
  windows,
  lanterns,
  fog,
  lane = true,
}: {
  windows: readonly boolean[];
  lanterns: readonly boolean[];
  fog: "low" | "middle" | "deep";
  lane?: boolean;
}) {
  return (
    <g>
      <Sky horizon={104} />
      <Moon x={262} y={36} r={14} />
      <path d="M0 106 C60 92 120 100 170 96 S270 88 320 98 V180 H0 Z" fill="var(--color-plum-light)" opacity="0.55" />
      <path d="M0 124 C70 112 140 118 200 114 S290 112 320 120 V180 H0 Z" fill="var(--color-plum)" {...ink} strokeWidth={1} />

      {lane && (
        <path
          d="M132 180 C150 160 104 150 132 132 S180 116 160 100 L166 100 C190 118 152 132 150 140 S178 162 190 180 Z"
          fill={lanterns.some(Boolean) ? "var(--color-ember)" : "var(--color-night)"}
          opacity="0.75"
        />
      )}

      {HOUSES.map((house, i) => (
        <House key={i} {...house} lit={windows[i]} />
      ))}

      {lane &&
        LANTERNS.map((spot, i) => (
          <g key={i}>
            <path d={`M${spot.x} ${spot.y} V${spot.y - 30} H${spot.x + 8}`} fill="none" {...ink} stroke="var(--color-ink)" strokeWidth={2} />
            <HangingLantern x={spot.x + 8} y={spot.y - 30} s={0.9} lit={lanterns[i]} />
          </g>
        ))}

      {fog === "low" && (
        <>
          <Fog y={164} opacity={0.18} amp={4} />
          <Leaf x={92} y={60} rot={30} color="var(--color-leaf-gold)" />
          <Leaf x={210} y={170} rot={-40} />
        </>
      )}
      {fog === "middle" && (
        <>
          <Fog y={128} opacity={0.2} amp={6} />
          <Fog y={156} opacity={0.3} amp={4} />
          <Leaf x={70} y={70} rot={-20} color="var(--color-pumpkin)" />
        </>
      )}
      {fog === "deep" && (
        <>
          <Fog y={74} opacity={0.24} amp={8} />
          <Fog y={96} opacity={0.4} amp={6} />
          <Fog y={120} opacity={0.5} amp={5} />
          <Fog y={150} opacity={0.5} amp={4} />
        </>
      )}
    </g>
  );
}
