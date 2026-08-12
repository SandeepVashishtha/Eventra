import React, { useState } from "react";
import { MessageSquare, Send, Radio, Tv } from "lucide-react";
import QuestionUpvoteCard from "./QuestionUpvoteCard";
import PresenterStageView from "./PresenterStageView";
import LiveAudiencePoll from "./LiveAudiencePoll";

const INITIAL_QUESTIONS = [
  {
    id: "q-101",
    sessionId: "keynote-1",
    authorName: "Alex Rivera",
    questionText: "Will the new WebRTC P2P features support STUN/TURN server fallbacks for corporate firewalls?",
    upvotes: 28,
    isPinned: true,
    isAnswered: false,
  },
  {
    id: "q-102",
    sessionId: "keynote-1",
    authorName: "Sarah Chen",
    questionText: "How does the ZKP anonymous feedback portal handle nullifier hashes without server logging?",
    upvotes: 19,
    isPinned: false,
    isAnswered: false,
  },
];

export default function LiveQAFeed({ sessionId = "keynote-1", isModerator = false }) {
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [newQuestion, setNewQuestion] = useState("");
  const [showStageView, setShowStageView] = useState(false);

  const handleUpvote = (id) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q))
    );
  };

  const handlePin = (id) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isPinned: !q.isPinned } : q))
    );
  };

  const handleMarkAnswered = (id) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isAnswered: true } : q))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const newItem = {
      id: `q-${Date.now()}`,
      sessionId,
      authorName: "You",
      questionText: newQuestion.trim(),
      upvotes: 1,
      isPinned: false,
      isAnswered: false,
    };

    setQuestions((prev) => [newItem, ...prev]);
    setNewQuestion("");
  };

  const sortedQuestions = [...questions].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return b.upvotes - a.upvotes;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Poll Component */}
      <LiveAudiencePoll />

      {/* Q&A Section Container */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Live Audience Q&A Feed
            </h2>
          </div>

          <button
            onClick={() => setShowStageView(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm"
          >
            <Tv className="w-4 h-4 text-indigo-400" /> Presenter Stage Mode
          </button>
        </div>

        {/* Question Submission Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a question for the keynote speaker..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!newQuestion.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Ask
          </button>
        </form>

        {/* Questions List */}
        <div className="space-y-3 pt-2">
          {sortedQuestions.map((q) => (
            <QuestionUpvoteCard
              key={q.id}
              question={q}
              onUpvote={handleUpvote}
              onPin={handlePin}
              onMarkAnswered={handleMarkAnswered}
              isModerator={isModerator}
            />
          ))}
        </div>
      </div>

      {/* Stage View Overlay Modal */}
      {showStageView && (
        <PresenterStageView
          questions={sortedQuestions}
          onMarkAnswered={handleMarkAnswered}
          onClose={() => setShowStageView(false)}
        />
      )}
    </div>
  );
}
