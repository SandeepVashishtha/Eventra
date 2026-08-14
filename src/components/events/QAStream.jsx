import React, { useState, useEffect } from "react";
import { MessageSquare, MessageCircle, ArrowUpCircle } from "lucide-react";
import QAStreamCard from "./QAStreamCard";
import "./qa-stream.css";

export default function QAStream({ eventId = "talk-1" }) {
  const [questions, setQuestions] = useState([
    { id: 1, text: "Can we use Tailwind v4 in production yet?", upvotes: 12, user: "Alice", isAnonymous: false },
    { id: 2, text: "What is the memory footprint of the ZKP verification logic?", upvotes: 8, user: "Bob", isAnonymous: false }
  ]);
  const [newQuestion, setNewQuestion] = useState("");
  const [isAnon, setIsAnon] = useState(false);

  const addQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const questionObj = {
      id: Date.now(),
      text: newQuestion,
      upvotes: 0,
      user: isAnon ? "Anonymous" : "User-" + Math.floor(Math.random() * 100),
      isAnonymous: isAnon
    };

    setQuestions((prev) => [...prev, questionObj]);
    setNewQuestion("");
  };

  const handleUpvote = (id) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q))
    );
  };

  const sortedQuestions = [...questions].sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div className="qa-stream-container p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg max-w-2xl mx-auto my-8">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <MessageSquare className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">Q&A Session Streams</h2>
      </div>

      <form onSubmit={addQuestion} className="mb-6 flex flex-col gap-3">
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Ask a question..."
          rows={3}
          className="w-full p-3 border border-slate-355 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-slate-850 dark:text-slate-100"
        />
        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnon}
              onChange={(e) => setIsAnon(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            Ask anonymously
          </label>
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4" /> Send Question
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-4">
        {sortedQuestions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No questions asked yet. Be the first!</div>
        ) : (
          sortedQuestions.map((q) => (
            <QAStreamCard key={q.id} question={q} onUpvote={() => handleUpvote(q.id)} />
          ))
        )}
      </div>
    </div>
  );
}
