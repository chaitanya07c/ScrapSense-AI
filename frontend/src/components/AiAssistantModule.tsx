import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Brain, User } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Message {
  role: "user" | "assistant";
  content: string;
}

// ---------------------------------------------------------------------------
// Helpers — parse AI response into structured sections
// ---------------------------------------------------------------------------

interface ParsedResponse {
  mainText: string;
  rememberedNotes: string[];
}

/**
 * Splits the plain-text AI response into:
 *   • mainText        — everything before the "Remembered notes:" section
 *   • rememberedNotes — individual note strings extracted from the section
 *
 * The backend returns notes like:
 *   "Remembered notes:\n- always delivers clean bottles\n- ..."
 */
function parseAiResponse(content: string): ParsedResponse {
  const NOTES_MARKER = /remembered notes:/i;
  const match = content.search(NOTES_MARKER);

  if (match === -1) {
    return { mainText: content, rememberedNotes: [] };
  }

  const mainText = content.slice(0, match).trim();
  const notesSection = content.slice(match);

  // Extract each "- note text" line
  const noteLines = notesSection
    .split("\n")
    .filter((line) => line.trim().startsWith("-"))
    .map((line) => line.replace(/^-+\s*/, "").trim())
    .filter(Boolean);

  return { mainText, rememberedNotes: noteLines };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Renders one line of the supplier summary as plain text, preserving newlines */
function PlainTextBlock({ text }: { text: string }) {
  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed">{text}</div>
  );
}

/** The "Remembered Notes" card shown inside supplier summary messages */
function RememberedNotesCard({ notes }: { notes: string[] }) {
  return (
    <div
      className="mt-3 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-800 p-3"
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
          Remembered Notes
        </span>
      </div>

      {/* Notes list — scrollable after 5 items */}
      <ul
        className="space-y-1.5 overflow-y-auto pr-1"
        style={{ maxHeight: notes.length > 5 ? "9rem" : "none" }}
      >
        {notes.map((note, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-0.5 text-blue-400 dark:text-blue-500 select-none">•</span>
            <span className="text-sm text-blue-900 dark:text-blue-100 leading-snug capitalize">
              {note}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Renders a single chat bubble, with optional notes card for assistant messages */
function ChatBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end items-end gap-2">
        <div className="max-w-[78%] px-4 py-3 rounded-2xl rounded-br-sm bg-blue-600 text-white text-sm leading-relaxed">
          {msg.content}
        </div>
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    );
  }

  const { mainText, rememberedNotes } = parseAiResponse(msg.content);
  const isMemorySaved = msg.content.startsWith("Memory saved for");

  return (
    <div className="flex justify-start items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-slate-600 dark:text-slate-300" />
      </div>

      <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-white">
        {/* If memory was saved, show a small badge */}
        {isMemorySaved && (
          <div className="flex items-center gap-1.5 mb-2">
            <Brain className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Memory Saved
            </span>
          </div>
        )}

        <PlainTextBlock text={mainText} />

        {/* Remembered Notes card — only when present */}
        {rememberedNotes.length > 0 && (
          <RememberedNotesCard notes={rememberedNotes} />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick-suggestion chips
// ---------------------------------------------------------------------------

const QUICK_SUGGESTIONS = [
  "Tell me about Sri Durga Wines",
  "Remember Sri Durga Wines always delivers clean bottles",
  "Show pending payments",
  "Which supplier gives best quality?",
  "Average Kingfisher price",

  // NEW BUTTONS
  "Best supplier for Kingfisher",
  "Cheapest supplier",
  "Highest quality supplier",
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AiAssistantModule() {
  const [chatMessage, setChatMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your Hindsight Memory AI. I can recall supplier history, prices, quality trends, pending payments, and remembered notes.",
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage.trim();

    setChatHistory((prev) => [...prev, { role: "user", content: userMessage }]);
    setChatMessage("");
    setLoading(true);

    try {
  const API_URL = "https://backend-three-murex-64.vercel.app";

  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: userMessage,
    }),
  });

  const data = await response.json();

  setChatHistory((prev) => [
    ...prev,
    {
      role: "assistant",
      content: data.response ?? "No response received.",
    },
  ]);
} catch (error) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Backend not connected. Please start the FastAPI server on port 8000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white dark:bg-slate-950 rounded-3xl shadow border overflow-hidden">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="p-4 border-b flex justify-between items-center shrink-0">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-lg">
            <Bot className="w-6 h-6 text-blue-600" />
            Hindsight Memory Assistant
          </h2>
          <p className="text-sm text-gray-500">
            Connected to FastAPI + Hindsight Memory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-500" />
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            Live Memory
          </span>
        </div>
      </div>

      {/* ── Chat history ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {chatHistory.map((msg, index) => (
          <ChatBubble key={index} msg={msg} />
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-100 dark:bg-slate-800">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input area ─────────────────────────────────────── */}
      <div className="border-t p-4 shrink-0">
        <form onSubmit={handleChatSubmit} className="flex gap-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder='Ask anything, or type "Remember <Supplier> ..."'
            className="flex-1 border rounded-xl px-4 py-3 text-sm dark:bg-slate-900 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !chatMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 rounded-xl transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        {/* Quick suggestion chips */}
        <div className="flex gap-2 flex-wrap mt-3">
          {QUICK_SUGGESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => setChatMessage(q)}
              className="text-xs px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}