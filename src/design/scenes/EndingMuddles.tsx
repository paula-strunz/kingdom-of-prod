import { Village } from "./village";

/** Hollowmere muddles on: some lanterns burn and some do not. */
export function EndingMuddles() {
  return (
    <Village windows={[true, false, true, false, false, true, false, true]} lanterns={[true, false, true, false]} fog="middle" />
  );
}
