import React from "react";
import { Mic, CheckCircle2, ThumbsUp, X } from "lucide-react";

export default function PresenterStageView({
  questions = [],
  onMarkAnswered = () => {},
  onClose = () => {},
}) {
  const topQuestion = questions.find((q) => !q.isAnswered);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md animate-fade-in text-white">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Mic className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Presenter Stage View</h2>
              <p className="text-xs text-slate-400">Live Top-Voted Audience Questions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Active Top Question */}
        {topQuestion ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-2xl space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 text-xs font-semibold border border-indigo-800">
              <ThumbsUp className="w-3.5 h-3.5" /> {topQuestion.upvotes} Upvotes • Asked by {topQuestion.authorName}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-relaxed">
              "{topQuestion.questionText}"
            </h1>

            <button
              onClick={() => onMarkAnswered(topQuestion.id)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg transition-all"
            >
              <CheckCircle2 className="w-5 h-5" /> Mark Question Answered
            </button>
          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 font-medium">
            No unanswered questions remaining in queue.
          </div>
        )}
      </div>
    </div>
  );
}
