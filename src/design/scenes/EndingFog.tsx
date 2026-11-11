import { Village } from "./village";

/** The fog takes Hollowmere: every light is out, fog settles over the rooftops, and no road leads in. */
export function EndingFog() {
  return <Village windows={[false, false, false, false, false, false, false, false]} lanterns={[false, false, false, false]} fog="deep" lane={false} />;
}
