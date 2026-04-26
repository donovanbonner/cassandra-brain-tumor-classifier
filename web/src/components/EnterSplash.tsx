"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface Props {
  onEnter: () => void;
}

const easeOutExpo = [0.22, 1, 0.36, 1] as const;

export default function EnterSplash({ onEnter }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onEnter}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: easeOutExpo }}
      className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
      aria-label="Tap to begin NeuroScan AI"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, var(--color-teal) 12%, transparent), transparent 60%)",
        }}
      />

      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative mb-10 grid h-24 w-24 place-items-center rounded-full ring-1 ring-teal/30"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--color-pink) 25%, transparent), transparent 70%)",
        }}
      >
        <Brain
          size={56}
          className="text-pink drop-shadow-[0_0_18px_color-mix(in_oklab,var(--color-pink)_60%,transparent)]"
          strokeWidth={1.4}
        />
      </motion.div>

      <p className="relative mb-3 text-xs uppercase tracking-[0.4em] text-fg-muted">
        NeuroScan AI
      </p>
      <h2 className="relative text-2xl font-medium tracking-tight sm:text-3xl">
        Tap to begin
      </h2>
      <motion.p
        animate={{ opacity: [0.4, 0.85, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative mt-3 text-xs text-fg-muted/80"
      >
        click anywhere
      </motion.p>
    </motion.button>
  );
}
