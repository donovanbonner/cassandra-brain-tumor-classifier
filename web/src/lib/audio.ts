let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.45;
  masterGain.connect(ctx.destination);
  return ctx;
}

export function initAudio(): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
}

const PENTATONIC = [
  523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66,
];

export function playFormation(): void {
  const c = getCtx();
  if (!c || !masterGain) return;
  if (c.state === "suspended") void c.resume();

  const now = c.currentTime;

  const padFilter = c.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 1100;
  padFilter.Q.value = 0.7;
  padFilter.connect(masterGain);

  const padGain = c.createGain();
  padGain.gain.setValueAtTime(0, now);
  padGain.gain.linearRampToValueAtTime(0.18, now + 0.45);
  padGain.gain.linearRampToValueAtTime(0.12, now + 1.4);
  padGain.gain.linearRampToValueAtTime(0, now + 2.0);
  padGain.connect(padFilter);

  for (const f of [220, 220 * 1.005, 330]) {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f;
    osc.connect(padGain);
    osc.start(now);
    osc.stop(now + 2.05);
  }

  const numShimmers = 18;
  for (let i = 0; i < numShimmers; i++) {
    const t = now + (i / numShimmers) * 1.5 + Math.random() * 0.05;
    const baseFreq =
      PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
    const freq = baseFreq * (Math.random() < 0.3 ? 2 : 1);

    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.06, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

    osc.connect(g);
    g.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  const chordTime = now + 1.6;
  const chordFreqs = [440.0, 554.37, 659.25, 830.61];
  for (const f of chordFreqs) {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f;

    const g = c.createGain();
    g.gain.setValueAtTime(0, chordTime);
    g.gain.linearRampToValueAtTime(0.05, chordTime + 0.08);
    g.gain.linearRampToValueAtTime(0.04, chordTime + 0.8);
    g.gain.linearRampToValueAtTime(0, chordTime + 1.5);

    osc.connect(g);
    g.connect(masterGain);
    osc.start(chordTime);
    osc.stop(chordTime + 1.55);
  }
}
