import { Village } from "./village";

/** Hollowmere thrives: every window and every lantern along the lane is lit. */
export function EndingThrives() {
  return <Village windows={[true, true, true, true, true, true, true, true]} lanterns={[true, true, true, true]} fog="low" />;
}
