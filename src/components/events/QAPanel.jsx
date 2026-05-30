import { useState } from "react";
import { MessageSquare, Send, ThumbsUp } from "lucide-react";

const defaultQuestions = [
  {
    id: 1,
    author: "Eventra Host",
    text: "What topic would you like the speaker to cover next?",
    upvotes: 12,
  },
  {
    id: 2,
    author: "Community",
    text: "Can the team share the submission deadline again?",
    upvotes: 8,
  },
];

const QAPanel = ({ questions = defaultQuestions, onSubmitQuestion }) => {
  const [draft, setDraft] = useState("");
  const activeQuestions = questions.length > 0 ? questions : defaultQuestions;

  const handleSubmit = () => {
    const nextQuestion = draft.trim();
    if (!nextQuestion) {
      return;
    }

    onSubmitQuestion?.(nextQuestion);
    setDraft("");
  };

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-white shadow-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
          <MessageSquare className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Q&A</h3>
          <p className="text-sm text-slate-300">Capture live questions from attendees and surface the most popular ones.</p>
        </div>
      </div>

      <div className="space-y-3">
        {activeQuestions.map((question) => (
          <article
            key={question.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">{question.text}</p>
                <p className="mt-1 text-xs text-slate-400">Asked by {question.author}</p>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
                {question.upvotes ?? 0}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-4">
        <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="qa-question-input">
          Ask a question
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="qa-question-input"
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a question for the speaker"
            className="min-h-11 flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Submit
          </button>
        </div>
      </div>
    </section>
  );
};

export default QAPanel;