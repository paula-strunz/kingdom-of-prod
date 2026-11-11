import type { ComponentType } from "react";
import { BaronsRaven } from "./BaronsRaven";
import { ClockmakersNight } from "./ClockmakersNight";
import { CountingFog } from "./CountingFog";
import { EndingFog } from "./EndingFog";
import { EndingMuddles } from "./EndingMuddles";
import { EndingThrives } from "./EndingThrives";
import { LanternPleas } from "./LanternPleas";
import { WhisperingWell } from "./WhisperingWell";

export { VIEWBOX } from "./parts";

/** Scene illustrations by scene id. Each draws inside a 320 x 180 viewBox. */
export const SCENES: Record<string, ComponentType> = {
  "lantern-pleas": LanternPleas,
  "whispering-well": WhisperingWell,
  "clockmakers-night": ClockmakersNight,
  "barons-raven": BaronsRaven,
  "counting-fog": CountingFog,
  "ending-thrives": EndingThrives,
  "ending-muddles": EndingMuddles,
  "ending-fog": EndingFog,
};
