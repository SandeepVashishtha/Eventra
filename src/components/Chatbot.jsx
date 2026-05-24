import { useEffect, useRef, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  CalendarDays,
  HelpCircle,
  MessageCircle,
  Minus,
  Navigation,
  Send,
  Sparkles,
  Ticket,
  X,
  ChevronUp,
} from "lucide-react";

// ─── Knowledge base ────────────────------------------------------------------

const quickPrompts = [
  "How do I register for an event?",
  "Suggest an event for beginners",
  "How can I host a workshop?",
  "Where can I get platform help?",
];

const knowledgeBase = [
  {
    keywords: ["register", "join", "ticket", "attend", "participate"],
    answer:
      "To register, open the Events or Hackathons page, choose a card, and use the registration action. If the event requires an account, sign in first so Eventra can save your registration and check-in details.",
    actions: [{ label: "Browse events", to: "/events", icon: CalendarDays }],
  },
  {
    keywords: ["suggest", "recommend", "beginner", "interest", "location"],
    answer:
      "A good starting point is a workshop or beginner-friendly hackathon. Search by topic on the Events page, then compare format, date, tags, and location before registering.",
    actions: [
      { label: "Events", to: "/events", icon: CalendarDays },
      { label: "Hackathons", to: "/hackathons", icon: Ticket },
    ],
  },
  {
    keywords: ["host", "create", "organize", "workshop", "event"],
    answer:
      "Organizers can create events from the dashboard after signing in. Add the event title, format, schedule, capacity, location or meeting details, then publish when the listing is ready.",
    actions: [{ label: "Dashboard", to: "/dashboard", icon: Navigation }],
  },
  {
    keywords: ["help", "support", "faq", "issue", "problem", "contact"],
    answer:
      "For platform questions, start with the FAQ. For account, registration, or technical problems, use Contact so the team has enough context to help.",
    actions: [
      { label: "FAQ", to: "/faq", icon: HelpCircle },
      { label: "Contact", to: "/contact", icon: MessageCircle },
    ],
  },
];

const defaultAnswer =
  "I can help with event registration, recommendations, hosting guidance, and platform support. Try asking about the event you want to attend or what kind of workshop you are looking for.";

function getAssistantReply(input) {
  const normalizedInput = input.toLowerCase();
  const match = knowledgeBase.find((item) =>
    item.keywords.some((keyword) => normalizedInput.includes(keyword))
  );
  return (
    match || {
      answer: defaultAnswer,
      actions: [{ label: "Explore events", to: "/events", icon: CalendarDays }],
    }
  );
}

// ─── Component ────────────────-----------------------------------------------

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I am Eventra Assist. Ask me about events, workshops, registration, hosting, or platform help.",
      actions: [
        { label: "Events", to: "/events", icon: CalendarDays },
        { label: "FAQ", to: "/faq", icon: HelpCircle },
      ],
    },
  ]);

  // Auto-scroll messages to bottom when new ones arrive
  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (!isMinimized && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized, isOpen, isTyping]);

  const latestActions = useMemo(() => {
    const latestAssistantMessage = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    return latestAssistantMessage?.actions || [];
  }, [messages]);

  const sendMessage = (messageText = draft) => {
    const cleanMessage = messageText.trim();
    if (!cleanMessage || isTyping) return;

    // Append User Message
    setMessages((prev) => [
      ...prev,
      { role: "user", content: cleanMessage }
    ]);
    setDraft("");
    setIsTyping(true);

    // Simulated network/AI response latency
    setTimeout(() => {
      const reply = getAssistantReply(cleanMessage);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply.answer, actions: reply.actions }
      ]);
      setIsTyping(false);
    }, 850);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => setIsMinimized((v) => !v);

  // ── Floating launcher — shown when closed OR minimized ─────────────────────
  if (!isOpen || isMinimized) {
    return createPortal(
      <>
        {/* Minimized strip — only on desktop when minimized */}
        <AnimatePresence>
          {isOpen && isMinimized && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="
                fixed bottom-6 right-6 z-[100]
                hidden sm:flex
                items-center justify-between gap-3
                w-72 rounded-2xl
                border border-white/20 dark:border-slate-800/30
                bg-slate-950/90 backdrop-blur-xl px-4 py-3
                text-white shadow-2xl shadow-indigo-500/10
              "
              aria-label="Eventra assistant minimized"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  </div>
                </div>
                <span className="text-sm font-bold tracking-tight">Eventra Assist</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleMinimize}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Expand assistant"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Close assistant"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={handleOpen}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className={`
            fixed bottom-6 right-6 z-[100]
            flex h-14 w-14 items-center justify-center
            rounded-full bg-gradient-to-br from-indigo-600 to-pink-600 text-white
            shadow-[0_8px_30px_rgb(99,102,241,0.4)]
            hover:shadow-[0_8px_30px_rgb(236,72,153,0.5)]
            focus:outline-none focus:ring-4 focus:ring-indigo-300
            transition-all duration-300
            ${isMinimized ? "sm:hidden" : ""}
          `}
          aria-label="Open Eventra assistant"
        >
          <Bot className="h-6 w-6" />
        </motion.button>
      </>,
      document.body
    );
  }

  // ── Fully expanded chat popup ───────────────────────────────────────────────
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.section
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", stiffness: 280, damping: 25 }}
          data-chatbot-open
          aria-label="Eventra assistant"
          className="
            fixed bottom-6 right-6 z-[100]
            flex flex-col
            w-[calc(100vw-2rem)] max-w-sm sm:max-w-sm
            rounded-[2rem]
            border border-white/20 dark:border-slate-800/30
            bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl
            shadow-2xl shadow-slate-950/20 dark:shadow-black/40
            max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100vh-5rem)]
            overflow-hidden
          "
        >
          {/* Header */}
          <header className="
            flex flex-shrink-0 items-center justify-between gap-3
            border-b border-slate-200/50 dark:border-slate-800/40
            bg-slate-950/90 dark:bg-slate-950 px-4 py-3.5 text-white
          ">
            <div className="flex items-center gap-3">
              <div className="relative">
                {/* Glowing breathing ring */}
                <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 blur opacity-75 animate-pulse" />
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 border border-white/10 text-indigo-400">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-tight">Eventra Assist</h2>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Active Now</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleMinimize}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Minimize assistant"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Messages list */}
          <div
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
            
            <div ref={messagesEndRef} />
          </div>

          {/* Footer controls */}
          <div className="
            flex-shrink-0
            px-4 py-4
            bg-white/90 dark:bg-slate-900/90
            border-t border-slate-200/50 dark:border-slate-800/40
          ">
            {/* Quick prompts */}
            <div className="mb-3.5 flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-slate-200/60 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/40 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-pink-600 hover:text-white hover:border-transparent transition-all duration-300 transform hover:scale-[1.03]"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Contextual action links */}
            {latestActions.length > 0 && (
              <div className="mb-3.5 flex flex-wrap gap-2">
                {latestActions.map(({ label, to, icon: Icon }) => (
                  <Link
                    key={`${label}-${to}`}
                    to={to}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-950 dark:bg-slate-950 dark:hover:bg-black border border-white/10 px-3 py-2 text-xs font-bold text-white hover:scale-[1.03] transition-all duration-300 shadow"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Link>
                ))}
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
                className="min-w-0 flex-1 rounded-xl border border-slate-200/60 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/30 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isTyping}
                aria-label="Send message"
                className="rounded-xl bg-slate-900 dark:bg-white p-2.5 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 transition-all shadow hover:scale-105 active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </motion.section>
      )}
    </AnimatePresence>,
    document.body
  );
}