import { useCallback, useEffect, useRef, useMemo, useState, Fragment } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
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
import { useTranslation } from "react-i18next";
import useLocalStorage from "../hooks/useLocalStorage";
import { getQuickPrompts, getAssistantReply, getInitialMessages } from "../config/chatbotKnowledge";
import { useFocusTrap } from "../hooks/useFocusTrap";

const ICON_MAP = {
  CalendarDays,
  HelpCircle,
  MessageCircle,
  Navigation,
  Ticket,
};

function renderMarkdownToReact(text) {
  if (!text) return null;
  const segments = [];
  let remaining = text;
  let key = 0;

  const parseInline = (str) => {
    const inlineParts = [];
    let inlineRemaining = str;
    let inlineKey = 0;

    const inlineRegex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;
    let lastIndex = 0;
    let match;

    while ((match = inlineRegex.exec(inlineRemaining)) !== null) {
      if (match.index > lastIndex) {
        inlineParts.push(
          <Fragment key={inlineKey++}>{inlineRemaining.slice(lastIndex, match.index)}</Fragment>
        );
      }
      if (match[2]) {
        inlineParts.push(<strong key={inlineKey++}>{match[2]}</strong>);
      } else if (match[4]) {
        inlineParts.push(<em key={inlineKey++}>{match[4]}</em>);
      } else if (match[6]) {
        inlineParts.push(
          <code key={inlineKey++} className="rounded bg-slate-200 px-1 text-xs dark:bg-slate-700">
            {match[6]}
          </code>
        );
      } else if (match[9]) {
        const rawUrl = match[9].trim();
        const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(rawUrl);
        const isSafeScheme = /^(https?:|mailto:|tel:)/i.test(rawUrl);
        const isSafeUrl = !hasScheme || isSafeScheme;
        const safeUrl = isSafeUrl ? rawUrl : "#";
        inlineParts.push(
          <a
            key={inlineKey++}
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 underline"
          >
            {match[8]}
          </a>
        );
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < inlineRemaining.length) {
      inlineParts.push(<Fragment key={inlineKey++}>{inlineRemaining.slice(lastIndex)}</Fragment>);
    }
    return inlineParts.length ? inlineParts : str;
  };

  const lines = remaining.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i > 0) {
      segments.push(<br key={key++} />);
    }
    segments.push(<Fragment key={key++}>{parseInline(line)}</Fragment>);
  }
  return segments;
}

// Maximum number of messages retained in localStorage.
// Older messages beyond this cap are dropped from the front of the array so
// the serialised JSON never grows large enough to exhaust the 5 MB quota.
const MAX_STORED_MESSAGES = 100;

// ─── Component ────────────────-----------------------------------------------

export default function Chatbot() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useLocalStorage("eventra_chatbot_history", getInitialMessages(t));
  const replyTimerRef = useRef(null);
  const prevLangRef = useRef(i18n.language);
  const quickPrompts = useMemo(() => getQuickPrompts(t), [t, i18n.language]);

  const clearReplyTimer = useCallback(() => {
    if (replyTimerRef.current) {
      clearTimeout(replyTimerRef.current);
      replyTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (prevLangRef.current !== i18n.language) {
      setMessages(getInitialMessages(t));
      prevLangRef.current = i18n.language;
    }
  }, [i18n.language, setMessages, t]);

  // Expiration check on mount (2 hours threshold)
  useEffect(() => {
    try {
      const lastActive = localStorage.getItem("eventra_chatbot_last_active");
      const twoHours = 2 * 60 * 60 * 1000;
      if (lastActive && Date.now() - parseInt(lastActive, 10) > twoHours) {
        setMessages(getInitialMessages(t));
      }
      localStorage.setItem("eventra_chatbot_last_active", Date.now().toString());
    } catch {
      console.warn("localStorage unavailable for Chatbot expiration check");
    }
  }, [setMessages, t]);

  useEffect(() => {
    return () => {
      clearReplyTimer();
    };
  }, [clearReplyTimer]);

  // Sync last active timestamp when messages change
  useEffect(() => {
    try {
      localStorage.setItem("eventra_chatbot_last_active", Date.now().toString());
    } catch {
      console.warn("localStorage unavailable for Chatbot sync");
    }
  }, [messages]);

  const handleClearConversation = () => {
    toast(
      ({ closeToast }) => (
        <div>
          <p className="mb-2 text-sm font-semibold">{t("chatbot.clearHistory")}</p>
          <p className="mb-3 text-xs text-gray-500">{t("chatbot.clearWarning")}</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMessages(getInitialMessages(t));
                toast.success(t("chatbot.clearSuccess"));
                closeToast();
              }}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600"
            >
              {t("chatbot.clearConfirm")}
            </button>
            <button
              onClick={closeToast}
              className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-300"
            >
              {t("common.cancel")}
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

  // Trap keyboard focus inside the chat panel while it's expanded
  const { containerRef: chatTrapRef } = useFocusTrap(isOpen && !isMinimized, handleClose);

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

    const timer = setTimeout(
      () => {
        if (chatLogsRef.current) {
          chatLogsRef.current.scrollTo({
            top: chatLogsRef.current.scrollHeight,
            behavior: isOpening ? "auto" : "smooth",
          });
        }
      },
      isOpening ? 250 : 50
    );

    return () => clearTimeout(timer);
  }, [messages, isTyping, isMinimized, isOpen]);

  const latestActions = useMemo(() => {
    const latestAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");
    return latestAssistantMessage?.actions || [];
  }, [messages]);

  const sendMessage = (messageText = draft) => {
    // 🔥 FIX: Guard against React Synthetic Events to prevent fatal .trim() crashes
    const safeText = typeof messageText === "string" ? messageText : draft;
    const cleanMessage = safeText.trim();
    if (!cleanMessage || isTyping) return;

    // Append User Message, pruning the oldest entries when the cap is exceeded.
    setMessages((prev) => {
      const next = [...prev, { role: "user", content: cleanMessage }];
      return next.length > MAX_STORED_MESSAGES
        ? next.slice(next.length - MAX_STORED_MESSAGES)
        : next;
    });
    setDraft("");
    setIsTyping(true);

    // Simulated network/AI response latency
    clearReplyTimer();
    replyTimerRef.current = setTimeout(() => {
      const reply = getAssistantReply(cleanMessage, t);
      setMessages((prev) => {
        const next = [
          ...prev,
          { role: "assistant", content: reply.answer, actions: reply.actions },
        ];
        return next.length > MAX_STORED_MESSAGES
          ? next.slice(next.length - MAX_STORED_MESSAGES)
          : next;
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
              className="/* hide strip on mobile, show FAB instead */ fixed-floating-widget fixed right-6 bottom-6 z-[100] hidden w-72 items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white shadow-2xl transition-opacity duration-300 sm:flex"
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
                    className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    aria-label="Expand assistant"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    aria-label={t("chatbot.close")}
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
            className={`fixed-floating-widget fixed right-6 bottom-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-pink-600 text-white shadow-[0_8px_30px_rgb(99,102,241,0.4)] transition-all duration-200 hover:scale-110 hover:shadow-[0_8px_30px_rgb(236,72,153,0.5)] focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-none ${isMinimized ? "sm:hidden" : ""} `}
            aria-label={t("chatbot.open")}
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        </>
      )}

      {/* Fully expanded chat popup */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.section
            ref={chatTrapRef}
            data-chatbot-open
            data-lenis-prevent
            aria-label="Eventra assistant"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="/* KEY FIX: column layout */ fixed-floating-widget /* KEY FIX: constrain total height to viewport so it never overflows. = 1.5rem offset from bottom, so we subtract that + a little breathing room. */ fixed right-6 bottom-6 z-[100] flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-sm flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl transition-opacity duration-300 sm:max-h-[calc(100vh-5rem)] sm:max-w-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {/* ── Header — always visible, never scrolls away ── */}
            <header className="flex flex-shrink-0 items-center justify-between gap-3 rounded-t-2xl border-b border-slate-200 bg-slate-950 px-4 py-3 text-white dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">{t("chatbot.title")}</h2>
                  <p className="text-xs text-slate-300">{t("chatbot.subtitle")}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClearConversation}
                  disabled={messages.length <= 1}
                  className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-red-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  title="Clear conversation"
                  aria-label="Clear conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleMinimize}
                  className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  aria-label={t("chatbot.minimize")}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  aria-label={t("chatbot.close")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            {/* Messages list */}
            <div
              ref={chatLogsRef}
              className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
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
                        ? "rounded-br-sm bg-gradient-to-r from-indigo-600 to-pink-600 text-white"
                        : "rounded-bl-sm border border-slate-200/30 bg-slate-100 text-slate-800 backdrop-blur-sm dark:border-slate-700/20 dark:bg-slate-800/80 dark:text-slate-100"
                    }`}
                  >
                    {message.role === "user" ? (
                      message.content
                    ) : (
                      <div className="chatbot-markdown">
                        {renderMarkdownToReact(message.content)}
                      </div>
                    )}
                  </motion.div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex items-center gap-1.5 rounded-[1.25rem] rounded-bl-sm border border-slate-200/30 bg-slate-100 px-4 py-3.5 shadow-sm backdrop-blur-sm dark:border-slate-700/20 dark:bg-slate-800/80"
                  >
                    <motion.span
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="h-2 w-2 rounded-full bg-indigo-500"
                    />
                    <motion.span
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                      className="h-2 w-2 rounded-full bg-pink-500"
                    />
                    <motion.span
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                      className="h-2 w-2 rounded-full bg-emerald-500"
                    />
                  </motion.div>
                </div>
              )}

              {/* 🔥 FIX: Added the missing dummy div to act as the scroll target for messagesEndRef */}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer controls */}
            <div className="flex-shrink-0 border-t border-slate-200/50 bg-white/90 px-4 py-4 dark:border-slate-800/40 dark:bg-slate-900/90">
              {/* Quick prompts */}
              <div className="mb-3.5 flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="transform rounded-full border border-slate-200/60 bg-slate-50/50 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all duration-300 hover:scale-[1.03] hover:border-transparent hover:bg-gradient-to-r hover:from-indigo-600 hover:to-pink-600 hover:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-slate-800/50 dark:bg-slate-950/40 dark:text-slate-300"
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
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow transition-all duration-300 hover:scale-[1.03] hover:bg-slate-950 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-slate-950 dark:hover:bg-black"
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
                  placeholder={t("chatbot.placeholder")}
                  aria-label={t("chatbot.placeholder")}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200/60 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-900 transition-colors outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-slate-800/50 dark:bg-slate-950/30 dark:text-white dark:focus:border-indigo-400"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || isTyping}
                  aria-label={t("chatbot.send")}
                  title={t("chatbot.send")}
                  className="rounded-xl bg-slate-900 p-2.5 text-white shadow transition-all hover:scale-105 hover:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
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
