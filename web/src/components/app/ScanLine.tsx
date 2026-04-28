"use client";

import { motion } from "framer-motion";

const PARTICLE_COUNT = 6;
const SWEEP_DURATION = 2.4;

export default function ScanLine() {
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 z-20 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-teal-soft) 35%, var(--color-teal) 50%, var(--color-teal-soft) 65%, transparent)",
          boxShadow:
            "0 0 18px var(--color-teal), 0 0 38px color-mix(in oklab, var(--color-teal) 70%, transparent)",
        }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{
          duration: SWEEP_DURATION,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute z-20 h-1 w-1 rounded-full bg-teal-soft"
          style={{
            left: `${10 + i * 14}%`,
            boxShadow: "0 0 10px var(--color-teal)",
          }}
          animate={{
            top: ["0%", "100%", "0%"],
            opacity: [0, 0.85, 0],
          }}
          transition={{
            duration: SWEEP_DURATION,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.05 + i * 0.04,
          }}
        />
      ))}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 z-10 h-12"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--color-teal) 18%, transparent), transparent)",
        }}
        animate={{ top: ["-3rem", "100%", "-3rem"] }}
        transition={{
          duration: SWEEP_DURATION,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </>
  );
}
