import type { Tier } from "../engine/types";
import styles from "./Game.module.css";

const LABEL: Record<Tier, string> = { wise: "lit", muddled: "dim", poor: "dark" };

type LanternState = "lit" | "dim" | "dark" | "empty";

/**
 * A small hand-drawn lantern. Colours and the flame come from CSS so each state
 * (lit, dim, dark, or an empty hook not yet hung) can fade from one to the next.
 */
function LanternArt({ state }: { state: LanternState }) {
  if (state === "empty") {
    return (
      <svg className={styles.lanternArt} viewBox="0 0 24 36">
        <path className={styles.lanternHook} d="M12 1 V5 M9 4 A3 3 0 0 1 15 4" />
        <path
          className={styles.lanternGhost}
          d="M7 10 L12 6 L17 10 M6.5 10 H17.5 V28 H6.5 Z M5 28 H19"
        />
      </svg>
    );
  }
  return (
    <svg className={styles.lanternArt} viewBox="0 0 24 36">
      <circle className={styles.lanternHalo} cx="12" cy="19" r="11" />
      <path className={styles.lanternHook} d="M9 4 A3 3 0 0 1 15 4 M12 1 V6" />
      <path className={styles.lanternCap} d="M6 10 L12 5.5 L18 10 Z" />
      <rect className={styles.lanternGlass} x="6.5" y="10" width="11" height="18" rx="2" />
      {state !== "dark" && (
        <path className={styles.lanternFlame} d="M12 14 C15 18 15 21 12 24 C9 21 9 18 12 14 Z" />
      )}
      {state === "dark" && <path className={styles.lanternSmoke} d="M12 22 C10 19 14 17 12 13" />}
      <path className={styles.lanternFrame} d="M12 10 V28 M6.5 19 H17.5" />
      <path className={styles.lanternBase} d="M5 28 H19 L17 31 H7 Z" />
    </svg>
  );
}

/** One lantern per quest. A quest not yet played shows an empty hook. */
export function Lanterns({ tiers, total }: { tiers: readonly Tier[]; total: number }) {
  const states = Array.from({ length: total }, (_, i) => tiers[i]);
  const summary = states
    .map((tier, i) => `${i + 1} ${tier ? LABEL[tier] : "not yet hung"}`)
    .join(", ");

  return (
    <ol className={styles.lanterns} aria-label={`Village lanterns: ${summary}`}>
      {states.map((tier, i) => {
        const state = (tier ? LABEL[tier] : "empty") as LanternState;
        return (
          <li
            key={i}
            aria-hidden="true"
            className={styles.lantern}
            data-testid="lantern"
            data-state={state}
          >
            <LanternArt state={state} />
          </li>
        );
      })}
    </ol>
  );
}
