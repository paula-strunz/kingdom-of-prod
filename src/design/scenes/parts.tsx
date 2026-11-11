/**
 * Shared drawing pieces for the storybook scenes. Every scene is drawn on a
 * 320 x 180 canvas in the same hand-drawn manner: flat washes of the palette,
 * soft ink outlines with round joins, low fog and a few leaves. No gradients or
 * ids, so a scene can appear more than once on a page without clashes.
 */
import type { SVGProps } from "react";

export const VIEWBOX = "0 0 320 180";
export const WIDTH = 320;
export const HEIGHT = 180;

/** Ink outline props, spread onto shapes. */
export const ink = {
  stroke: "var(--color-ink)",
  strokeWidth: 1.6,
  strokeLinejoin: "round",
  strokeLinecap: "round",
} as const satisfies SVGProps<SVGPathElement>;

export const thinInk = { ...ink, strokeWidth: 1 } as const;

/** Night sky with a dusky band near the horizon and a few stars. */
export function Sky({ horizon = 100, stars = true }: { horizon?: number; stars?: boolean }) {
  return (
    <g>
      <rect width={WIDTH} height={HEIGHT} fill="var(--color-night)" />
      <rect y={horizon - 50} width={WIDTH} height={HEIGHT} fill="var(--color-plum)" opacity="0.7" />
      <rect y={horizon - 20} width={WIDTH} height={HEIGHT} fill="var(--color-dusk)" opacity="0.8" />
      {stars && (
        <g fill="var(--color-parchment)">
          <circle cx="24" cy="18" r="0.9" opacity="0.7" />
          <circle cx="70" cy="34" r="0.7" opacity="0.5" />
          <circle cx="118" cy="14" r="1" opacity="0.6" />
          <circle cx="166" cy="30" r="0.7" opacity="0.5" />
          <circle cx="204" cy="12" r="0.8" opacity="0.6" />
          <circle cx="298" cy="40" r="0.9" opacity="0.5" />
          <circle cx="140" cy="48" r="0.6" opacity="0.4" />
        </g>
      )}
    </g>
  );
}

/** Moon with a soft amber halo. `shadow` between 0 and 1 shades a crescent on the right for a gibbous moon. */
export function Moon({
  x,
  y,
  r,
  shadow = 0,
  shadowFill = "var(--color-night)",
}: {
  x: number;
  y: number;
  r: number;
  shadow?: number;
  shadowFill?: string;
}) {
  return (
    <g>
      <circle cx={x} cy={y} r={r * 2.6} fill="var(--color-amber)" opacity="0.06" />
      <circle cx={x} cy={y} r={r * 1.7} fill="var(--color-amber)" opacity="0.1" />
      <circle cx={x} cy={y} r={r} fill="#fbeccb" />
      <circle cx={x - r * 0.3} cy={y - r * 0.2} r={r * 0.22} fill="var(--color-mist)" opacity="0.45" />
      <circle cx={x + r * 0.35} cy={y + r * 0.3} r={r * 0.15} fill="var(--color-mist)" opacity="0.4" />
      {shadow > 0 && (
        <path
          d={`M${x} ${y - r} A${r} ${r} 0 0 1 ${x} ${y + r} A${r * (1 - shadow)} ${r} 0 0 0 ${x} ${y - r} Z`}
          fill={shadowFill}
          opacity="0.75"
        />
      )}
    </g>
  );
}

/** A band of fog with a soft, wavy top edge. */
export function Fog({
  y,
  opacity = 0.35,
  amp = 6,
  fill = "var(--color-mist)",
}: {
  y: number;
  opacity?: number;
  amp?: number;
  fill?: string;
}) {
  const d = `M0 ${y} C40 ${y - amp} 70 ${y + amp} 110 ${y} S180 ${y - amp} 220 ${y} S290 ${y + amp} 320 ${y - amp / 2} V180 H0 Z`;
  return <path d={d} fill={fill} opacity={opacity} />;
}

/** A small fallen or falling leaf. */
export function Leaf({
  x,
  y,
  rot = 0,
  s = 1,
  color = "var(--color-leaf-red)",
}: {
  x: number;
  y: number;
  rot?: number;
  s?: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0 -5 C4 -3 5 1 0 5 C-5 1 -4 -3 0 -5 Z" fill={color} {...thinInk} strokeWidth={0.6} />
      <path d="M0 -4 V6" {...thinInk} strokeWidth={0.5} fill="none" />
    </g>
  );
}

/** A villager: hooded cloak, round head. `reach` raises an arm toward a point (dx, dy from the shoulder). */
export function Villager({
  x,
  y,
  s = 1,
  cloak = "var(--color-plum-light)",
  reach,
  hat = false,
  opacity = 1,
}: {
  x: number;
  y: number;
  s?: number;
  cloak?: string;
  reach?: [number, number];
  hat?: boolean;
  opacity?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      {reach && (
        <path d={`M3 -24 Q${reach[0] * 0.5 + 4} ${reach[1] * 0.6 - 26} ${reach[0]} ${reach[1] - 24}`} fill="none" {...ink} strokeWidth={3.2} stroke={cloak} />
      )}
      {reach && (
        <path d={`M3 -24 Q${reach[0] * 0.5 + 4} ${reach[1] * 0.6 - 26} ${reach[0]} ${reach[1] - 24}`} fill="none" {...thinInk} strokeWidth={0.8} />
      )}
      <path d="M-9 0 C-9 -12 -7 -22 0 -26 C7 -22 9 -12 9 0 Z" fill={cloak} {...ink} />
      <circle cx="0" cy="-30" r="5.5" fill="#d9c3a5" {...ink} />
      <path d="M-6.5 -29 C-6 -37 6 -37 6.5 -29 C4 -33 -4 -33 -6.5 -29 Z" fill={cloak} {...thinInk} />
      {hat && (
        <g>
          <path d="M-9 -34 H9" {...ink} />
          <rect x="-5" y="-46" width="10" height="12" fill="var(--color-ink)" />
        </g>
      )}
    </g>
  );
}

/** A lantern hanging from its top at (x, y). */
export function HangingLantern({
  x,
  y,
  s = 1,
  lit = false,
}: {
  x: number;
  y: number;
  s?: number;
  lit?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {lit && <circle cx="0" cy="13" r="22" fill="var(--color-amber)" opacity="0.14" />}
      {lit && <circle cx="0" cy="13" r="12" fill="var(--color-amber)" opacity="0.2" />}
      <circle cx="0" cy="0" r="2" fill="none" {...thinInk} />
      <path d="M-5 6 L0 2 L5 6 Z" fill="var(--color-ink)" {...thinInk} />
      <rect x="-5" y="6" width="10" height="14" rx="2" fill={lit ? "var(--color-amber)" : "var(--color-night)"} {...ink} />
      {lit && <path d="M0 10 C2 13 2 15 0 17 C-2 15 -2 13 0 10 Z" fill="var(--color-pumpkin)" />}
      <path d="M0 6 V20" {...thinInk} />
      <path d="M-6 20 H6" {...ink} />
    </g>
  );
}

/** A pumpkin sitting on (x, y). */
export function Pumpkin({ x, y, s = 1, dim = 1 }: { x: number; y: number; s?: number; dim?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={dim}>
      <path d="M-9 -1 C-12 -12 -3 -14 0 -11 C3 -14 12 -12 9 -1 C7 2 -7 2 -9 -1 Z" fill="var(--color-pumpkin)" {...ink} />
      <path d="M0 -11 C-2 -7 -2 -3 0 1 M-5 -12 C-7 -8 -6 -3 -4 1 M5 -12 C7 -8 6 -3 4 1" fill="none" stroke="var(--color-pumpkin-deep)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M0 -11 C0 -14 1 -16 3 -17" fill="none" stroke="var(--color-moss)" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

/** A little house with a pitched roof. `lit` lights its window. */
export function House({
  x,
  y,
  w = 30,
  h = 22,
  lit = false,
  body = "var(--color-plum-light)",
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  lit?: boolean;
  body?: string;
}) {
  const roof = h * 0.7;
  return (
    <g transform={`translate(${x} ${y})`}>
      {lit && <circle cx={w / 2} cy={-h / 2} r={w * 0.5} fill="var(--color-amber)" opacity="0.12" />}
      <path d={`M0 0 V${-h} H${w} V0 Z`} fill={body} {...ink} />
      <path d={`M${-3} ${-h} L${w / 2} ${-h - roof} L${w + 3} ${-h} Z`} fill="var(--color-ink)" {...ink} />
      <rect
        x={w / 2 - 4}
        y={-h + 5}
        width="8"
        height="8"
        fill={lit ? "var(--color-amber)" : "var(--color-night)"}
        {...thinInk}
      />
      <path d={`M${w / 2} ${-h + 5} V${-h + 13} M${w / 2 - 4} ${-h + 9} H${w / 2 + 4}`} {...thinInk} strokeWidth={0.8} />
    </g>
  );
}

/** Build a gear outline centred on (cx, cy). */
export function gearPath(cx: number, cy: number, r: number, teeth: number): string {
  const outer = r;
  const inner = r * 0.78;
  const step = (Math.PI * 2) / teeth;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const corners = [
      [inner, a],
      [outer, a + step * 0.15],
      [outer, a + step * 0.45],
      [inner, a + step * 0.6],
    ] as const;
    for (const [rad, ang] of corners) {
      pts.push(`${(cx + rad * Math.cos(ang)).toFixed(2)} ${(cy + rad * Math.sin(ang)).toFixed(2)}`);
    }
  }
  return `M${pts.join(" L")} Z`;
}
