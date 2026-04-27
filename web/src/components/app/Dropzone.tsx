"use client";

import { motion } from "framer-motion";
import { ScanSearch, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface Props {
  onFile: (file: File) => void;
}

export default function Dropzone({ onFile }: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    maxFiles: 1,
    onDrop(acceptedFiles) {
      const file = acceptedFiles[0];
      if (file) onFile(file);
    },
  });

  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} />

      <motion.div
        animate={{ scale: isDragActive ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className={`relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-[var(--radius-card)] border p-8 text-center transition-colors sm:min-h-[460px] ${
          isDragActive
            ? "border-teal/70 bg-surface shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-teal)_55%,transparent),0_0_64px_-28px_color-mix(in_oklab,var(--color-teal)_75%,transparent)]"
            : "border-border bg-surface"
        }`}
      >
        <div
          aria-hidden
          className={`absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--color-teal)_12%,transparent),transparent_60%)] transition-opacity ${
            isDragActive ? "opacity-100" : "opacity-55"
          }`}
        />

        <div
          aria-hidden
          className={`relative grid h-16 w-16 place-items-center rounded-2xl border transition-colors ${
            isDragActive
              ? "border-teal/60 bg-teal/10 text-teal"
              : "border-border bg-bg-soft/70 text-fg-muted"
          }`}
        >
          <Upload size={28} strokeWidth={1.8} />
        </div>

        <p className="relative mt-6 text-xs uppercase tracking-[0.32em] text-teal">
          {isDragActive ? "Release to analyze" : "Drop MRI"}
        </p>
        <h2 className="relative mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          {isDragActive ? "Queue the scan" : "Drag and drop a scan"}
        </h2>
        <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-fg-muted">
          Single image only. PNG, JPG, JPEG, and WEBP are accepted. A mock
          prediction starts as soon as the file lands.
        </p>

        <div className="relative mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-bg px-4 py-2 text-xs font-medium text-fg-muted">
          <ScanSearch size={14} />
          or click to browse
        </div>
      </motion.div>
    </div>
  );
}
