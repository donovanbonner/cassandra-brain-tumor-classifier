"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import ScanLine from "./ScanLine";
import { stageVariants } from "./stageVariants";

interface Props {
  previewUrl: string;
}

const STATUS_MESSAGES = [
  "Loading model…",
  "Analyzing scan…",
  "Computing heatmap…",
  "Finalizing diagnosis…",
];

const PROGRESS_DURATION_MS = 2500;
const STATUS_INTERVAL_MS = 700;

export default function ProcessingStage({ previewUrl }: Props) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, STATUS_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) / PROGRESS_DURATION_MS;
      const value = Math.min(100, Math.round(elapsed * 100));
      setProgress(value);
      if (value < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <motion.main
      variants={stageVariants}
      initial="enter"
      animate="visible"
      exit="exit"
      className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-14 text-center sm:py-20"
    >
      <motion.div
        aria-hidden
        animate={{ opacity: [0.45, 0.85, 0.45], scale: [1, 1.06, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -z-10 h-[28rem] w-[28rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--color-teal) 26%, transparent), color-mix(in oklab, var(--color-pink) 16%, transparent) 45%, transparent 70%)",
          filter: "blur(48px)",
        }}
      />

      <p className="mb-3 text-xs uppercase tracking-[0.32em] text-teal">
        Step 2 · Analyze
      </p>
      <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        Reading the scan
      </h2>

      <motion.div
        animate={{ scale: [1, 1.015, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative mt-12 h-72 w-72 overflow-hidden rounded-[var(--radius-card)] border border-teal/40 bg-bg-soft/40 shadow-[0_28px_80px_-24px_color-mix(in_oklab,var(--color-teal)_55%,transparent)] sm:h-80 sm:w-80"
      >
        <Image
          unoptimized
          src={previewUrl}
          alt="Scan being analyzed"
          fill
          sizes="320px"
          className="object-contain p-4"
          priority
        />
        <ScanLine />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)]"
          style={{
            background:
              "radial-gradient(circle, transparent 55%, color-mix(in oklab, var(--color-pink) 18%, transparent) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)] ring-1 ring-inset ring-teal/30"
        />
      </motion.div>

      <div className="mt-10 h-7">
        <AnimatePresence mode="wait">
          <motion.p
            key={statusIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm text-fg-muted sm:text-base"
          >
            {STATUS_MESSAGES[statusIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="mt-3 font-mono text-xs text-fg-muted/60">
        {progress.toString().padStart(3, "0")}%
      </p>
    </motion.main>
  );
}
