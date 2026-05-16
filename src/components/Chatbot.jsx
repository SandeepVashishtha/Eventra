import { useEffect, useRef, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

// ─── Knowledge base ──────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [draft, setDraft] = useState("");
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
  }, [messages, isMinimized, isOpen]);

  const latestActions = useMemo(() => {
    const latestAssistantMessage = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    return latestAssistantMessage?.actions || [];
  }, [messages]);

  const sendMessage = (messageText = draft) => {
    const cleanMessage = messageText.trim();
    if (!cleanMessage) return;
    const reply = getAssistantReply(cleanMessage);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: cleanMessage },
      { role: "assistant", content: reply.answer, actions: reply.actions },
    ]);
    setDraft("");
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
  //
  // FIX #2 (mobile): Always render a launcher FAB when the chat is not fully
  // expanded so users can reopen it from any state.
  //
  if (!isOpen || isMinimized) {
    return (
      <>
        {/* Minimized strip — only on desktop when minimized */}
        {isOpen && isMinimized && (
          <div
            className="
              fixed bottom-6 right-6 z-50
              hidden sm:flex               /* hide strip on mobile, show FAB instead */
              items-center justify-between gap-3
              w-72 rounded-2xl
              border border-slate-700
              bg-slate-950 px-4 py-3
              text-white shadow-2xl
            "
            aria-label="Eventra assistant minimized"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold">Eventra Assist</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleMinimize}
                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label="Expand assistant"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/*
          Floating Action Button — shown in all "not fully open" states.
          On desktop: shown only when fully closed (isMinimized uses the strip above).
          On mobile: always shown when not fully expanded (covers both closed + minimized).

          FIX: sm:hidden hides it on desktop when minimized (strip handles that).
                On mobile the strip is hidden so FAB always shows up for both states.
        */}
        <button
          type="button"
          onClick={handleOpen}
          className={`
            fixed bottom-6 right-6 z-50
            flex h-14 w-14 items-center justify-center
            rounded-full bg-indigo-600 text-white
            shadow-2xl shadow-indigo-500/30
            hover:bg-indigo-700
            focus:outline-none focus:ring-4 focus:ring-indigo-300
            transition-transform duration-200 hover:scale-110
            ${isMinimized ? "sm:hidden" : ""}
          `}
          aria-label="Open Eventra assistant"
        >
          <Bot className="h-6 w-6" />
        </button>
      </>
    );
  }

  // ── Fully expanded chat popup ───────────────────────────────────────────────
  return (
    <section
      data-chatbot-open
      aria-label="Eventra assistant"
      className="
        fixed bottom-6 right-6 z-50
        flex flex-col                        /* KEY FIX: flex column layout */
        w-[calc(100vw-2rem)] max-w-sm
        rounded-2xl
        border border-slate-200 dark:border-slate-700
        bg-white dark:bg-slate-900
        shadow-2xl

        /* KEY FIX: constrain total height to viewport so it never overflows.
           bottom-6 = 1.5rem offset from bottom, so we subtract that + a little breathing room. */
        max-h-[calc(100vh-5rem)]
      "
    >
      {/* ── Header — always visible, never scrolls away ── */}
      {/*
        FIX #1 (desktop): header is a flex-shrink-0 child so it is always
        rendered at the top of the constrained container. It will never be
        pushed out of the viewport.
      */}
      <header className="
        flex flex-shrink-0 items-center justify-between gap-3
        border-b border-slate-200 dark:border-slate-700
        bg-slate-950 px-4 py-3 text-white
        rounded-t-2xl
      ">
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
            onClick={handleMinimize}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Minimize assistant"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Close assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ── Messages — scrollable, fills available space ── */}
      {/*
        FIX #1 (desktop): flex-1 + overflow-y-auto means this area grows to
        fill whatever space is left between the header and footer, then scrolls
        internally. The popup itself never grows taller than max-h above.
      */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "user"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {/* Anchor element to scroll to on new messages */}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Footer — always visible, never scrolls ── */}
      {/*
        FIX #1 (desktop): flex-shrink-0 keeps the footer pinned at the bottom
        of the constrained container regardless of message count.
      */}
      <div className="
        flex-shrink-0
        border-t border-slate-200 dark:border-slate-700
        px-4 py-3
        bg-white dark:bg-slate-900
        rounded-b-2xl
      ">
        {/* Quick prompts */}
        <div className="mb-3 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Contextual action links */}
        {latestActions.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {latestActions.map(({ label, to, icon: Icon }) => (
              <Link
                key={`${label}-${to}`}
                to={to}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Input */}
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
            className="min-w-0 flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Send message"
            className="rounded-xl bg-indigo-600 p-2.5 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
}
