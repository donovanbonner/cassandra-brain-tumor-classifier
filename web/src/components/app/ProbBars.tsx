"use client";

import { motion } from "framer-motion";

import {
  TUMOR_CLASSES,
  TUMOR_CLASS_COLORS,
  TUMOR_CLASS_LABELS,
  type TumorClass,
} from "@/lib/types";

interface Props {
  probabilities: Record<TumorClass, number>;
  winner: TumorClass;
}

export default function ProbBars({ probabilities, winner }: Props) {
  return (
    <div className="space-y-4">
      {TUMOR_CLASSES.map((tumorClass, index) => {
        const value = Math.max(0, Math.min(1, probabilities[tumorClass] ?? 0));
        const color = TUMOR_CLASS_COLORS[tumorClass];
        const label = TUMOR_CLASS_LABELS[tumorClass];

        return (
          <div key={tumorClass} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span
                className={winner === tumorClass ? "font-medium text-fg" : "text-fg-muted"}
              >
                {label}
              </span>
              <span className="font-mono text-xs text-fg-muted">
                {(value * 100).toFixed(1)}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-fg/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value * 100}%` }}
                transition={{
                  duration: 0.85,
                  delay: index * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`h-full rounded-full ${winner === tumorClass ? "shadow-[0_0_24px_-8px_var(--color-teal)]" : ""}`}
                style={{ background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
