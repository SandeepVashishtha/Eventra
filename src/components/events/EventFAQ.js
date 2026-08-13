import { useMemo, useState } from "react";
import {
  HelpCircle,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import FAQItem from "./FAQItem";
import {
  DEFAULT_FAQS,
  addFAQ,
  deleteFAQ,
  searchFAQs,
} from "../../utils/eventFAQUtils";

const EventFAQ = ({
  faqs = DEFAULT_FAQS,
  isOrganizer = false,
  onFAQsChange,
}) => {
  const [faqList, setFaqList] = useState(faqs);
  const [searchTerm, setSearchTerm] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [showForm, setShowForm] = useState(false);

  const filteredFAQs = useMemo(
    () =>
      searchFAQs(
        faqList,
        searchTerm
      ),
    [faqList, searchTerm]
  );

  const updateFAQs = (updatedFAQs) => {
    setFaqList(updatedFAQs);
    onFAQsChange?.(updatedFAQs);
  };

  const handleAddFAQ = (event) => {
    event.preventDefault();

    if (
      !question.trim() ||
      !answer.trim()
    ) {
      return;
    }

    const updatedFAQs = addFAQ(
      faqList,
      question,
      answer
    );

    updateFAQs(updatedFAQs);

    setQuestion("");
    setAnswer("");
    setShowForm(false);
  };

  const handleDeleteFAQ = (faqId) => {
    const updatedFAQs = deleteFAQ(
      faqList,
      faqId
    );

    updateFAQs(updatedFAQs);
  };

  return (
    <section className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <HelpCircle
              size={23}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Frequently Asked Questions
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Find answers to common questions about this event.
            </p>
          </div>
        </div>

        {/* Organizer action */}
        {isOrganizer && (
          <button
            type="button"
            onClick={() =>
              setShowForm((previous) => !previous)
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus size={17} />
            Add FAQ
          </button>
        )}
      </div>

      {/* Add FAQ form */}
      {isOrganizer && showForm && (
        <form
          onSubmit={handleAddFAQ}
          className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900/40 dark:bg-indigo-900/10"
        >
          <h3 className="mb-4 font-semibold text-slate-800 dark:text-white">
            Add Frequently Asked Question
          </h3>

          <div className="space-y-4">
            <input
              type="text"
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              placeholder="Enter question"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            <textarea
              value={answer}
              onChange={(event) =>
                setAnswer(event.target.value)
              }
              placeholder="Enter answer"
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Save FAQ
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Search */}
      {faqList.length > 0 && (
        <div className="relative mt-6">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search FAQs..."
            aria-label="Search frequently asked questions"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      )}

      {/* FAQ list */}
      <div className="mt-6 space-y-3">
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((faq) => (
            <div
              key={faq.id}
              className="flex items-start gap-2"
            >
              <div className="min-w-0 flex-1">
                <FAQItem faq={faq} />
              </div>

              {isOrganizer && (
                <button
                  type="button"
                  onClick={() =>
                    handleDeleteFAQ(faq.id)
                  }
                  aria-label={`Delete FAQ: ${faq.question}`}
                  className="mt-2 rounded-lg p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={17} />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center dark:border-slate-700">
            <HelpCircle
              size={38}
              className="mx-auto mb-3 text-slate-400"
            />

            <h3 className="font-semibold text-slate-700 dark:text-white">
              No FAQs found
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Try a different search term.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventFAQ;