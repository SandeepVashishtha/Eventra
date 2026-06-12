import { useMemo, useState } from "react";

const QuizPanel = ({ quiz, onComplete = () => {}, isSubmitting = false }) => {
  const firstQuestion = useMemo(() => quiz?.questions?.[0] ?? null, [quiz]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  const submitAnswer = () => {
    if (!firstQuestion || !selectedOptionId) return;

    const isCorrect = selectedOptionId === firstQuestion.correctOptionId;
    onComplete({
      questionId: firstQuestion.id,
      selectedOptionId,
      isCorrect,
    });
  };

  return (
    <section className="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
      <h2 className="text-lg font-semibold">Quiz Panel</h2>
      <p className="mt-1 text-sm text-white/75">This feature is under development.</p>

      {!firstQuestion ? (
        <p className="mt-4 text-xs text-white/60">No quiz data available.</p>
      ) : (
        <div className="mt-4">
          <p className="text-sm font-medium">{firstQuestion.text}</p>
          <div className="mt-3 grid gap-2">
            {firstQuestion.options?.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedOptionId(option.id)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                  selectedOptionId === option.id
                    ? "border-indigo-400 bg-indigo-600/30"
                    : "border-white/20 bg-black/20 hover:bg-black/30"
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={submitAnswer}
            disabled={!selectedOptionId || isSubmitting}
            className="mt-4 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Submit Answer
          </button>
        </div>
      )}
    </section>
  );
};

export default QuizPanel;
