"use client";

import { useEffect, useRef } from "react";

const SIZE = 320;
const SAMPLE_GAP = 5;
const TEAL = "#2DD4BF";
const PINK = "#EC4899";

interface Particle {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  phase: number;
}

interface Props {
  triggerKey?: number;
  onClick?: () => void;
}

export default function BrainParticles({ triggerKey = 0, onClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetsRef = useRef<Array<{ x: number; y: number }> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== SIZE * dpr) {
      canvas.width = SIZE * dpr;
      canvas.height = SIZE * dpr;
      canvas.style.width = `${SIZE}px`;
      canvas.style.height = `${SIZE}px`;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!targetsRef.current) {
      targetsRef.current = sampleBrainPixels(SIZE);
    }
    const targets = targetsRef.current;
    const center = SIZE / 2;

    const particles: Particle[] = targets.map((t) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = SIZE * (0.7 + Math.random() * 0.5);
      const useTeal = Math.random() < 0.62;
      return {
        startX: center + Math.cos(angle) * dist,
        startY: center + Math.sin(angle) * dist,
        targetX: t.x,
        targetY: t.y,
        color: useTeal ? TEAL : PINK,
        size: 1.1 + Math.random() * 1.5,
        delay: reduced ? 0 : Math.random() * 0.7,
        duration: reduced ? 0.001 : 1.0 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
      };
    });

    let rafId = 0;
    let startTime: number | null = null;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = (now - startTime) / 1000;

      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.globalCompositeOperation = "lighter";

      for (const p of particles) {
        const local = elapsed - p.delay;
        let x: number, y: number, alpha: number;

        if (local <= 0) {
          x = p.startX;
          y = p.startY;
          alpha = 0;
        } else if (local < p.duration) {
          const t = easeOutCubic(local / p.duration);
          x = p.startX + (p.targetX - p.startX) * t;
          y = p.startY + (p.targetY - p.startY) * t;
          alpha = t;
        } else {
          const breathe = elapsed * 1.4 + p.phase;
          x = p.targetX + Math.sin(breathe) * 0.55;
          y = p.targetY + Math.cos(breathe * 0.8) * 0.55;
          alpha = 0.82 + Math.sin(breathe) * 0.18;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [triggerKey]);

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: SIZE, height: SIZE }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 55%, color-mix(in oklab, var(--color-pink) 30%, transparent) 0%, color-mix(in oklab, var(--color-teal) 22%, transparent) 35%, transparent 70%)",
          filter: "blur(28px)",
        }}
      />
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          aria-label="Replay brain formation"
          className="relative cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
        >
          <canvas ref={canvasRef} aria-hidden className="block" />
        </button>
      ) : (
        <canvas ref={canvasRef} aria-hidden className="relative block" />
      )}
    </div>
  );
}

function sampleBrainPixels(size: number): Array<{ x: number; y: number }> {
  const off = document.createElement("canvas");
  off.width = size;
  off.height = size;
  const ctx = off.getContext("2d");
  if (!ctx) return [];

  ctx.font = `${Math.floor(size * 0.85)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🧠", size / 2, size / 2 + size * 0.04);

  const { data } = ctx.getImageData(0, 0, size, size);
  const points: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < size; y += SAMPLE_GAP) {
    for (let x = 0; x < size; x += SAMPLE_GAP) {
      const alpha = data[(y * size + x) * 4 + 3];
      if (alpha > 140) points.push({ x, y });
    }
  }
  return points;
}
