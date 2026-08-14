import React, { useState } from "react";
import { HelpCircle, Trophy } from "lucide-react";
import QuestionCard from "./QuestionCard";
import "./quiz.css";

export default function TeamQuizBoard() {
  const [activeQuestion, setActiveQuestion] = useState({
    id: 1,
    question: "What is the time complexity of lookup operations in a HashMap?",
    options: ["O(1) average", "O(n)", "O(log n)", "O(n log n)"],
    answerIndex: 0
  });

  const [score, setScore] = useState(0);

  const handleOptionSelect = (idx) => {
    if (idx === activeQuestion.answerIndex) {
      alert("Correct answer! You earned +10 points.");
      setScore((prev) => prev + 10);
    } else {
      alert("Incorrect answer. Better luck next time!");
    }
  };

  return (
    <div className="quiz-board p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm max-w-xl mx-auto my-8">
      <div className="flex justify-between items-center mb-6 border-b border-slate-250 dark:border-slate-800 pb-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <HelpCircle className="text-indigo-650 dark:text-indigo-400 w-5 h-5" />
          Hacker Trivia Challenge
        </h3>
        <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 px-3 py-1 rounded-xl font-black text-xs">
          <Trophy className="w-3.5 h-3.5" /> {score} Pts
        </div>
      </div>

      <QuestionCard question={activeQuestion} onSelect={handleOptionSelect} />
    </div>
  );
}
