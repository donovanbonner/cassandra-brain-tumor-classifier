"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import Link from "next/link";

interface Props {
  processing?: boolean;
}

export default function AppHeader({ processing = false }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="group inline-flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-border bg-surface shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-teal)_18%,transparent)] transition-transform group-hover:-translate-y-0.5">
            <Brain size={22} className="text-pink" strokeWidth={1.6} />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-fg">
              NeuroScan AI
            </span>
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-fg-muted">
              Diagnose
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-fg-muted sm:inline-flex">
          <span className="h-2 w-2 rounded-full bg-teal shadow-[0_0_12px_var(--color-teal)]" />
          Mock prediction
        </div>
      </div>

      <motion.div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[2px] origin-left"
        style={{
          background:
            "linear-gradient(90deg, var(--color-teal), var(--color-teal-soft) 45%, var(--color-pink))",
          boxShadow: "0 0 18px color-mix(in oklab, var(--color-teal) 70%, transparent)",
        }}
        initial={false}
        animate={
          processing
            ? { scaleX: [0, 1], opacity: 1 }
            : { scaleX: 0, opacity: 0 }
        }
        transition={
          processing
            ? {
                scaleX: { duration: 2.5, ease: "linear" },
                opacity: { duration: 0.2 },
              }
            : { duration: 0.3 }
        }
      />
    </header>
  );
}
