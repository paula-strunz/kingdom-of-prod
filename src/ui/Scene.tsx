import { Backdrop, SCENES, Seams, VillageMap, WIDE_VIEWBOX, type SceneProps } from "../design/scenes";
import type { Tier } from "../engine/types";
import styles from "./Game.module.css";

/**
 * The world on screen: the scene of a quest or an ending, chosen by scene id.
 * It has no frame: Game.tsx lays it across the page (see `.stage`). A quest
 * scene is told the outcome once there is one, and redraws to show it. The drawing adds life; its meaning is always carried by
 * `alt` and by the text under it.
 */
export function Scene({ id, alt, outcome, thinking }: { id: string; alt: string } & SceneProps) {
  const Illustration = SCENES[id];
  return (
    <svg
      className={styles.scene}
      data-scene={id}
      data-outcome={outcome ?? "none"}
      role="img"
      aria-label={alt}
      viewBox={WIDE_VIEWBOX}
      preserveAspectRatio="xMidYMid slice"
    >
      {/* More of the place on both sides, for wide screens. The scene itself is x 0 to 320. */}
      <Backdrop id={id} />
      {Illustration ? (
        <Illustration outcome={outcome} thinking={thinking} />
      ) : (
        <rect width="320" height="180" fill="var(--color-plum)" />
      )}
      <Seams id={id} />
    </svg>
  );
}

/** The map of Hollowmere on the same screen, shown on the way to quest `index`. */
export function TravelMap({
  index,
  tiers,
  alt,
}: {
  index: number;
  tiers: readonly Tier[];
  alt: string;
}) {
  return (
    <VillageMap className={styles.scene} index={index} tiers={tiers} alt={alt} />
  );
}
