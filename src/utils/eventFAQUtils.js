export const DEFAULT_FAQS = [
  {
    id: "faq-eligibility",
    question: "Who can participate?",
    answer:
      "Check the event eligibility requirements provided by the organizer.",
  },
  {
    id: "faq-registration-fee",
    question: "Is registration free?",
    answer:
      "Registration fees depend on the event. Please check the event details for pricing information.",
  },
  {
    id: "faq-individual",
    question: "Can I participate individually?",
    answer:
      "Individual participation depends on the event rules. Check the participation requirements before registering.",
  },
  {
    id: "faq-certificates",
    question: "Are certificates provided?",
    answer:
      "Certificate availability depends on the event. Organizers can specify certificate eligibility in the event details.",
  },
  {
    id: "faq-bring",
    question: "What should participants bring?",
    answer:
      "Participants should bring any materials, identification, or equipment specified by the event organizer.",
  },
];

/**
 * Create a unique FAQ ID.
 */
export const createFAQId = () => {
  return `faq-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};

/**
 * Validate an FAQ item.
 */
export const isValidFAQ = (faq) => {
  return Boolean(
    faq &&
      typeof faq.question === "string" &&
      faq.question.trim() &&
      typeof faq.answer === "string" &&
      faq.answer.trim()
  );
};

/**
 * Add a new FAQ item.
 */
export const addFAQ = (
  faqs = [],
  question,
  answer
) => {
  const newFAQ = {
    id: createFAQId(),
    question: question?.trim() || "",
    answer: answer?.trim() || "",
  };

  if (!isValidFAQ(newFAQ)) {
    return faqs;
  }

  return [...faqs, newFAQ];
};

/**
 * Update an existing FAQ item.
 */
export const updateFAQ = (
  faqs = [],
  faqId,
  updates = {}
) => {
  return faqs.map((faq) => {
    if (faq.id !== faqId) {
      return faq;
    }

    return {
      ...faq,
      ...updates,
      question:
        typeof updates.question === "string"
          ? updates.question.trim()
          : faq.question,
      answer:
        typeof updates.answer === "string"
          ? updates.answer.trim()
          : faq.answer,
    };
  });
};

/**
 * Delete an FAQ item.
 */
export const deleteFAQ = (
  faqs = [],
  faqId
) => {
  return faqs.filter(
    (faq) => faq.id !== faqId
  );
};

/**
 * Search FAQs by question or answer.
 */
export const searchFAQs = (
  faqs = [],
  searchTerm = ""
) => {
  const term = searchTerm
    .trim()
    .toLowerCase();

  if (!term) {
    return faqs;
  }

  return faqs.filter((faq) => {
    const question =
      faq.question?.toLowerCase() || "";

    const answer =
      faq.answer?.toLowerCase() || "";

    return (
      question.includes(term) ||
      answer.includes(term)
    );
  });
};

/**
 * Validate all FAQ items.
 */
export const validateFAQs = (faqs = []) => {
  return Array.isArray(faqs)
    ? faqs.filter(isValidFAQ)
    : [];
};

/**
 * Normalize FAQ data.
 */
export const normalizeFAQs = (
  faqs = []
) => {
  return validateFAQs(faqs).map(
    (faq, index) => ({
      id:
        faq.id ||
        `faq-${index + 1}`,
      question: faq.question.trim(),
      answer: faq.answer.trim(),
    })
  );
};

/**
 * Reorder FAQ items.
 */
export const reorderFAQs = (
  faqs = [],
  fromIndex,
  toIndex
) => {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= faqs.length ||
    toIndex >= faqs.length
  ) {
    return faqs;
  }

  const updatedFAQs = [...faqs];
  const [movedFAQ] =
    updatedFAQs.splice(fromIndex, 1);

  updatedFAQs.splice(
    toIndex,
    0,
    movedFAQ
  );

  return updatedFAQs;
};