import React, { useState } from "react";
import { Vote, Plus, BarChart3 } from "lucide-react";
import PollVoteCard from "./PollVoteCard";
import "./live-poll.css";

export default function LivePollManager() {
  const [activePoll, setActivePoll] = useState({
    id: 1,
    question: "Which framework do you prefer for CSS in 2026?",
    options: [
      { id: "A", text: "Tailwind CSS v4", votes: 42 },
      { id: "B", text: "Vanilla CSS Styles", votes: 15 },
      { id: "C", text: "CSS Modules / Sass", votes: 8 }
    ]
  });

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const createPoll = (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const filteredOptions = options
      .filter((opt) => opt.trim() !== "")
      .map((opt, idx) => ({
        id: String.fromCharCode(65 + idx), // A, B, C...
        text: opt,
        votes: 0
      }));

    setActivePoll({
      id: Date.now(),
      question,
      options: filteredOptions
    });

    setQuestion("");
    setOptions(["", ""]);
  };

  const addOptionInput = () => {
    setOptions((prev) => [...prev, ""]);
  };

  const handleVoteSubmit = (optionId) => {
    setActivePoll((prev) => ({
      ...prev,
      options: prev.options.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      )
    }));
  };

  return (
    <div className="live-poll-manager p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl max-w-2xl mx-auto my-8">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <Vote className="text-indigo-600 dark:text-indigo-400 w-6 h-6" />
        <h2 className="text-xl font-bold text-slate-955 dark:text-white">Live Session Poll Manager</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Poll */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Create Live Poll</h3>
          <form onSubmit={createPoll} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Question/Topic"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm text-slate-800 dark:text-slate-100"
            />
            {options.map((opt, idx) => (
              <input
                key={idx}
                type="text"
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) =>
                  setOptions(
                    options.map((val, i) => (i === idx ? e.target.value : val))
                  )
                }
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-850 dark:text-slate-205"
              />
            ))}
            <div className="flex justify-between mt-2">
              <button
                type="button"
                onClick={addOptionInput}
                className="text-xs font-semibold text-indigo-650 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Choice
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Launch Poll
              </button>
            </div>
          </form>
        </div>

        {/* Analytics Display */}
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Active Poll Stats</h3>
            <PollVoteCard poll={activePoll} onVote={handleVoteSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
}
