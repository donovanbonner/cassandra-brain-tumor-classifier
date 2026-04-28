"use client";

import {
  TUMOR_CLASS_COLORS,
  TUMOR_CLASS_LABELS,
  type TumorClass,
} from "@/lib/types";

interface Props {
  tumorClass: TumorClass;
}

export default function ClassChip({ tumorClass }: Props) {
  const color = TUMOR_CLASS_COLORS[tumorClass];

  return (
    <span
      className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.28em]"
      style={{
        background: `color-mix(in oklab, ${color} 14%, transparent)`,
        color,
      }}
    >
      {TUMOR_CLASS_LABELS[tumorClass]}
    </span>
  );
}
