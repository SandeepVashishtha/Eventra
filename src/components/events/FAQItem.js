import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQItem = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!faq) return null;

  const question = faq.question || "Question";
  const answer = faq.answer || "No answer available.";

  const handleToggle = () => {
    setIsOpen((previous) => !previous);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${faq.id}`}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:hover:bg-slate-800"
      >
        <span className="flex min-w-0 items-center gap-3">
          <HelpCircle
            size={19}
            className="shrink-0 text-indigo-600 dark:text-indigo-400"
          />

          <span className="font-semibold text-slate-800 dark:text-white">
            {question}
          </span>
        </span>

        <ChevronDown
          size={20}
          className={`shrink-0 text-slate-500 transition-transform duration-200 dark:text-slate-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        id={`faq-answer-${faq.id}`}
        hidden={!isOpen}
      >
        <div className="border-t border-slate-200 px-5 py-4 dark:border-slate-700">
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQItem;