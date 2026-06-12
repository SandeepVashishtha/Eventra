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
    <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-700 shadow-xl max-w-lg w-full">
      <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
          Live Q&A
        </h3>
        <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">124 watching</span>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto mb-6 pr-2">
        {questions.map(q => (
          <div key={q.id} className={`p-4 rounded-lg border ${q.answered ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-slate-700 bg-slate-800'}`}>
            <div className="flex justify-between items-start gap-4">
              <p className="text-sm flex-1">{q.text}</p>
              <button 
                onClick={() => upvote(q.id)}
                className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-400 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                </svg>
                <span className="text-xs font-bold">{q.upvotes}</span>
              </button>
            </div>
            {q.answered && (
              <div className="mt-3 text-xs text-emerald-400 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-blue-500"
        />
        <button 
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400 p-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default LiveQA;
