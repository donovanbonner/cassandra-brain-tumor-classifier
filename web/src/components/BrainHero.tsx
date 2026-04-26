"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import BrainParticles from "./BrainParticles";
import EnterSplash from "./EnterSplash";
import { initAudio, playFormation } from "@/lib/audio";

const TITLE = "NeuroScan AI";

const easeOutExpo = [0.22, 1, 0.36, 1] as const;

const titleContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.045, delayChildren: 1.2 },
  },
};

const titleLetter = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: easeOutExpo },
  },
};

export default function BrainHero() {
  const [entered, setEntered] = useState(false);
  const [triggerKey, setTriggerKey] = useState(0);

  const handleEnter = () => {
    initAudio();
    playFormation();
    setEntered(true);
    setTriggerKey((k) => k + 1);
  };

  const handleBrainClick = () => {
    if (!entered) return;
    playFormation();
    setTriggerKey((k) => k + 1);
  };

  return (
    <>
      <AnimatePresence>
        {!entered && <EnterSplash onEnter={handleEnter} />}
      </AnimatePresence>

      <section className="relative overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 pt-20 pb-32 text-center sm:pt-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: entered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <BrainParticles
              triggerKey={triggerKey}
              onClick={handleBrainClick}
            />
          </motion.div>

          <motion.h1
            variants={titleContainer}
            initial="hidden"
            animate={entered ? "visible" : "hidden"}
            className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl"
            aria-label={TITLE}
          >
            {TITLE.split("").map((char, i) => (
              <motion.span
                key={i}
                variants={titleLetter}
                className="inline-block"
                aria-hidden
              >
                {char === " " ? " " : char}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.7, delay: 1.95, ease: easeOutExpo }}
            className="mt-6 max-w-2xl text-balance text-lg text-fg-muted sm:text-xl"
          >
            AI-assisted brain tumor diagnosis from MRI scans — with Grad-CAM
            explanations and a knowledge-grounded assistant.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={entered ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.7, delay: 2.15, ease: easeOutExpo }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Link
              href="/app"
              className="group inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-medium text-bg shadow-[0_8px_30px_-8px_var(--color-teal)] transition-all hover:bg-teal-soft hover:shadow-[0_12px_40px_-8px_var(--color-teal)]"
            >
              Try it now
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <a
              href="#how-it-works"
              className="text-sm text-fg-muted transition-colors hover:text-fg"
            >
              How it works ↓
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={entered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 1, delay: 2.5 }}
            className="mt-12 text-xs uppercase tracking-[0.2em] text-fg-muted/60"
          >
            CS3270 · Spring 2026 · Bonner & El&nbsp;Akaya
          </motion.p>
        </div>
      </section>
    </>
  );
}
