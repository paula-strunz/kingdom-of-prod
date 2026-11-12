import type { ComponentType } from "react";
import { BaronsRaven } from "./BaronsRaven";
import { ClockmakersNight } from "./ClockmakersNight";
import { CountingFog } from "./CountingFog";
import { EndingFog } from "./EndingFog";
import { EndingMuddles } from "./EndingMuddles";
import { EndingThrives } from "./EndingThrives";
import { LanternPleas } from "./LanternPleas";
import { WhisperingWell } from "./WhisperingWell";
import type { SceneProps } from "./parts";

export { VillageMap } from "./Map";
export { Backdrop, Seams, WIDE_VIEWBOX } from "./Wings";
export { VIEWBOX, type SceneProps } from "./parts";

/** Scenes by scene id. Quest scenes react to the outcome; ending scenes ignore it. Each draws inside a 320 x 180 viewBox. */
export const SCENES: Record<string, ComponentType<SceneProps>> = {
  "lantern-pleas": LanternPleas,
  "whispering-well": WhisperingWell,
  "clockmakers-night": ClockmakersNight,
  "barons-raven": BaronsRaven,
  "counting-fog": CountingFog,
  "ending-thrives": EndingThrives,
  "ending-muddles": EndingMuddles,
  "ending-fog": EndingFog,
};
