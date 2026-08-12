import React, { useState } from "react";
import { EyeOff, Award, CheckCircle, X, Send } from "lucide-react";

export default function JudgeScorecardModal({
  submission = {
    id: "sub-101",
    projectTitle: "AI-Powered Eventra Ecosystem",
    teamName: "Cipher Squad",
    members: ["Alex Rivera", "Sarah Chen"],
  },
  isBlindReview = true,
  isOpen = false,
  onClose = () => {},
  onSubmitScores = () => {},
}) {
  const [scores, setScores] = useState({
    innovation: 85,
    technical: 90,
    uiux: 80,
    pitch: 75,
  });
  const [feedback, setFeedback] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitScores({
      submissionId: submission.id,
      scores,
      feedback,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-gray-900 dark:text-white select-none">
      <div className="relative w-full max-w-lg rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-base">Judge Evaluation Scorecard</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Blind Review Mask Banner */}
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
            {isBlindReview ? <EyeOff className="w-4 h-4 text-indigo-500" /> : <Award className="w-4 h-4 text-indigo-500" />}
            {submission.projectTitle}
          </div>
          <p className="text-gray-500">
            {isBlindReview ? "Blind Review Mode: Team identities & university affiliations masked to prevent bias." : `Team: ${submission.teamName}`}
          </p>
        </div>

        {/* Scoring Categories Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {Object.entries({
            innovation: "Innovation & Originality (30%)",
            technical: "Technical Depth & Architecture (40%)",
            uiux: "UI/UX & User Experience (20%)",
            pitch: "Presentation & Video Pitch (10%)",
          }).map(([key, label]) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>{label}</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{scores[key]} / 100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={scores[key]}
                onChange={(e) => setScores({ ...scores, [key]: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          ))}

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Judge Constructive Feedback
            </label>
            <textarea
              rows="3"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide technical feedback for project creators..."
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-all"
          >
            <Send className="w-4 h-4" /> Submit Blind Scorecard
          </button>
        </form>
      </div>
    </div>
  );
}
