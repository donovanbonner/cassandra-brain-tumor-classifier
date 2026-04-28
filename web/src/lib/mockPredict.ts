import {
  TUMOR_CLASSES,
  type Prediction,
  type TumorClass,
} from "./types";

const MIN_DELAY_MS = 1400;
const MAX_DELAY_MS = 2400;
const HEATMAP_SIZE = 96;

let nextClassIndex = 0;
let heatmapDataUrlPromise: Promise<string> | null = null;

export async function mockPredict(file: File): Promise<Prediction> {
  const inferenceBaseUrl = process.env.NEXT_PUBLIC_INFERENCE_URL?.trim();
  if (inferenceBaseUrl) {
    return predictFromApi(file, inferenceBaseUrl);
  }
  return predictMock(file);
}

async function predictFromApi(
  file: File,
  inferenceBaseUrl: string,
): Promise<Prediction> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${inferenceBaseUrl}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let detail = "Analysis failed.";
    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload.detail) detail = payload.detail;
    } catch {
      // Best effort only.
    }
    throw new Error(detail);
  }

  const payload = (await response.json()) as Prediction;
  return {
    tumorClass: payload.tumorClass,
    confidence: payload.confidence,
    probabilities: payload.probabilities,
    heatmapDataUrl: payload.heatmapDataUrl,
  };
}

async function predictMock(file: File): Promise<Prediction> {
  const tumorClass = TUMOR_CLASSES[nextClassIndex % TUMOR_CLASSES.length];
  nextClassIndex += 1;

  const heatmapPromise = getHeatmapDataUrl();
  const delayMs = Math.round(
    MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS),
  );
  await wait(delayMs);

  if (file.name.toLowerCase().includes("fail")) {
    throw new Error(
      `Analysis failed for "${file.name}". Rename the file to continue.`,
    );
  }

  const confidence = 0.82 + Math.random() * 0.13;
  const probabilities = buildProbabilities(tumorClass, confidence);
  const heatmapDataUrl = await heatmapPromise;

  return {
    tumorClass,
    confidence,
    probabilities,
    heatmapDataUrl,
  };
}

async function getHeatmapDataUrl() {
  heatmapDataUrlPromise ??= createHeatmapDataUrl();
  return heatmapDataUrlPromise;
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function createHeatmapDataUrl() {
  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(HEATMAP_SIZE, HEATMAP_SIZE)
      : createFallbackCanvas();
  const context = canvas.getContext("2d");
  if (!context) {
    return "";
  }

  const gradient = context.createRadialGradient(
    HEATMAP_SIZE * 0.34,
    HEATMAP_SIZE * 0.34,
    HEATMAP_SIZE * 0.08,
    HEATMAP_SIZE / 2,
    HEATMAP_SIZE / 2,
    HEATMAP_SIZE * 0.56,
  );

  gradient.addColorStop(0, "rgba(255, 60, 60, 0.98)");
  gradient.addColorStop(0.55, "rgba(255, 144, 48, 0.96)");
  gradient.addColorStop(1, "rgba(255, 232, 112, 0.96)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, HEATMAP_SIZE, HEATMAP_SIZE);

  context.globalCompositeOperation = "screen";
  context.fillStyle = "rgba(255, 255, 255, 0.14)";
  context.beginPath();
  context.arc(
    HEATMAP_SIZE * 0.28,
    HEATMAP_SIZE * 0.3,
    HEATMAP_SIZE * 0.18,
    0,
    Math.PI * 2,
  );
  context.fill();

  if (canvas instanceof HTMLCanvasElement) {
    return canvas.toDataURL("image/png");
  }

  const blob = await canvas.convertToBlob({ type: "image/png" });
  return blobToDataUrl(blob);
}

function createFallbackCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = HEATMAP_SIZE;
  canvas.height = HEATMAP_SIZE;
  return canvas;
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(blob);
  });
}

function buildProbabilities(
  tumorClass: TumorClass,
  confidence: number,
): Record<TumorClass, number> {
  const probabilities = {} as Record<TumorClass, number>;
  probabilities[tumorClass] = confidence;

  const remainingClasses = TUMOR_CLASSES.filter((item) => item !== tumorClass);
  const weights = remainingClasses.map(() => 0.35 + Math.random());
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const remainder = 1 - confidence;

  remainingClasses.forEach((className, index) => {
    probabilities[className] = (weights[index] / totalWeight) * remainder;
  });

  const total = TUMOR_CLASSES.reduce(
    (sum, className) => sum + probabilities[className],
    0,
  );
  const adjustment = 1 - total;
  probabilities[remainingClasses[remainingClasses.length - 1]] += adjustment;

  return probabilities;
}
