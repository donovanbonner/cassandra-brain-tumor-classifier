"use client";

import { motion } from "framer-motion";
import Dropzone from "./Dropzone";
import { stageVariants } from "./stageVariants";
import { TUMOR_CLASSES, TUMOR_CLASS_COLORS, TUMOR_CLASS_LABELS } from "@/lib/types";

interface Props {
  onFile: (file: File) => void;
}

const easeOutExpo = [0.22, 1, 0.36, 1] as const;

export default function UploadStage({ onFile }: Props) {
  return (
    <motion.main
      variants={stageVariants}
      initial="enter"
      animate="visible"
      exit="exit"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-14 text-center sm:py-20"
    >
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: easeOutExpo }}
        className="mb-3 text-xs uppercase tracking-[0.32em] text-teal"
      >
        Step 1 · Upload
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.25, ease: easeOutExpo }}
        className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        Drop an MRI scan to begin diagnosis
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.35, ease: easeOutExpo }}
        className="mt-3 max-w-md text-sm text-fg-muted sm:text-base"
      >
        PNG or JPG, up to 10MB. Analysis starts automatically as soon as your
        scan lands.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45, ease: easeOutExpo }}
        className="mt-10 w-full"
      >
        <Dropzone onFile={onFile} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="mt-10 flex flex-col items-center gap-3"
      >
        <p className="text-[0.7rem] uppercase tracking-[0.3em] text-fg-muted/60">
          Cassandra can analyze these four classes
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {TUMOR_CLASSES.map((cls) => (
            <span
              key={cls}
              className="cursor-not-allowed rounded-full border border-border/50 bg-surface/60 px-3 py-1 text-xs text-fg-muted/70"
              style={{
                borderColor: `color-mix(in oklab, ${TUMOR_CLASS_COLORS[cls]} 18%, var(--color-border))`,
              }}
            >
              {TUMOR_CLASS_LABELS[cls]}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.main>
  );
}
