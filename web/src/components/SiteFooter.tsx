import { ShieldAlert } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border/60 px-6 py-10 text-sm text-fg-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ShieldAlert
            size={18}
            className="mt-0.5 shrink-0 text-meningioma"
            strokeWidth={1.6}
          />
          <p className="max-w-xl text-xs leading-relaxed">
            <span className="font-medium text-fg">Not for clinical use.</span>{" "}
            NeuroScan AI is an educational class project. Results must be
            reviewed by a licensed clinician.
          </p>
        </div>
        <p className="text-xs">
          Dataset:{" "}
          <a
            href="https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset"
            target="_blank"
            rel="noreferrer noopener"
            className="text-teal underline-offset-4 hover:underline"
          >
            masoudnickparvar/brain-tumor-mri-dataset
          </a>{" "}
          · CC BY 4.0
        </p>
      </div>
    </footer>
  );
}
