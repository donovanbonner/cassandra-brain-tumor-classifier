export const TUMOR_CLASSES = [
  "glioma",
  "meningioma",
  "pituitary",
  "notumor",
] as const;

export type TumorClass = (typeof TUMOR_CLASSES)[number];

export const TUMOR_CLASS_LABELS: Record<TumorClass, string> = {
  glioma: "Glioma",
  meningioma: "Meningioma",
  pituitary: "Pituitary",
  notumor: "No Tumor",
};

export const TUMOR_CLASS_COLORS: Record<TumorClass, string> = {
  glioma: "var(--color-glioma)",
  meningioma: "var(--color-meningioma)",
  pituitary: "var(--color-pituitary)",
  notumor: "var(--color-notumor)",
};

export interface Prediction {
  tumorClass: TumorClass;
  confidence: number;
  probabilities: Record<TumorClass, number>;
  heatmapDataUrl: string;
}

export type Stage = "upload" | "processing" | "result";
