export const knowledgeBaseConfig = [
  {
    keywords: ["register", "join", "ticket", "attend", "participate"],
    answerKey: "chatbot.knowledge.register.answer",
    actions: [
      { labelKey: "chatbot.knowledge.register.browseEvents", to: "/events", icon: "CalendarDays" },
    ],
  },
  {
    keywords: ["suggest", "recommend", "beginner", "interest", "location"],
    answerKey: "chatbot.knowledge.suggest.answer",
    actions: [
      { labelKey: "chatbot.actions.events", to: "/events", icon: "CalendarDays" },
      { labelKey: "chatbot.actions.hackathons", to: "/hackathons", icon: "Ticket" },
    ],
  },
  {
    keywords: ["host", "create", "organize", "workshop", "event"],
    answerKey: "chatbot.knowledge.host.answer",
    actions: [{ labelKey: "chatbot.actions.dashboard", to: "/dashboard", icon: "Navigation" }],
  },
  {
    keywords: ["help", "support", "faq", "issue", "problem", "contact"],
    answerKey: "chatbot.knowledge.help.answer",
    actions: [
      { labelKey: "chatbot.actions.faq", to: "/faq", icon: "HelpCircle" },
      { labelKey: "chatbot.actions.contact", to: "/contact", icon: "MessageCircle" },
    ],
  },
];

const keywordIndex = knowledgeBaseConfig.reduce((acc, item) => {
  item.keywords.forEach((kw) => {
    if (!acc.has(kw)) acc.set(kw, item);
  });
  return acc;
}, new Map());

const sortedKeywords = [...keywordIndex.keys()].sort((a, b) => b.length - a.length);

const keywordPattern = new RegExp(
  sortedKeywords.map((kw) => kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "i"
);

export function getQuickPromptKeys() {
  return [
    "chatbot.prompts.register",
    "chatbot.prompts.suggest",
    "chatbot.prompts.host",
    "chatbot.prompts.help",
  ];
}

export function getQuickPrompts(t) {
  return getQuickPromptKeys().map((key) => t(key));
}

export function getInitialMessages(t) {
  return [
    {
      role: "assistant",
      content: t("chatbot.welcome"),
      actions: [
        { label: t("chatbot.actions.events"), to: "/events", icon: "CalendarDays" },
        { label: t("chatbot.actions.faq"), to: "/faq", icon: "HelpCircle" },
      ],
    },
  ];
}

export function getAssistantReply(input, t) {
  const match = input.match(keywordPattern);
  const matchedKeyword = match ? match[0].toLowerCase() : null;
  const matchedItem = matchedKeyword ? keywordIndex.get(matchedKeyword) : null;

  if (matchedItem) {
    return {
      answer: t(matchedItem.answerKey),
      actions: matchedItem.actions.map((action) => ({
        label: t(action.labelKey),
        to: action.to,
        icon: action.icon,
      })),
    };
  }

  return {
    answer: t("chatbot.knowledge.default"),
    actions: [{ label: t("chatbot.knowledge.exploreEvents"), to: "/events", icon: "CalendarDays" }],
  };
}

// Backward-compatible exports for tests or legacy imports
export const quickPrompts = getQuickPromptKeys();
export const knowledgeBase = knowledgeBaseConfig;
export const defaultAnswer = "chatbot.knowledge.default";
export const INITIAL_MESSAGES = [];
