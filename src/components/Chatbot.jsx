import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Bot, CalendarDays, HelpCircle, MessageCircle,
  Minus, Navigation, Send, Sparkles, Ticket, X,
} from "lucide-react";

// ─── Knowledge base ───────────────────────────────────────────────────────────

const INITIAL_MESSAGE = {
  role: "assistant",
  content: "Hi, I am Eventra Assist. Ask me about events, workshops, registration, hosting, or platform help.",
  actions: [
    { label: "Events", to: "/events", icon: CalendarDays },
    { label: "FAQ",    to: "/faq",    icon: HelpCircle   },
  ],
};

const quickPrompts = [
  "How do I register for an event?",
  "Suggest an event for beginners",
  "How can I host a workshop?",
  "Where can I get platform help?",
];

const knowledgeBase = [
  {
    keywords: ["register", "join", "ticket", "attend", "participate"],
    answer: "To register, open the Events or Hackathons page, choose a card, and use the registration action. If the event requires an account, sign in first so Eventra can save your registration and check-in details.",
    actions: [{ label: "Browse events", to: "/events", icon: CalendarDays }],
  },
  {
    keywords: ["suggest", "recommend", "beginner", "interest", "location"],
    answer: "A good starting point is a workshop or beginner-friendly hackathon. Search by topic on the Events page, then compare format, date, tags, and location before registering.",
    actions: [
      { label: "Events",     to: "/events",     icon: CalendarDays },
      { label: "Hackathons", to: "/hackathons", icon: Ticket       },
    ],
  },
  {
    keywords: ["host", "create", "organize", "workshop", "event"],
    answer: "Organizers can create events from the dashboard after signing in. Add the event title, format, schedule, capacity, location or meeting details, then publish when the listing is ready.",
    actions: [{ label: "Dashboard", to: "/dashboard", icon: Navigation }],
  },
  {
    keywords: ["help", "support", "faq", "issue", "problem", "contact"],
    answer: "For platform questions, start with the FAQ. For account, registration, or technical problems, use Contact so the team has enough context to help.",
    actions: [
      { label: "FAQ",     to: "/faq",     icon: HelpCircle    },
      { label: "Contact", to: "/contact", icon: MessageCircle },
    ],
  },
];

function getAssistantReply(input) {
  const lower = input.toLowerCase();
  return (
    knowledgeBase.find((item) => item.keywords.some((kw) => lower.includes(kw))) ||
    { answer: "I can help with event registration, recommendations, hosting guidance, and platform support. Try asking about the event you want to attend or what kind of workshop you are looking for.", actions: [{ label: "Explore events", to: "/events", icon: CalendarDays }] }
  );
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = "eventra_chat_messages";

function loadMessages() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // Icons cannot be serialised — rehydrate them from knowledgeBase
      const parsed = JSON.parse(stored);
      return parsed.map((msg) => ({
        ...msg,
        actions: (msg.actions || []).map((a) => {
          const found = [...knowledgeBase.flatMap((k) => k.actions), ...INITIAL_MESSAGE.actions]
            .find((kb) => kb.to === a.to && kb.label === a.label);
          return found || a;
        }),
      }));
    }
  } catch { /* ignore quota / parse errors */ }
  return [INITIAL_MESSAGE];
}

function saveMessages(messages) {
  try {
    // Strip non-serialisable icon references before storing
    const serialisable = messages.map(({ actions, ...rest }) => ({
      ...rest,
      actions: (actions || []).map(({ icon: _icon, ...a }) => a),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialisable));
  } catch { /* ignore quota errors */ }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChatHeader({ onMinimize, onClose }) {
  return (
    <header className="flex flex-shrink-0 items-center justify-between gap-3 rounded-t-2xl border-b border-slate-200 bg-slate-950 px-4 py-3 text-white dark:border-slate-700">
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
        <button type="button" onClick={onMinimize} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Minimize assistant">
          <Minus className="h-4 w-4" />
        </button>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Close assistant">
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

function ChatMessages({ messages, messagesEndRef }) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" role="log" aria-live="polite" aria-label="Chat messages">
      {messages.map((msg, i) => (
        <div key={`${msg.role}-${i}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"}`}>
            {msg.content}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

function ChatFooter({ draft, setDraft, onSend, latestActions }) {
  return (
    <div className="flex-shrink-0 rounded-b-2xl border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 flex flex-wrap gap-2">
        {quickPrompts.map((p) => (
          <button key={p} type="button" onClick={() => onSend(p)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300">
            {p}
          </button>
        ))}
      </div>
      {latestActions.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {latestActions.map(({ label, to, icon: Icon }) => (
            <Link key={`${label}-${to}`} to={to} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700">
              <Icon className="h-3.5 w-3.5" />{label}
            </Link>
          ))}
        </div>
      )}
      <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); onSend(); }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask about Eventra..." aria-label="Message input" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        <button type="submit" disabled={!draft.trim()} aria-label="Send message" className="rounded-xl bg-indigo-600 p-2.5 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Chatbot() {
  const [isOpen,      setIsOpen]      = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [draft,       setDraft]       = useState("");
  const [messages,    setMessages]    = useState(loadMessages);

  const messagesEndRef = useRef(null);

  // Persist messages to localStorage whenever they change
  useEffect(() => { saveMessages(messages); }, [messages]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen && !isMinimized) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isMinimized]);

  const latestActions = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    return last?.actions || [];
  }, [messages]);

  const sendMessage = useCallback((text = draft) => {
    const clean = text.trim();
    if (!clean) return;
    const reply = getAssistantReply(clean);
    setMessages((prev) => [
      ...prev,
      { role: "user",      content: clean        },
      { role: "assistant", content: reply.answer, actions: reply.actions },
    ]);
    setDraft("");
  }, [draft]);

  const handleOpen     = () => { setIsOpen(true);  setIsMinimized(false); };
  const handleClose    = () => { setIsOpen(false); setIsMinimized(false); };
  const handleMinimize = () => setIsMinimized((v) => !v);

  if (!isOpen || isMinimized) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30 transition-transform duration-200 hover:scale-110 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
        aria-label="Open Eventra assistant"
      >
        <Bot className="h-6 w-6" />
      </button>
    );
  }

  return (
    <section
      data-chatbot-open
      aria-label="Eventra assistant"
      className="fixed bottom-6 right-6 z-50 flex max-h-[calc(100vh-5rem)] w-[calc(100vw-2rem)] max-w-sm flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
    >
      <ChatHeader onMinimize={handleMinimize} onClose={handleClose} />
      <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
      <ChatFooter draft={draft} setDraft={setDraft} onSend={sendMessage} latestActions={latestActions} />
    </section>
  );
}
