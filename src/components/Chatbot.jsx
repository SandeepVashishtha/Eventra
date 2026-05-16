import { useMemo, useState } from "react";
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
} from "lucide-react";

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

  return match || { answer: defaultAnswer, actions: [{ label: "Explore events", to: "/events", icon: CalendarDays }] };
}

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

  const latestActions = useMemo(() => {
    const latestAssistantMessage = [...messages].reverse().find((message) => message.role === "assistant");
    return latestAssistantMessage?.actions || [];
  }, [messages]);

  const sendMessage = (messageText = draft) => {
    const cleanMessage = messageText.trim();
    if (!cleanMessage) return;

    const reply = getAssistantReply(cleanMessage);
    setMessages((currentMessages) => [
      ...currentMessages,
      { role: "user", content: cleanMessage },
      { role: "assistant", content: reply.answer, actions: reply.actions },
    ]);
    setDraft("");
  };

  return (
    <>
      {/* Toggle button — always rendered so state is never destroyed */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          aria-label="Open Eventra assistant"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <section
          data-chatbot-open
          className={`fixed bottom-6 right-6 z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 ${
            isMinimized ? "h-16" : ""
          }`}
          aria-label="Eventra assistant"
        >
          <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-950 px-4 py-3 text-white dark:border-slate-700">
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
                onClick={() => setIsMinimized((value) => !value)}
                className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label={isMinimized ? "Expand assistant" : "Minimize assistant"}
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {!isMinimized && (
            <>
              <div className="max-h-80 space-y-3 overflow-y-auto px-4 py-4">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        message.role === "user"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-700">
                <div className="mb-3 flex flex-wrap gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {latestActions.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {latestActions.map(({ label, to, icon: Icon }) => (
                      <Link
                        key={`${label}-${to}`}
                        to={to}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </Link>
                    ))}
                  </div>
                )}

                <form
                  className="flex items-center gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendMessage();
                  }}
                >
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Ask about Eventra..."
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="rounded-xl bg-indigo-600 p-2.5 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
}
