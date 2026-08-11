import { useState } from 'react';

const QAPanel = ({ questions = [], onAskQuestion = () => {}, isLoading = false }) => {
  const [draftQuestion, setDraftQuestion] = useState('');

  const submitQuestion = (event) => {
    event.preventDefault();
    const trimmed = draftQuestion.trim();
    if (!trimmed) return;
    onAskQuestion(trimmed);
    setDraftQuestion('');
  };

  return (
    <section className="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
      <h2 className="text-lg font-semibold">Q&amp;A Panel</h2>
      <p className="mt-1 text-sm text-white/75">This feature is under development.</p>

      <form className="mt-4 flex gap-2" onSubmit={submitQuestion}>
        <input
          type="text"
          value={draftQuestion}
          onChange={(event) => setDraftQuestion(event.target.value)}
          placeholder="Ask a question"
          className="flex-1 rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading || !draftQuestion.trim()}
        >
          Submit
        </button>
      </form>

      <div className="mt-4 space-y-2">
        {questions.length === 0 ? (
          <p className="text-xs text-white/60">No questions yet.</p>
        ) : (
          questions.map((question) => (
            <div key={question.id ?? question.text} className="rounded-lg bg-black/20 px-3 py-2 text-sm">
              {question.text ?? String(question)}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default QAPanel;
