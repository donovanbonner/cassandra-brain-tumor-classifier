"use client";

import { motion } from "framer-motion";
import { ChevronDown, Sparkles, User } from "lucide-react";
import { useState } from "react";
import type { ChatMessage as ChatMessageType } from "@/lib/chat";

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isUser = message.role === "user";
  const hasSources = !isUser && message.sources && message.sources.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        aria-hidden
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border ${
          isUser
            ? "border-border bg-bg-soft text-fg-muted"
            : "border-teal/40 bg-teal/10 text-teal"
        }`}
      >
        {isUser ? <User size={14} /> : <Sparkles size={14} />}
      </div>

      <div className={`flex max-w-[85%] flex-col gap-2 ${isUser ? "items-end" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-teal text-bg"
              : "bg-surface text-fg ring-1 ring-border"
          }`}
        >
          {message.pending && message.content === "" ? (
            <span className="inline-flex items-center gap-1.5 text-fg-muted">
              <Dot delay={0} />
              <Dot delay={0.15} />
              <Dot delay={0.3} />
            </span>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {hasSources && (
          <div className="w-full">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.2em] text-fg-muted/80 hover:text-fg"
            >
              <ChevronDown
                size={12}
                className={`transition-transform ${expanded ? "rotate-180" : ""}`}
              />
              Why this answer?
            </button>
            {expanded && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.25 }}
                className="mt-2 space-y-1 text-xs text-fg-muted"
              >
                {message.sources!.map((topic) => (
                  <li
                    key={topic}
                    className="rounded-md border border-border/60 bg-bg-soft/40 px-2 py-1"
                  >
                    {topic}
                  </li>
                ))}
              </motion.ul>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay }}
      className="h-1.5 w-1.5 rounded-full bg-fg-muted"
    />
  );
}
