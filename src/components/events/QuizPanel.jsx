import { useMemo, useState } from "react";
import { Award, CheckCircle2, Circle } from "lucide-react";

const QuizPanel = ({ quiz, onComplete }) => {
  const questions = quiz?.questions ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  const progress = useMemo(() => {
    if (questions.length === 0) {
      return 0;
    }

    return Math.round((currentIndex / questions.length) * 100);
  }, [currentIndex, questions.length]);

  if (!currentQuestion) {
    return null;
  }

  const handleAnswer = (optionId) => {
    if (selectedOptionId) {
      return;
    }

    setSelectedOptionId(optionId);

    const isCorrect = optionId === currentQuestion.correctOptionId;
    const nextScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      setScore(nextScore);
    }

    window.setTimeout(() => {
      const nextIndex = currentIndex + 1;
      setSelectedOptionId(null);

      if (nextIndex < questions.length) {
        setCurrentIndex(nextIndex);
        return;
      }

      setFinished(true);
      onComplete?.({
        score: nextScore,
        totalQuestions: questions.length,
      });
    }, 700);
  };

  if (finished) {
    return (
      <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
            <Award className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Quiz complete</h3>
            <p className="text-sm text-slate-300">You scored {score} out of {questions.length}.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-white shadow-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
          <Award className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Live Quiz</h3>
          <p className="text-sm text-slate-300">Keep attendees engaged with quick interactive questions.</p>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-base font-medium text-white">{currentQuestion.text}</p>
      </div>

      <div className="space-y-3">
        {currentQuestion.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isCorrect = option.id === currentQuestion.correctOptionId;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleAnswer(option.id)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                isSelected
                  ? isCorrect
                    ? "border-emerald-400/60 bg-emerald-500/10"
                    : "border-rose-400/60 bg-rose-500/10"
                  : "border-white/10 bg-white/5 hover:border-amber-400/60 hover:bg-amber-500/10"
              }`}
            >
              {isSelected ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              )}
              <span className="text-sm font-medium text-white">{option.text}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default QuizPanel;