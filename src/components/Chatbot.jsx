import { useCallback, useEffect, useRef, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Bot,
  Minus,
  Send,
  Sparkles,
  X,
  ChevronUp,
  Trash2,
  CalendarDays,
  HelpCircle,
  MessageCircle,
  Navigation,
  Ticket,
} from "lucide-react";
import useLocalStorage from "../hooks/useLocalStorage";
import { quickPrompts, getAssistantReply, INITIAL_MESSAGES } from "../config/chatbotKnowledge";

const ICON_MAP = {
  CalendarDays,
  HelpCircle,
  MessageCircle,
  Navigation,
  Ticket,
};

// Maximum number of messages retained in localStorage.
// Older messages beyond this cap are dropped from the front of the array so
// the serialised JSON never grows large enough to exhaust the 5 MB quota.
const MAX_STORED_MESSAGES = 100;

// ─── Component ────────────────-----------------------------------------------

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useLocalStorage("eventra_chatbot_history", INITIAL_MESSAGES);
  const replyTimerRef = useRef(null);

  const clearReplyTimer = useCallback(() => {
    if (replyTimerRef.current) {
      clearTimeout(replyTimerRef.current);
      replyTimerRef.current = null;
    }
  }, []);

  // Expiration check on mount (2 hours threshold)
  useEffect(() => {
    try {
      const lastActive = localStorage.getItem("eventra_chatbot_last_active");
      const twoHours = 2 * 60 * 60 * 1000;
      if (lastActive && Date.now() - parseInt(lastActive) > twoHours) {
        setMessages(INITIAL_MESSAGES);
      }
      localStorage.setItem("eventra_chatbot_last_active", Date.now().toString());
    } catch (e) {
      console.warn("localStorage unavailable for Chatbot expiration check");
    }
  }, [setMessages]);

  useEffect(() => {
    return () => {
      clearReplyTimer();
    };
  }, [clearReplyTimer]);

  // Sync last active timestamp when messages change
  useEffect(() => {
    try {
      localStorage.setItem("eventra_chatbot_last_active", Date.now().toString());
    } catch (e) {
      console.warn("localStorage unavailable for Chatbot sync");
    }
  }, [messages]);

  const handleClearConversation = () => {
    toast(
      ({ closeToast }) => (
        <div>
          <p className="text-sm font-semibold mb-2">Clear conversation history?</p>
          <p className="text-xs text-gray-500 mb-3">This action cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMessages(INITIAL_MESSAGES);
                toast.success("Conversation cleared!");
                closeToast();
              }}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Yes, Clear
            </button>
            <button
              onClick={closeToast}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        position: "top-center",
      }
    );
  };
  // Auto-scroll messages to bottom of container when new ones arrive or state changes
  const chatLogsRef = useRef(null);
  // Auto-scroll messages to bottom when new ones arrive
  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (!isMinimized && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized, isOpen, isTyping]);

  const handleClose = useCallback(() => {
    clearReplyTimer();
    setIsTyping(false);
    setIsOpen(false);
    setIsMinimized(false);
  }, [clearReplyTimer]);

  // Listen for Escape key to close the chatbot (accessibility)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose, isOpen]);

  const wasOpenRef = useRef(false);
  const wasMinimizedRef = useRef(false);

  useEffect(() => {
    if (!isOpen || isMinimized) {
      wasOpenRef.current = isOpen;
      wasMinimizedRef.current = isMinimized;
      return;
    }

    const isOpening = !wasOpenRef.current || wasMinimizedRef.current;
    wasOpenRef.current = isOpen;
    wasMinimizedRef.current = isMinimized;

    const timer = setTimeout(() => {
      if (chatLogsRef.current) {
        chatLogsRef.current.scrollTo({
          top: chatLogsRef.current.scrollHeight,
          behavior: isOpening ? "auto" : "smooth",
        });
      }
    }, isOpening ? 250 : 50);

    return () => clearTimeout(timer);
  }, [messages, isTyping, isMinimized, isOpen]);

  const latestActions = useMemo(() => {
    const latestAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
    return latestAssistantMessage?.actions || [];
  }, [messages]);

  const sendMessage = (messageText = draft) => {
    const cleanMessage = messageText.trim();
    if (!cleanMessage || isTyping) return;

    // Append User Message, pruning the oldest entries when the cap is exceeded.
    setMessages((prev) => {
      const next = [...prev, { role: "user", content: cleanMessage }];
      return next.length > MAX_STORED_MESSAGES ? next.slice(next.length - MAX_STORED_MESSAGES) : next;
    });
    setDraft("");
    setIsTyping(true);

    // Simulated network/AI response latency
    clearReplyTimer();
    replyTimerRef.current = setTimeout(() => {
      const reply = getAssistantReply(cleanMessage);
      setMessages((prev) => {
        const next = [...prev, { role: "assistant", content: reply.answer, actions: reply.actions }];
        return next.length > MAX_STORED_MESSAGES ? next.slice(next.length - MAX_STORED_MESSAGES) : next;
      });
      setIsTyping(false);
      replyTimerRef.current = null;
    }, 850);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleMinimize = () => setIsMinimized((v) => !v);

  // ── Unified single portal rendering ─────────────────────────────────────────
  return createPortal(
    <>
      {/* Minimized strip / Floating launcher — shown when closed OR minimized */}
      {(!isOpen || isMinimized) && (
        <>
          {/* Minimized strip — only on desktop when minimized */}
          {isOpen && isMinimized && (
            <div
              className="
                fixed bottom-6 right-6 z-[100]
                hidden sm:flex               /* hide strip on mobile, show FAB instead */
                items-center justify-between gap-3
                w-72 rounded-2xl
                border border-slate-700
                bg-slate-950 px-4 py-3
                text-white shadow-2xl
                fixed-floating-widget
                transition-opacity duration-300
              "
              aria-label="Eventra assistant minimized"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleMinimize}
                    className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    aria-label="Expand assistant"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    aria-label="Close assistant"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <motion.button
            onClick={handleOpen}
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`
              fixed bottom-6 right-6 z-[100]
              flex h-14 w-14 items-center justify-center
              rounded-full bg-gradient-to-br from-indigo-600 to-pink-600 text-white
              shadow-[0_8px_30px_rgb(99,102,241,0.4)]
              hover:shadow-[0_8px_30px_rgb(236,72,153,0.5)]
              focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2
              transition-all duration-200 hover:scale-110
              fixed-floating-widget
              ${isMinimized ? "sm:hidden" : ""}
            `}
            aria-label="Open Eventra assistant"
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        </>
      )}

      {/* Fully expanded chat popup */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.section
            data-chatbot-open
            data-lenis-prevent
            aria-label="Eventra assistant"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="
              fixed bottom-6 right-6 z-[100]
              flex flex-col                        /* KEY FIX: flex column layout */
              w-[calc(100vw-2rem)] max-w-sm sm:max-w-sm
              rounded-2xl
              border border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-900
              shadow-2xl
              fixed-floating-widget
              transition-opacity duration-300
      
              /* KEY FIX: constrain total height to viewport so it never overflows.
                 bottom-6 = 1.5rem offset from bottom, so we subtract that + a little breathing room. */
              max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100vh-5rem)]
            "
          >
            {/* ── Header — always visible, never scrolls away ── */}
            <header
              className="
              flex flex-shrink-0 items-center justify-between gap-3
              border-b border-slate-200 dark:border-slate-700
              bg-slate-950 px-4 py-3 text-white
              rounded-t-2xl
            "
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">Eventra Assist</h2>
                  <p className="text-xs text-slate-300">Events, workshops, and support</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClearConversation}
                  className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-red-400 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  title="Clear conversation"
                  aria-label="Clear conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleMinimize}
                  className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  aria-label="Minimize assistant"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  aria-label="Close assistant"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            {/* Messages list */}
            <div
              ref={chatLogsRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
              role="log"
              aria-live="polite"
              aria-label="Chat messages"
              data-lenis-prevent
            >
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`max-w-[85%] rounded-[1.25rem] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-br-sm"
                        : "bg-slate-100 dark:bg-slate-800/80 backdrop-blur-sm text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-200/30 dark:border-slate-700/20"
                    }`}
                  >
                    {message.content}
                  </motion.div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-slate-100 dark:bg-slate-800/80 backdrop-blur-sm rounded-[1.25rem] rounded-bl-sm px-4 py-3.5 flex items-center gap-1.5 border border-slate-200/30 dark:border-slate-700/20 shadow-sm"
                  >
                    <motion.span
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-indigo-500"
                    />
                    <motion.span
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                      className="w-2 h-2 rounded-full bg-pink-500"
                    />
                    <motion.span
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                      className="w-2 h-2 rounded-full bg-emerald-500"
                    />
                  </motion.div>
                </div>
              )}

            </div>

            {/* Footer controls */}
            <div
              className="
              flex-shrink-0
              px-4 py-4
              bg-white/90 dark:bg-slate-900/90
              border-t border-slate-200/50 dark:border-slate-800/40
            "
            >
              {/* Quick prompts */}
              <div className="mb-3.5 flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-slate-200/60 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/40 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-pink-600 hover:text-white hover:border-transparent transition-all duration-300 transform hover:scale-[1.03] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Contextual action links */}
              {latestActions.length > 0 && (
                <div className="mb-3.5 flex flex-wrap gap-2">
                  {latestActions.map(({ label, to, icon: iconName }) => {
                    const Icon = ICON_MAP[iconName];
                    return (
                      <Link
                        key={`${label}-${to}`}
                        to={to}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-950 dark:bg-slate-950 dark:hover:bg-black border border-white/10 px-3 py-2 text-xs font-bold text-white hover:scale-[1.03] transition-all duration-300 shadow focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        {Icon && <Icon className="h-3.5 w-3.5" />}
                        {label}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Input form */}
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ask about Eventra..."
                  aria-label="Message input"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200/60 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/30 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || isTyping}
                  aria-label="Send message"
                  title="Send message"
                  className="rounded-xl bg-slate-900 dark:bg-white p-2.5 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 transition-all shadow hover:scale-105 active:scale-95 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}

// SECURITY PROTECTION: Escaped dynamic message history to block stored Cross-Site Scripting (XSS) script injections.
