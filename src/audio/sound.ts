/**
 * All game sound, generated in the browser with the Web Audio API. No audio
 * file is loaded.
 *
 * - A base ambience: soft wind (filtered noise that swells slowly) over a low drone.
 * - One ambience layer per place, faded in and out with `setPlace`.
 * - Short effects, played with `play`.
 *
 * Everything runs through one master gain, so mute covers all of it.
 */
import type { Cue, PlaceId } from "./cues";

export type Sound = {
  setMuted(muted: boolean): void;
  setPlace(place: PlaceId | null): void;
  play(cue: Cue): void;
  stop(): void;
};

const LEVEL = 0.5;
/** Effects sit under the ambience: quiet, and never sudden. */
const FX_LEVEL = 0.5;

type Layer = { out: GainNode; stop(): void };

export function startSound(muted: boolean): Sound | null {
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

  const fx = ctx.createGain();
  fx.gain.value = FX_LEVEL;
  fx.connect(master);

  // ---------- Building blocks ----------

  function noiseBuffer(seconds: number, brown: boolean): AudioBuffer {
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      if (brown) {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      } else {
        data[i] = white;
      }
    }
    return buffer;
  }
  const brown = noiseBuffer(4, true);
  const white = noiseBuffer(2, false);

  /** A gain that rises to `peak` and dies away, connected to `dest`. */
  function envelope(dest: AudioNode, at: number, peak: number, attack: number, decay: number) {
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), at + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
    gain.connect(dest);
    return gain;
  }

  function tone(
    dest: AudioNode,
    at: number,
    opts: {
      type?: OscillatorType;
      from: number;
      to?: number;
      peak: number;
      attack?: number;
      decay: number;
    },
  ) {
    const { type = "sine", from, to = from, peak, attack = 0.01, decay } = opts;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, at);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, at + attack + decay);
    osc.connect(envelope(dest, at, peak, attack, decay));
    osc.start(at);
    osc.stop(at + attack + decay + 0.05);
  }

  function burst(
    dest: AudioNode,
    at: number,
    opts: {
      buffer?: AudioBuffer;
      filter: BiquadFilterType;
      freq: number;
      q?: number;
      peak: number;
      attack?: number;
      decay: number;
    },
  ) {
    const { buffer = white, filter, freq, q = 1, peak, attack = 0.005, decay } = opts;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const biquad = ctx.createBiquadFilter();
    biquad.type = filter;
    biquad.frequency.value = freq;
    biquad.Q.value = q;
    src.connect(biquad).connect(envelope(dest, at, peak, attack, decay));
    src.start(at, Math.random() * (buffer.duration - 0.5));
    src.stop(at + attack + decay + 0.05);
  }

  /** A looping noise bed through a filter. Returns the nodes to stop. */
  function bed(
    dest: AudioNode,
    opts: { buffer: AudioBuffer; filter: BiquadFilterType; freq: number; q?: number; gain: number },
  ) {
    const src = ctx.createBufferSource();
    src.buffer = opts.buffer;
    src.loop = true;
    const biquad = ctx.createBiquadFilter();
    biquad.type = opts.filter;
    biquad.frequency.value = opts.freq;
    biquad.Q.value = opts.q ?? 1;
    const gain = ctx.createGain();
    gain.gain.value = opts.gain;
    src.connect(biquad).connect(gain).connect(dest);
    src.start();
    return { src, biquad, gain };
  }

  /** A slow wobble on an audio parameter. */
  function wobble(target: AudioParam, rate: number, depth: number) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = rate;
    const amount = ctx.createGain();
    amount.gain.value = depth;
    lfo.connect(amount).connect(target);
    lfo.start();
    return lfo;
  }

  /** A struck bell: a few partials that die away. */
  function bell(dest: AudioNode, at: number, pitch: number, peak: number, decay: number) {
    for (const [ratio, level] of [
      [1, 1],
      [2, 0.5],
      [2.76, 0.3],
      [5.4, 0.12],
    ] as const) {
      tone(dest, at, { from: pitch * ratio, peak: peak * level, attack: 0.004, decay: decay / ratio ** 0.5 });
    }
  }

  // ---------- Effects ----------

  /** One caw: a rough, falling rasp. Kept soft so it is a voice in the scene, not a jump scare. */
  function caw(dest: AudioNode, at: number, pitch: number) {
    const dur = 0.3;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(pitch, at);
    osc.frequency.linearRampToValueAtTime(pitch * 1.12, at + 0.05);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.72, at + dur);
    // The rasp: fast tremolo on the voice.
    const rasp = ctx.createGain();
    rasp.gain.value = 0.55;
    const tremolo = ctx.createOscillator();
    tremolo.type = "square";
    tremolo.frequency.value = 62;
    const depth = ctx.createGain();
    depth.gain.value = 0.45;
    tremolo.connect(depth).connect(rasp.gain);
    const throat = ctx.createBiquadFilter();
    throat.type = "bandpass";
    throat.frequency.value = 1350;
    throat.Q.value = 1.6;
    osc.connect(rasp).connect(throat).connect(envelope(dest, at, 0.5, 0.03, dur));
    osc.start(at);
    tremolo.start(at);
    osc.stop(at + dur + 0.1);
    tremolo.stop(at + dur + 0.1);
    burst(dest, at, { filter: "bandpass", freq: 2100, q: 2, peak: 0.12, attack: 0.03, decay: dur });
  }

  const effects: Record<Cue, (at: number) => void> = {
    footsteps(at) {
      for (let i = 0; i < 6; i++) {
        burst(fx, at + i * 0.32, {
          buffer: brown,
          filter: "lowpass",
          freq: i % 2 ? 260 : 340,
          peak: 0.7,
          decay: 0.09,
        });
      }
    },
    select(at) {
      tone(fx, at, { type: "square", from: 520, to: 780, peak: 0.07, decay: 0.07 });
    },
    lanternLit(at) {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        tone(fx, at + i * 0.09, { type: "triangle", from: f, peak: 0.2, decay: 0.35 }),
      );
    },
    lanternDim(at) {
      [392, 440].forEach((f, i) =>
        tone(fx, at + i * 0.14, { type: "triangle", from: f, peak: 0.16, decay: 0.4 }),
      );
    },
    lanternDark(at) {
      [311.13, 233.08, 174.61].forEach((f, i) =>
        tone(fx, at + i * 0.16, { type: "triangle", from: f, peak: 0.2, decay: 0.45 }),
      );
      burst(fx, at + 0.4, { filter: "highpass", freq: 3000, peak: 0.05, attack: 0.1, decay: 0.5 });
    },
    raven(at) {
      caw(fx, at + 0.9, 610);
      caw(fx, at + 1.35, 570);
    },
    drip(at) {
      [0.2, 1.1].forEach((t, i) => {
        tone(fx, at + t, { from: i ? 1250 : 1500, to: 620, peak: 0.22, attack: 0.004, decay: 0.09 });
        tone(fx, at + t + 0.16, { from: 900, to: 500, peak: 0.07, attack: 0.004, decay: 0.12 });
      });
    },
    hammer(at) {
      [0.3, 0.6, 1.2].forEach((t) => {
        burst(fx, at + t, { filter: "bandpass", freq: 2600, q: 6, peak: 0.3, decay: 0.05 });
        tone(fx, at + t, { from: 1900, peak: 0.08, attack: 0.002, decay: 0.12 });
      });
    },
    bell(at) {
      bell(fx, at + 0.4, 330, 0.16, 2.2);
    },
    clockBreaks(at) {
      // It strikes too many times, too fast, then coughs out a spring.
      for (let i = 0; i < 5; i++) bell(fx, at + 0.7 + i * 0.26, 392 * (1 - i * 0.02), 0.14, 0.7);
      const t = at + 2.15;
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(620, t + 0.5);
      const wob = wobble(osc.frequency, 17, 90);
      osc.connect(envelope(fx, t, 0.2, 0.01, 0.6));
      osc.start(t);
      osc.stop(t + 0.7);
      wob.stop(t + 0.7);
    },
    coins(at) {
      [2637, 3136, 2793, 3520].forEach((f, i) =>
        tone(fx, at + 0.6 + i * 0.11, { from: f, peak: 0.09, attack: 0.002, decay: 0.18 }),
      );
    },
    splash(at) {
      const t = at + 1.2;
      tone(fx, t, { from: 160, to: 60, peak: 0.25, decay: 0.25 });
      burst(fx, t + 0.03, { filter: "bandpass", freq: 1400, q: 0.7, peak: 0.25, attack: 0.04, decay: 0.7 });
    },
    endingThrives(at) {
      [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        tone(fx, at + 0.3 + i * 0.16, { type: "triangle", from: f, peak: 0.2, decay: i === 4 ? 1.4 : 0.5 }),
      );
    },
    endingMuddles(at) {
      [392, 466.16, 523.25, 440].forEach((f, i) =>
        tone(fx, at + 0.3 + i * 0.22, { type: "triangle", from: f, peak: 0.18, decay: i === 3 ? 1.2 : 0.5 }),
      );
    },
    endingFog(at) {
      [311.13, 261.63, 207.65, 155.56].forEach((f, i) =>
        tone(fx, at + 0.3 + i * 0.32, { type: "triangle", from: f, peak: 0.2, decay: i === 3 ? 1.8 : 0.7 }),
      );
    },
  };

  // ---------- Place layers ----------

  /** Calls `fire` again and again, a random time apart, until stopped. */
  function every(minSeconds: number, maxSeconds: number, fire: (at: number) => void) {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(
        () => {
          fire(ctx.currentTime + 0.05);
          schedule();
        },
        (minSeconds + Math.random() * (maxSeconds - minSeconds)) * 1000,
      );
    };
    schedule();
    return () => clearTimeout(timer);
  }

  const layers: Record<PlaceId, (out: GainNode) => () => void> = {
    // A crowd: a band of murmur whose loudness and pitch never settle.
    "lantern-pleas"(out) {
      const murmur = bed(out, { buffer: brown, filter: "bandpass", freq: 520, q: 0.9, gain: 0.9 });
      const lfos = [
        wobble(murmur.gain.gain, 2.3, 0.35),
        wobble(murmur.gain.gain, 0.61, 0.3),
        wobble(murmur.biquad.frequency, 0.37, 180),
      ];
      const shouts = every(0.7, 1.8, (at) =>
        tone(out, at, {
          type: "sawtooth",
          from: 180 + Math.random() * 160,
          to: 150 + Math.random() * 120,
          peak: 0.035,
          attack: 0.06,
          decay: 0.25,
        }),
      );
      return () => {
        shouts();
        [murmur.src, ...lfos].forEach((n) => n.stop());
      };
    },
    // The well: slow drips, and a breath of whisper that comes and goes.
    "whispering-well"(out) {
      const hiss = bed(out, { buffer: white, filter: "bandpass", freq: 3400, q: 2.5, gain: 0.03 });
      const lfos = [wobble(hiss.gain.gain, 0.23, 0.028), wobble(hiss.biquad.frequency, 0.4, 900)];
      const drips = every(1.6, 3.6, (at) =>
        tone(out, at, { from: 1100 + Math.random() * 500, to: 600, peak: 0.12, attack: 0.004, decay: 0.09 }),
      );
      return () => {
        drips();
        [hiss.src, ...lfos].forEach((n) => n.stop());
      };
    },
    // The workshop: a clock that goes tick, tock.
    "clockmakers-night"(out) {
      let tock = false;
      const tick = (at: number) => {
        burst(out, at, { filter: "bandpass", freq: tock ? 1500 : 2300, q: 8, peak: 0.28, decay: 0.03 });
        tock = !tock;
      };
      return every(0.5, 0.5, tick);
    },
    // The window: the river below.
    "barons-raven"(out) {
      const river = bed(out, { buffer: white, filter: "bandpass", freq: 900, q: 0.6, gain: 0.05 });
      const lfos = [wobble(river.gain.gain, 0.9, 0.012), wobble(river.biquad.frequency, 0.3, 250)];
      return () => [river.src, ...lfos].forEach((n) => n.stop());
    },
    // The market: voices muffled by fog, and a bell somewhere far off.
    "counting-fog"(out) {
      const murmur = bed(out, { buffer: brown, filter: "lowpass", freq: 380, gain: 0.7 });
      const lfos = [wobble(murmur.gain.gain, 1.4, 0.25), wobble(murmur.gain.gain, 0.43, 0.2)];
      const bells = every(5, 9, (at) => bell(out, at, 330, 0.035, 2.2));
      return () => {
        bells();
        [murmur.src, ...lfos].forEach((n) => n.stop());
      };
    },
  };

  // ---------- Base ambience ----------

  const wind = bed(master, { buffer: brown, filter: "lowpass", freq: 420, gain: 0.35 });
  const swell = wobble(wind.biquad.frequency, 0.07, 220);

  // Drone: two low sines a fifth apart, very quiet.
  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.05;
  droneGain.connect(master);
  const drones = [55, 82.4].map((frequency) => {
    const osc = ctx.createOscillator();
    osc.frequency.value = frequency;
    osc.connect(droneGain);
    osc.start();
    return osc;
  });

  void ctx.resume();

  let place: PlaceId | null = null;
  let layer: Layer | null = null;
  let stopped = false;

  /** Layers on their way out. They are still sounding, so `stop` must reach them too. */
  const fading = new Set<Layer>();

  function fadeOut(old: Layer) {
    fading.add(old);
    old.out.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    setTimeout(() => {
      if (!fading.delete(old)) return;
      old.stop();
      old.out.disconnect();
    }, 2500);
  }

  return {
    setMuted(next) {
      master.gain.setTargetAtTime(next ? 0 : LEVEL, ctx.currentTime, 0.05);
    },
    setPlace(next) {
      if (stopped || next === place) return;
      place = next;
      if (layer) fadeOut(layer);
      layer = null;
      if (!next) return;
      const out = ctx.createGain();
      out.gain.value = 0;
      out.gain.setTargetAtTime(1, ctx.currentTime, 0.6);
      out.connect(master);
      layer = { out, stop: layers[next](out) };
    },
    play(cue) {
      if (stopped) return;
      effects[cue](ctx.currentTime + 0.03);
    },
    stop() {
      if (stopped) return;
      stopped = true;
      layer?.stop();
      fading.forEach((old) => old.stop());
      fading.clear();
      [wind.src, swell, ...drones].forEach((s) => s.stop());
      void ctx.close();
    },
  };
}
