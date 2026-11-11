/**
 * Ambient sound generated in the browser: soft wind (filtered noise that
 * swells slowly) over a low drone. No audio file is loaded.
 */
export type Ambience = { setMuted(muted: boolean): void; stop(): void };

const LEVEL = 0.5;

export function startAmbience(muted: boolean): Ambience | null {
  const Ctx =
    typeof window === "undefined"
      ? undefined
      : (window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  if (!Ctx) return null;

  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = muted ? 0 : LEVEL;
  master.connect(ctx.destination);

  // Wind: brown noise through a low-pass filter whose cutoff drifts.
  const seconds = 4;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = last * 3.5;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const wind = ctx.createBiquadFilter();
  wind.type = "lowpass";
  wind.frequency.value = 420;
  const windGain = ctx.createGain();
  windGain.gain.value = 0.35;
  const swell = ctx.createOscillator();
  swell.frequency.value = 0.07;
  const swellDepth = ctx.createGain();
  swellDepth.gain.value = 220;
  swell.connect(swellDepth).connect(wind.frequency);
  noise.connect(wind).connect(windGain).connect(master);

  // Drone: two low sines a fifth apart, very quiet.
  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.05;
  droneGain.connect(master);
  const drones = [55, 82.4].map((frequency) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = frequency;
    osc.connect(droneGain);
    return osc;
  });

  const sources = [noise, swell, ...drones];
  sources.forEach((s) => s.start());
  void ctx.resume();

  return {
    setMuted(next) {
      master.gain.setTargetAtTime(next ? 0 : LEVEL, ctx.currentTime, 0.05);
    },
    stop() {
      sources.forEach((s) => s.stop());
      void ctx.close();
    },
  };
}
