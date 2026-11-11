/**
 * CivicSolve AI Chatbot
 *
 * Floating chatbot button + slide-up chat window.
 * Calls the FastAPI /api/v1/ai/chat endpoint (never exposes the OpenAI key).
 * Matches the existing CivicSolve design system (zinc palette, emerald brand colour).
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Bot,
  User,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

// ── Types ──────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  error?: boolean;
}

// ── Config ─────────────────────────────────────────────────

const AI_SERVICE_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_AI_SERVICE_URL) ||
  "http://localhost:8000";

const CHAT_ENDPOINT = `${AI_SERVICE_URL}/api/v1/ai/chat`;

// ── Helpers ────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ── Markdown-lite renderer (bold + lists) ──────────────────

function renderContent(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={key} className="list-disc pl-4 space-y-0.5 my-1">
        {listBuffer.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (/^(\d+\.\s|[-*]\s)/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^(\d+\.\s|[-*]\s)/, ""));
    } else {
      flushList(`list-${i}`);
      if (trimmed === "") {
        elements.push(<br key={`br-${i}`} />);
      } else {
        elements.push(
          <p key={`p-${i}`} className="text-sm leading-relaxed mb-0.5">
            {renderInline(trimmed)}
          </p>
        );
      }
    }
  });
  flushList("list-end");
  return elements;
}

function renderInline(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// ── Typing indicator ───────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
        />
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────

export const ChatBot: React.FC = () => {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome: Message = {
        id: uid(),
        role: "assistant",
        content:
          lang === "hi"
            ? "नमस्ते! मैं CivicSolve का AI सहायक हूँ। आप मुझसे नागरिक समस्याओं, शिकायत दर्ज करने की प्रक्रिया, या प्लेटफ़ॉर्म के बारे में कुछ भी पूछ सकते हैं। आज मैं आपकी कैसे मदद कर सकता हूँ?"
            : "Hello! I'm the CivicSolve AI Assistant. I can help you understand civic issues, guide you on reporting problems (water, roads, sanitation, health, agriculture), or explain how the platform works. How can I help you today?",
        timestamp: new Date(),
      };
      setMessages([welcome]);
    }
  }, [isOpen, lang]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setHasNewMessage(false);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError(null);

    const userMsg: Message = {
      id: uid(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Build history for the API (exclude error messages, limit to last 10)
    const history = [...messages, userMsg]
      .filter((m) => !m.error)
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          language: lang,
        }),
      });

      if (!response.ok) {
        let detail = "Something went wrong. Please try again.";
        try {
          const errData = await response.json();
          detail = errData.detail || detail;
        } catch {
          // ignore parse error
        }
        throw new Error(detail);
      }

      const data = await response.json();
      const assistantMsg: Message = {
        id: uid(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (!isOpen) setHasNewMessage(true);
    } catch (err: any) {
      const errMsg: Message = {
        id: uid(),
        role: "assistant",
        content:
          err?.message ||
          (lang === "hi"
            ? "कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें।"
            : "Something went wrong. Please try again."),
        timestamp: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errMsg]);
      setError(err?.message || "Error");
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, lang, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    // Re-trigger welcome
    setIsOpen(false);
    setTimeout(() => setIsOpen(true), 50);
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) setHasNewMessage(false);
  };

  return (
    <>
      {/* ── Chat panel ──────────────────────────────────── */}
      <div
        ref={chatPanelRef}
        className={`
          fixed bottom-24 right-4 sm:right-6 z-50
          w-[calc(100vw-2rem)] sm:w-96
          max-h-[75vh]
          bg-white border border-zinc-200 rounded-2xl shadow-2xl
          flex flex-col overflow-hidden
          transition-all duration-300 ease-out
          ${isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
          }
        `}
        aria-hidden={!isOpen}
        role="dialog"
        aria-label="CivicSolve AI Chatbot"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-[#2d5a43] rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Bot className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">
                CivicSolve Assistant
              </p>
              <p className="text-xs text-emerald-200 leading-tight">
                {lang === "hi" ? "AI सहायक • ऑनलाइन" : "AI-powered • Online"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              title="New conversation"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleOpen}
              title="Close"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Suggested prompts (shown only at start) */}
        {messages.length <= 1 && !loading && (
          <div className="px-3 pt-3 pb-1 flex flex-wrap gap-1.5 shrink-0">
            {(lang === "hi"
              ? [
                  "शिकायत कैसे दर्ज करें?",
                  "पानी की समस्या",
                  "सड़क में गड्ढे",
                  "कचरा प्रबंधन",
                ]
              : [
                  "How do I report a problem?",
                  "Water supply issue",
                  "Road pothole help",
                  "Waste management",
                ]
            ).map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setInput(prompt);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-colors whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div className="shrink-0 mt-0.5">
                {msg.role === "assistant" ? (
                  <div className="w-6 h-6 rounded-full bg-[#2d5a43] flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-zinc-600" />
                  </div>
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 ${
                  msg.role === "user"
                    ? "bg-[#2d5a43] text-white rounded-tr-sm"
                    : msg.error
                    ? "bg-red-50 border border-red-200 text-red-700 rounded-tl-sm"
                    : "bg-zinc-50 border border-zinc-100 text-zinc-800 rounded-tl-sm"
                }`}
              >
                {msg.role === "user" ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                ) : (
                  <div className="text-sm leading-relaxed">
                    {renderContent(msg.content)}
                  </div>
                )}
                <p
                  className={`text-[10px] mt-1 ${
                    msg.role === "user"
                      ? "text-emerald-200 text-right"
                      : "text-zinc-400"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2 items-start">
              <div className="w-6 h-6 rounded-full bg-[#2d5a43] flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-zinc-50 border border-zinc-100 rounded-xl rounded-tl-sm px-3 py-2.5">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-zinc-100 p-3 shrink-0 bg-white rounded-b-2xl">
          {error && (
            <p className="text-xs text-red-500 mb-1.5 px-1">
              ⚠ {lang === "hi" ? "त्रुटि:" : "Error:"}{" "}
              {error.length > 80 ? error.slice(0, 77) + "…" : error}
            </p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
              placeholder={
                lang === "hi"
                  ? "अपना सवाल लिखें… (Enter = भेजें)"
                  : "Type your question… (Enter to send)"
              }
              className="flex-1 resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-emerald-400 focus:bg-white transition-colors leading-relaxed disabled:opacity-50 max-h-28"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              title={lang === "hi" ? "भेजें" : "Send"}
              className="shrink-0 w-10 h-10 rounded-xl bg-[#2d5a43] hover:bg-[#234634] disabled:bg-zinc-200 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1.5 text-center">
            {lang === "hi"
              ? "AI सहायक • गलतियाँ हो सकती हैं"
              : "AI Assistant • May make mistakes"}
          </p>
        </div>
      </div>

      {/* ── Floating trigger button ────────────────────── */}
      <button
        onClick={toggleOpen}
        aria-label={isOpen ? "Close chatbot" : "Open CivicSolve AI Assistant"}
        className={`
          fixed bottom-5 right-4 sm:right-6 z-50
          w-14 h-14 rounded-2xl shadow-lg
          flex items-center justify-center
          transition-all duration-300 ease-out
          ${isOpen
            ? "bg-zinc-700 hover:bg-zinc-800 rotate-0 scale-95"
            : "bg-[#2d5a43] hover:bg-[#234634] hover:scale-105"
          }
          text-white
        `}
      >
        {/* Unread badge */}
        {hasNewMessage && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />
        )}
        <div
          className={`transition-transform duration-300 ${isOpen ? "rotate-90" : "rotate-0"}`}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </div>
      </button>
    </>
  );
};

export default ChatBot;
