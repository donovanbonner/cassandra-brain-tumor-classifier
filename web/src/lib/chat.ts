import type { TumorClass } from "./types";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  sources?: string[];
  pending?: boolean;
}

export type ChatStreamEvent =
  | { type: "sources"; sources: string[] }
  | { type: "token"; token: string }
  | { type: "done" }
  | { type: "error"; message: string };

export const SUGGESTED_QUESTIONS: Record<TumorClass, string[]> = {
  glioma: [
    "What is a glioma?",
    "What are common glioma symptoms?",
    "Where do gliomas typically occur?",
    "What should I do next?",
  ],
  meningioma: [
    "What is a meningioma?",
    "What are meningioma symptoms?",
    "Where do meningiomas form?",
    "What should I do next?",
  ],
  pituitary: [
    "What is a pituitary tumor?",
    "What symptoms do pituitary tumors cause?",
    "Where is the pituitary gland?",
    "What should I do next?",
  ],
  notumor: [
    "What does 'no tumor' mean here?",
    "What are this model's limitations?",
    "Should I still see a doctor?",
    "How accurate is this model?",
  ],
};

export const GENERAL_QUESTIONS = [
  "What does the heatmap show?",
  "How accurate is the model?",
];
