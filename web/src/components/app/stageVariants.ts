import type { Variants } from "framer-motion";

export const stageVariants: Variants = {
  enter: { opacity: 0, y: 28, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 1.02,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};
