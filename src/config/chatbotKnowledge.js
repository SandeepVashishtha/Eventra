import {
  CalendarDays,
  HelpCircle,
  MessageCircle,
  Navigation,
  Ticket,
} from "lucide-react";

export const quickPrompts = [
  "How do I register for an event?",
  "Suggest an event for beginners",
  "How can I host a workshop?",
  "Where can I get platform help?",
];

export const knowledgeBase = [
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

export const defaultAnswer =
  "I can help with event registration, recommendations, hosting guidance, and platform support. Try asking about the event you want to attend or what kind of workshop you are looking for.";

export function getAssistantReply(input) {
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

export const INITIAL_MESSAGES = [
  {
    role: "assistant",
    content:
      "Hi, I am Eventra Assist. Ask me about events, workshops, registration, hosting, or platform help.",
    actions: [
      { label: "Events", to: "/events", icon: CalendarDays },
      { label: "FAQ", to: "/faq", icon: HelpCircle },
    ],
  },
];
