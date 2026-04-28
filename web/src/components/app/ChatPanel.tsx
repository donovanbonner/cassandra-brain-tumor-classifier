"use client";

import { motion } from "framer-motion";
import { Info, MessageSquareText, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import {
  GENERAL_QUESTIONS,
  SUGGESTED_QUESTIONS,
  type ChatMessage as ChatMessageType,
  type ChatStreamEvent,
} from "@/lib/chat";
import type { Prediction } from "@/lib/types";

interface Props {
  prediction: Prediction;
}

const easeOutExpo = [0.22, 1, 0.36, 1] as const;

export default function ChatPanel({ prediction }: Props) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const suggested = [
    ...SUGGESTED_QUESTIONS[prediction.tumorClass],
    ...GENERAL_QUESTIONS,
  ];

  const send = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || streaming) return;

    const userMsg: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    const assistantMsg: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      sources: [],
      pending: true,
    };

    const nextMessages = [...messages, userMsg, assistantMsg];
    setMessages(nextMessages);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages
            .filter((m) => !m.pending)
            .map((m) => ({ role: m.role, content: m.content })),
          prediction: {
            tumorClass: prediction.tumorClass,
            confidence: prediction.confidence,
            probabilities: prediction.probabilities,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server returned ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let event: ChatStreamEvent;
          try {
            event = JSON.parse(line) as ChatStreamEvent;
          } catch {
            continue;
          }
          applyEvent(event, assistantMsg.id, setMessages);
        }
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      const message =
        err instanceof Error ? err.message : "Couldn't reach the assistant.";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: `Error: ${message}`, pending: false }
            : m,
        ),
      );
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6, ease: easeOutExpo }}
      className="rounded-[var(--radius-card)] border border-border bg-surface"
    >
      <header className="flex items-start gap-3 border-b border-border/70 p-5">
        <span
          aria-hidden
          className="grid h-10 w-10 place-items-center rounded-xl border border-teal/40 bg-teal/10 text-teal"
        >
          <MessageSquareText size={18} strokeWidth={1.7} />
        </span>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.3em] text-teal">
            Step 4 · Explain
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">
            Ask about this result
          </h3>
        </div>
      </header>

      <div className="border-b border-border/70 bg-meningioma/5 px-5 py-3">
        <p className="flex items-start gap-2 text-xs text-meningioma">
          <Info size={14} className="mt-0.5 shrink-0" />
          <span className="leading-relaxed text-fg-muted">
            <span className="font-medium text-meningioma">
              AI-generated, not medical advice.
            </span>{" "}
            Answers are grounded in a curated tumor knowledge base. Tumor and
            health questions only.
          </span>
        </p>
      </div>

      {messages.length === 0 && (
        <div className="px-5 py-5">
          <p className="mb-3 inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.3em] text-fg-muted">
            <Sparkles size={12} className="text-teal" />
            Suggested questions
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {suggested.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void send(q)}
                disabled={streaming}
                className="rounded-xl border border-border bg-bg-soft/40 px-4 py-2.5 text-left text-sm text-fg transition-colors hover:border-teal/40 hover:bg-bg-soft/70 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="max-h-[28rem] space-y-4 overflow-y-auto px-5 py-5">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t border-border/70 p-4"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your result… (Shift+Enter for newline)"
          rows={1}
          disabled={streaming}
          className="min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-bg-soft/40 px-3 py-2.5 text-sm text-fg placeholder:text-fg-muted/70 focus:border-teal/50 focus:outline-none focus:ring-2 focus:ring-teal/20 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal text-bg transition-colors hover:bg-teal-soft disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send"
        >
          <Send size={16} />
        </button>
      </form>

      <p className="px-4 pb-3 text-[0.7rem] text-fg-muted/60">
        Off-topic questions will be redirected. Tumor / health questions only.
      </p>
    </motion.section>
  );
}

function applyEvent(
  event: ChatStreamEvent,
  assistantId: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageType[]>>,
) {
  setMessages((prev) =>
    prev.map((m) => {
      if (m.id !== assistantId) return m;
      switch (event.type) {
        case "sources":
          return { ...m, sources: event.sources };
        case "token":
          return { ...m, content: m.content + event.token, pending: false };
        case "done":
          return { ...m, pending: false };
        case "error":
          return {
            ...m,
            content: m.content || `Error: ${event.message}`,
            pending: false,
          };
      }
    }),
  );
}
