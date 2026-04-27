"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import AppHeader from "./AppHeader";
import ProcessingStage from "./ProcessingStage";
import ResultStage from "./ResultStage";
import UploadStage from "./UploadStage";
import { mockPredict } from "@/lib/mockPredict";
import type { Prediction, Stage } from "@/lib/types";

const MIN_PROCESSING_MS = 2500;

export default function DiagnosticApp() {
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const runIdRef = useRef(0);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const runPrediction = async (incomingFile: File) => {
    const runId = ++runIdRef.current;
    setError(null);
    setPrediction(null);
    setStage("processing");

    const startedAt = performance.now();
    let nextPrediction: Prediction | null = null;
    let nextError: string | null = null;

    try {
      nextPrediction = await mockPredict(incomingFile);
    } catch (e) {
      nextError = e instanceof Error ? e.message : "Analysis failed.";
    }

    const elapsed = performance.now() - startedAt;
    const remaining = Math.max(0, MIN_PROCESSING_MS - elapsed);
    if (remaining > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, remaining));
    }
    if (runIdRef.current !== runId) return;

    setPrediction(nextPrediction);
    setError(nextError);
    setStage("result");
  };

  const handleFile = (incomingFile: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(incomingFile);
    setFile(incomingFile);
    setPreviewUrl(url);
    void runPrediction(incomingFile);
  };

  const handleReset = () => {
    runIdRef.current += 1;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError(null);
    setStage("upload");
  };

  const handleRetry = () => {
    if (file) void runPrediction(file);
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <Vignette />
      <BackdropAccents />
      <AppHeader processing={stage === "processing"} />

      <div className="relative flex flex-1 flex-col">
        <AnimatePresence mode="wait">
          {stage === "upload" && (
            <UploadStage key="upload" onFile={handleFile} />
          )}
          {stage === "processing" && previewUrl && (
            <ProcessingStage key="processing" previewUrl={previewUrl} />
          )}
          {stage === "result" && previewUrl && (
            <ResultStage
              key="result"
              previewUrl={previewUrl}
              prediction={prediction}
              error={error}
              onReset={handleReset}
              onRetry={handleRetry}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Vignette() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.38) 100%)",
      }}
    />
  );
}

function BackdropAccents() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--color-teal)_14%,transparent)_0%,transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-8rem] top-40 -z-10 h-72 w-72 rounded-full bg-pink/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-6rem] top-[22rem] -z-10 h-64 w-64 rounded-full bg-teal/10 blur-3xl"
      />
    </>
  );
}
