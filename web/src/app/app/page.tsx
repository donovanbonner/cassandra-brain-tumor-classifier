import type { Metadata } from "next";

import DiagnosticApp from "@/components/app/DiagnosticApp";

export const metadata: Metadata = {
  title: "Diagnose · NeuroScan AI",
};

export default function AppPage() {
  return <DiagnosticApp />;
}
