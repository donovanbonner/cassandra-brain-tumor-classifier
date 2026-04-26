"use client";

import { motion } from "framer-motion";
import { Upload, ScanSearch, MessageSquareText } from "lucide-react";

const easeOutExpo = [0.22, 1, 0.36, 1] as const;

const steps = [
  {
    icon: Upload,
    title: "Upload",
    body: "Drop in an MRI scan. We resize, normalize, and prepare it for the model — nothing leaves the inference Space.",
    accent: "var(--color-teal)",
  },
  {
    icon: ScanSearch,
    title: "Analyze",
    body: "Our fine-tuned EfficientNet-B0 (Cassandra v1) classifies the scan into glioma, meningioma, pituitary, or no tumor — with a Grad-CAM heatmap of where it looked.",
    accent: "var(--color-pink)",
  },
  {
    icon: MessageSquareText,
    title: "Explain",
    body: "Ask follow-ups. A LangChain-powered Mistral assistant answers using a curated tumor knowledge base, with cited sources.",
    accent: "var(--color-teal)",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-border/60 bg-bg-soft/40 px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: easeOutExpo }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-teal">
            How it works
          </p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            From scan to explanation in seconds
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.12,
                ease: easeOutExpo,
              }}
              className="group relative overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface p-6 transition-colors hover:border-teal/40"
            >
              <div
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-3xl transition-opacity group-hover:opacity-60"
                style={{ background: step.accent }}
                aria-hidden
              />
              <div className="relative">
                <div
                  className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-border"
                  style={{
                    background:
                      "color-mix(in oklab, " + step.accent + " 12%, transparent)",
                    color: step.accent,
                  }}
                >
                  <step.icon size={22} strokeWidth={1.6} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  <span className="mr-2 font-mono text-xs text-fg-muted">
                    0{i + 1}
                  </span>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-fg-muted">
                  {step.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
