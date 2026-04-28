"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { RefreshCcw, RotateCcw, ShieldAlert } from "lucide-react";
import ClassChip from "./ClassChip";
import ConfidenceNumber from "./ConfidenceNumber";
import ProbBars from "./ProbBars";
import { stageVariants } from "./stageVariants";
import {
  TUMOR_CLASS_COLORS,
  TUMOR_CLASS_LABELS,
  type Prediction,
} from "@/lib/types";

interface Props {
  previewUrl: string;
  prediction: Prediction | null;
  error: string | null;
  onReset: () => void;
  onRetry: () => void;
}

const easeOutExpo = [0.22, 1, 0.36, 1] as const;

export default function ResultStage({
  previewUrl,
  prediction,
  error,
  onReset,
  onRetry,
}: Props) {
  if (error) {
    return <ErrorView message={error} onReset={onReset} onRetry={onRetry} />;
  }
  if (!prediction) return null;

  const accent = TUMOR_CLASS_COLORS[prediction.tumorClass];

  return (
    <motion.main
      variants={stageVariants}
      initial="enter"
      animate="visible"
      exit="exit"
      className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12 sm:py-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem]"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, color-mix(in oklab, ${accent} 22%, transparent), transparent 60%)`,
        }}
      />

      <div className="flex flex-col items-center gap-5 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: easeOutExpo }}
        >
          <p className="text-xs uppercase tracking-[0.32em] text-teal">
            Step 3 · Diagnosis
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.15, ease: easeOutExpo }}
        >
          <ClassChip tumorClass={prediction.tumorClass} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22, ease: easeOutExpo }}
          className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          {TUMOR_CLASS_LABELS[prediction.tumorClass]}{" "}
          {prediction.tumorClass === "notumor" ? "detected" : "predicted"}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: easeOutExpo }}
          className="mt-2 flex flex-col items-center gap-1"
        >
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-fg-muted">
            Confidence
          </p>
          <ConfidenceNumber confidence={prediction.confidence} />
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: easeOutExpo }}
          className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.8)]"
        >
          <div className="relative aspect-square overflow-hidden rounded-[calc(var(--radius-card)-6px)] bg-bg-soft/40">
            <Image
              unoptimized
              src={previewUrl}
              alt="MRI scan"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-3"
            />
            {prediction.heatmapDataUrl && (
              <Image
                unoptimized
                src={prediction.heatmapDataUrl}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="pointer-events-none object-contain p-3 mix-blend-screen opacity-65"
              />
            )}
          </div>
          <p className="mt-3 px-1 text-xs text-fg-muted">
            Grad-CAM attention map overlay generated from the current model
            prediction.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: easeOutExpo }}
          className="rounded-[var(--radius-card)] border border-border bg-surface p-6"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.3em] text-fg-muted">
            Class probabilities
          </p>
          <ProbBars
            probabilities={prediction.probabilities}
            winner={prediction.tumorClass}
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7, ease: easeOutExpo }}
        className="flex justify-center"
      >
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:border-teal/40 hover:text-fg"
        >
          <RefreshCcw size={14} />
          Try another scan
        </button>
      </motion.div>
    </motion.main>
  );
}

interface ErrorProps {
  message: string;
  onReset: () => void;
  onRetry: () => void;
}

function ErrorView({ message, onReset, onRetry }: ErrorProps) {
  return (
    <motion.main
      variants={stageVariants}
      initial="enter"
      animate="visible"
      exit="exit"
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-glioma/40 bg-glioma/10 text-glioma">
        <ShieldAlert size={26} strokeWidth={1.6} />
      </div>
      <p className="mt-6 text-xs uppercase tracking-[0.3em] text-glioma">
        Analysis error
      </p>
      <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        Analysis didn&rsquo;t complete
      </h2>
      <p className="mt-3 max-w-md text-sm text-fg-muted">{message}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-medium text-bg transition-colors hover:bg-teal-soft"
        >
          <RotateCcw size={14} />
          Retry
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:border-teal/40 hover:text-fg"
        >
          <RefreshCcw size={14} />
          Try another scan
        </button>
      </div>
    </motion.main>
  );
}
