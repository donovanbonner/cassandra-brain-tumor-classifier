import {
  buildChain,
  formatContext,
  formatProbsLine,
  retrieve,
} from "@/lib/rag";
import type { ChatStreamEvent } from "@/lib/chat";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ChatRequestBody {
  messages: Array<{ role: string; content: string }>;
  prediction: {
    tumorClass: string;
    confidence: number;
    probabilities: Record<string, number>;
  };
}

function ndjson(event: ChatStreamEvent): string {
  return JSON.stringify(event) + "\n";
}

export async function POST(request: Request): Promise<Response> {
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const lastUserMessage = [...body.messages]
    .reverse()
    .find((m) => m.role === "user")?.content?.trim();

  if (!lastUserMessage) {
    return new Response("No user message found", { status: 400 });
  }
  if (!body.prediction) {
    return new Response("Missing prediction context", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const docs = await retrieve(lastUserMessage, 3);
        controller.enqueue(
          encoder.encode(
            ndjson({ type: "sources", sources: docs.map((d) => d.topic) }),
          ),
        );

        const chain = buildChain();
        const tokenStream = await chain.stream({
          question: lastUserMessage,
          context: formatContext(docs),
          predicted_class: body.prediction.tumorClass,
          confidence_pct: (body.prediction.confidence * 100).toFixed(1),
          probs_line: formatProbsLine(body.prediction.probabilities),
        });

        for await (const chunk of tokenStream) {
          if (chunk) {
            controller.enqueue(encoder.encode(ndjson({ type: "token", token: chunk })));
          }
        }

        controller.enqueue(encoder.encode(ndjson({ type: "done" })));
        controller.close();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Chat request failed.";
        controller.enqueue(encoder.encode(ndjson({ type: "error", message })));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
