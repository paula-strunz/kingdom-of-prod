import type { CSSProperties } from "react";
import styles from "./atmosphere.module.css";

/**
 * The night behind every page: a moonlit sky, a far treeline, two drifting fog
 * banks and a few slowly falling leaves. Purely decorative and hidden from
 * assistive tech. Under reduced motion the leaves rest where they are and the
 * fog stands still (see atmosphere.module.css).
 */

type Leaf = {
  x: number; // vw, horizontal start
  rest: number; // vh, where it rests when motion is reduced
  size: number; // rem
  delay: number; // s, negative so the sky is never empty on load
  fall: number; // s, one full fall
  sway: number; // s, one sway
  drift: number; // vw, sideways travel during the fall
  shape: 0 | 1;
  color: string;
};

const LEAVES: Leaf[] = [
  { x: 6, rest: 18, size: 1.4, delay: -2, fall: 19, sway: 4.2, drift: 8, shape: 0, color: "var(--color-leaf-red)" },
  { x: 18, rest: 72, size: 1, delay: -11, fall: 23, sway: 5.1, drift: -6, shape: 1, color: "var(--color-leaf-gold)" },
  { x: 29, rest: 40, size: 1.2, delay: -6, fall: 21, sway: 3.8, drift: 10, shape: 0, color: "var(--color-pumpkin)" },
  { x: 41, rest: 88, size: 0.9, delay: -16, fall: 26, sway: 4.6, drift: -9, shape: 1, color: "var(--color-leaf-red)" },
  { x: 54, rest: 10, size: 1.3, delay: -4, fall: 20, sway: 5.4, drift: 7, shape: 1, color: "var(--color-leaf-gold)" },
  { x: 63, rest: 58, size: 1.1, delay: -13, fall: 24, sway: 4, drift: -7, shape: 0, color: "var(--color-pumpkin-deep)" },
  { x: 74, rest: 30, size: 1.5, delay: -8, fall: 22, sway: 4.8, drift: 9, shape: 0, color: "var(--color-leaf-gold)" },
  { x: 85, rest: 80, size: 1, delay: -18, fall: 25, sway: 3.6, drift: -10, shape: 1, color: "var(--color-pumpkin)" },
  { x: 93, rest: 46, size: 1.2, delay: -1, fall: 21, sway: 5, drift: -5, shape: 0, color: "var(--color-leaf-red)" },
  { x: 48, rest: 64, size: 0.8, delay: -20, fall: 28, sway: 4.4, drift: 6, shape: 1, color: "var(--color-pumpkin-deep)" },
];

const LEAF_PATHS = [
  // A small maple leaf with a stem.
  "M12 2 L14 7 L19 5 L17 10 L22 12 L17 14 L19 19 L14 17 L12 22 L10 17 L5 19 L7 14 L2 12 L7 10 L5 5 L10 7 Z",
  // A birch leaf, pointed at the tip.
  "M12 2 C18 6 20 12 12 22 C4 12 6 6 12 2 Z",
];

export function Atmosphere() {
  return (
    <div className={styles.atmosphere} aria-hidden="true">
      <div className={styles.sky} />
      <div className={styles.moon} />
      <div className={styles.tint} data-testid="place-tint" />
      <svg
        className={styles.treeline}
        viewBox="0 0 1200 160"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          fill="var(--color-ink)"
          d="M0 160 V112 C40 104 60 96 90 100 L104 72 L112 98 C150 92 170 104 210 98 L222 64 L232 96 C280 88 300 100 350 96 C390 92 420 80 460 86 L474 54 L486 84 C540 80 580 96 640 92 L652 70 L662 92 C720 90 760 82 800 88 C840 94 880 84 920 80 L934 48 L946 82 C1000 86 1040 98 1090 94 L1102 66 L1112 94 C1150 92 1180 100 1200 98 V160 Z"
          opacity="0.9"
        />
      </svg>
      <div className={`${styles.fog} ${styles.fogFar}`} />
      <div className={styles.leaves}>
        {LEAVES.map((leaf, i) => (
          <span
            key={i}
            className={styles.leaf}
            style={
              {
                "--x": `${leaf.x}vw`,
                "--rest": `${leaf.rest}vh`,
                "--size": `${leaf.size}rem`,
                "--delay": `${leaf.delay}s`,
                "--fall": `${leaf.fall}s`,
                "--sway": `${leaf.sway}s`,
                "--drift": `${leaf.drift}vw`,
              } as CSSProperties
            }
          >
            <svg className={styles.leafShape} viewBox="0 0 24 24" focusable="false">
              <path d={LEAF_PATHS[leaf.shape]} fill={leaf.color} />
              <path d="M12 4 V23" stroke="var(--color-ink)" strokeWidth="1" opacity="0.45" />
            </svg>
          </span>
        ))}
      </div>
      <div className={`${styles.fog} ${styles.fogNear}`} />
    </div>
  );
}
