import { SCENES, VIEWBOX } from "../design/scenes";
import styles from "./Game.module.css";

/**
 * A storybook illustration for a quest or an ending, chosen by scene id. The
 * drawing is decorative detail; its meaning is carried by `alt`.
 */
export function Scene({ id, alt }: { id: string; alt: string }) {
  const Illustration = SCENES[id];
  return (
    <svg
      className={styles.scene}
      data-scene={id}
      role="img"
      aria-label={alt}
      viewBox={VIEWBOX}
      preserveAspectRatio="xMidYMid slice"
    >
      {Illustration ? <Illustration /> : <rect width="320" height="180" fill="var(--color-plum)" />}
    </svg>
  );
}
