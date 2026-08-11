import React from "react";
import { ThumbsUp, Pin, CheckCircle2, MessageSquare } from "lucide-react";

export default function QuestionUpvoteCard({
  question,
  onUpvote = () => {},
  onPin = () => {},
  onMarkAnswered = () => {},
  isModerator = false,
}) {
  if (!question) return null;

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        question.isPinned
          ? "bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-md"
          : question.isAnswered
          ? "bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 opacity-60"
          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-gray-900 dark:text-white">
              {question.authorName || "Anonymous Attendee"}
            </span>
            {question.isPinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                <Pin className="w-3 h-3 fill-current" /> Pinned
              </span>
            )}
            {question.isAnswered && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-3 h-3" /> Answered
              </span>
            )}
          </div>

          <p className="text-xs text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
            {question.questionText}
          </p>
        </div>

        {/* Upvote Button */}
        <button
          type="button"
          onClick={() => onUpvote(question.id)}
          className="flex flex-col items-center justify-center p-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-all min-w-[48px]"
        >
          <ThumbsUp className="w-4 h-4 fill-current" />
          <span className="font-mono text-xs font-bold mt-0.5">{question.upvotes}</span>
        </button>
      </div>

      {/* Moderator Actions */}
      {isModerator && !question.isAnswered && (
        <div className="flex items-center gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-800 text-[11px]">
          <button
            onClick={() => onPin(question.id)}
            className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
          >
            {question.isPinned ? "Unpin Question" : "Pin Question"}
          </button>
          <span>•</span>
          <button
            onClick={() => onMarkAnswered(question.id)}
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
          >
            Mark as Answered
          </button>
        </div>
      )}
    </div>
  );
}
