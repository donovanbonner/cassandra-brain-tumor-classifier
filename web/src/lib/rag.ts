import { ChatMistralAI, MistralAIEmbeddings } from "@langchain/mistralai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import type { DocumentInterface } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import tumorKb from "@/data/tumor_kb.json";

interface KbEntry {
  id: string;
  class: string;
  topic: string;
  text: string;
  source: string;
}

declare global {
  var __neuroscanVectorStore: Promise<MemoryVectorStore> | undefined;
}

function requireApiKey(): string {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) {
    throw new Error(
      "MISTRAL_API_KEY is not set. Add it to web/.env.local before using the chat assistant.",
    );
  }
  return key;
}

async function buildVectorStore(): Promise<MemoryVectorStore> {
  const embeddings = new MistralAIEmbeddings({
    apiKey: requireApiKey(),
    model: "mistral-embed",
  });

  const docs = (tumorKb as KbEntry[]).map(
    (entry) =>
      new Document({
        pageContent: entry.text,
        metadata: {
          id: entry.id,
          class: entry.class,
          topic: entry.topic,
          source: entry.source,
        },
      }),
  );

  return MemoryVectorStore.fromDocuments(docs, embeddings);
}

export async function getVectorStore(): Promise<MemoryVectorStore> {
  if (!globalThis.__neuroscanVectorStore) {
    globalThis.__neuroscanVectorStore = buildVectorStore();
  }
  return globalThis.__neuroscanVectorStore;
}

export interface RetrievedDoc {
  topic: string;
  source: string;
  text: string;
}

export async function retrieve(
  question: string,
  k = 3,
): Promise<RetrievedDoc[]> {
  const store = await getVectorStore();
  const results = await store.similaritySearch(question, k);
  return results.map((doc: DocumentInterface) => ({
    topic: String(doc.metadata.topic ?? "untitled"),
    source: String(doc.metadata.source ?? "unknown"),
    text: doc.pageContent,
  }));
}

const SYSTEM_PROMPT = `You are NeuroScan Assistant, an educational AI helping a student understand a brain MRI classification result.

Current prediction: {predicted_class} ({confidence_pct}% confidence)
All probabilities: {probs_line}

You may ONLY answer questions about:
- Brain tumors (glioma, meningioma, pituitary tumors, "no tumor" results)
- MRI scans and neuroimaging
- Neurological health
- This specific classification result
- The Cassandra v1 model and Grad-CAM explanations

If the user's question is OFF-topic (sports, politics, weather, programming, recipes, etc.), respond with EXACTLY this and nothing else:

"I can only help with questions about brain tumors, MRI scans, or your diagnosis result. Try asking about {predicted_class} or general tumor questions instead."

For ON-topic questions, ground your answer in the retrieved context below. If the context does not cover the question, say "I don't have that information in the knowledge base" rather than guessing.

Retrieved context:
{context}

Rules:
- This is an educational class project, not a clinical diagnosis. Mention this once per conversation.
- Use plain language. Define jargon when you use it.
- Refuse treatment questions and redirect to a licensed clinician.
- Keep answers under 150 words unless the user explicitly asks for more detail.
- End grounded answers with a single line: "Sources: topic1, topic2"`;

export interface ChainInput {
  question: string;
  context: string;
  predicted_class: string;
  confidence_pct: string;
  probs_line: string;
}

export function buildChain() {
  const model = new ChatMistralAI({
    apiKey: requireApiKey(),
    model: "mistral-small-latest",
    streaming: true,
    temperature: 0.3,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    ["human", "{question}"],
  ]);

  return prompt.pipe(model).pipe(new StringOutputParser());
}

export function formatProbsLine(
  probabilities: Record<string, number>,
): string {
  return Object.entries(probabilities)
    .map(([cls, p]) => `${cls} ${(p * 100).toFixed(1)}%`)
    .join(", ");
}

export function formatContext(docs: RetrievedDoc[]): string {
  return docs
    .map((d, i) => `[${i + 1}] ${d.topic} (${d.source})\n${d.text}`)
    .join("\n\n");
}
