import React, { useState } from 'react';

const LiveQA = () => {
  const [questions, setQuestions] = useState([
    { id: 1, text: "Will the recording be shared later?", upvotes: 14, answered: true },
    { id: 2, text: "Is there a certificate for participation?", upvotes: 8, answered: false },
  ]);
  const [newQuestion, setNewQuestion] = useState("");

  const submitQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    
    setQuestions([
      ...questions, 
      { id: Date.now(), text: newQuestion, upvotes: 0, answered: false }
    ]);
    setNewQuestion("");
  };

  const upvote = (id) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q
    ).sort((a, b) => b.upvotes - a.upvotes));
  };

  return (
    <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 text-white shadow-xl">
      <div className="mb-6 flex items-center justify-between border-b border-slate-700 pb-4">
        <h3 className="flex items-center gap-2 text-xl font-bold">
          <span className="h-3 w-3 animate-pulse rounded-full bg-red-500"></span>
          Live Q&A
        </h3>
        <span className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-400">124 watching</span>
      </div>

      <div className="mb-6 max-h-96 space-y-4 overflow-y-auto pr-2">
        {questions.map(q => (
          <div key={q.id} className={`p-4 rounded-lg border ${q.answered ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-slate-700 bg-slate-800'}`}>
            <div className="flex items-start justify-between gap-4">
              <p className="flex-1 text-sm">{q.text}</p>
              <button 
                onClick={() => upvote(q.id)}
                className="flex flex-col items-center gap-1 text-slate-400 transition hover:text-blue-400"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                </svg>
                <span className="text-xs font-bold">{q.upvotes}</span>
              </button>
            </div>
            {q.answered && (
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Answered Live
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={submitQuestion} className="relative">
        <input 
          type="text" 
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pr-12 pl-4 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button 
          type="submit"
          className="absolute top-1/2 right-2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-400"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default LiveQA;
