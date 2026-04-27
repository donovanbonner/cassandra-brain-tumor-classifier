"use client";

import { useEffect, useState } from "react";

const DURATION_MS = 800;

interface Props {
  confidence: number;
}

export default function ConfidenceNumber({ confidence }: Props) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const target = Math.max(0, Math.min(100, confidence * 100));
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION_MS);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(target * eased);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [confidence]);

  return (
    <div className="font-mono text-5xl font-semibold leading-none tracking-tight text-fg sm:text-6xl">
      {displayValue.toFixed(1)}%
    </div>
  );
}
