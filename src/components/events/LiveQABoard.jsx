import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.js";
import useLiveAudience from "../../hooks/useLiveAudience.js";
import { ThumbsUp, Trash, Flag, Send, AlertTriangle, HelpCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

function formatTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Just now";
  }
}

function isMod(user) {
  return user?.role === "admin" || user?.role === "organizer" || user?.role === "developer";
}

function QuestionInputForm({ onSubmit, questionText, setQuestionText, submitting }) {
  return (
    <form onSubmit={onSubmit} className="relative flex flex-col gap-2">
      <textarea
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value.slice(0, 250))}
        placeholder="Ask a question..."
        rows={3}
        disabled={submitting}
        className="w-full px-4 py-3 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 resize-none"
      />
      <div className="flex justify-between items-center px-1">
        <span className="text-xs text-slate-500 font-medium">
          {questionText.length}/250 characters
        </span>
        <button
          type="submit"
          disabled={submitting || !questionText.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-950 bg-linear-to-r from-cyan-400 to-primary hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:brightness-100 transition-all duration-300 shadow-glow-sm cursor-pointer"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
          ) : (
            <Send className="h-4 w-4 text-slate-950" />
          )}
          <span>Send</span>
        </button>
      </div>
    </form>
  );
}

function ModeratorButtons({ q, onFlag, onDelete }) {
  return (
    <>
      {!q.flagged && (
        <button
          onClick={() => onFlag(q.id)}
          title="Flag inappropriate"
          className="p-1.5 rounded-lg border border-slate-800 hover:border-amber-500/30 hover:bg-amber-500/5 text-slate-500 hover:text-amber-400 transition-all duration-200 cursor-pointer"
        >
          <Flag className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={() => onDelete(q.id)}
        title="Delete question"
        className="p-1.5 rounded-lg border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/5 text-slate-500 hover:text-rose-400 transition-all duration-200 cursor-pointer"
      >
        <Trash className="h-4 w-4" />
      </button>
    </>
  );
}

function highlightKeywords(text) {
  const keywords = ['bug', 'feature', 'question', 'pricing', 'roadmap'];
  const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => 
    keywords.includes(part.toLowerCase()) 
      ? <span key={i} className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30 text-[10px] uppercase tracking-widest mx-0.5">{part}</span> 
      : part
  );
}

function QuestionCard({ q, isModerator, onUpvote, onFlag, onDelete }) {
  return (
    <div
      className={`flex justify-between items-start gap-4 p-4 rounded-xl bg-slate-950/20 border transition-all duration-300 hover:border-slate-700/60 ${
        q.flagged ? "border-rose-950 bg-rose-950/5" : "border-slate-800/80"
      }`}
    >
      <div className="flex flex-col gap-1.5 min-w-0">
        {q.flagged && (
          <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-3 w-3" /> Flagged for moderation
          </span>
        )}
        <p className="text-sm text-slate-200 break-words leading-relaxed font-sans">{isModerator ? highlightKeywords(q.text) : q.text}</p>
        <span className="text-[10px] text-slate-500 font-medium">{formatTime(q.createdAt)}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onUpvote(q.id)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 hover:bg-slate-800/30 text-slate-400 hover:text-primary transition-all duration-200 cursor-pointer"
        >
          <ThumbsUp className="h-4 w-4" />
          <span className="text-xs font-semibold">{q.upvotes}</span>
        </button>

        {isModerator && <ModeratorButtons q={q} onFlag={onFlag} onDelete={onDelete} />}
      </div>
    </div>
  );
}

function QuestionList({ loading, visibleQuestions, isModerator, handlers }) {
  if (loading && visibleQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm">Loading questions...</p>
      </div>
    );
  }

  if (visibleQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center border-2 border-dashed border-slate-800 rounded-xl">
        <HelpCircle className="h-10 w-10 text-slate-600 mb-2" />
        <p className="text-sm font-medium">No questions asked yet.</p>
        <p className="text-xs text-slate-600 mt-1">Be the first to ask a question!</p>
      </div>
    );
  }

  return visibleQuestions.map((q) => (
    <QuestionCard key={q.id} q={q} isModerator={isModerator} {...handlers} />
  ));
}

async function sendQuestion(submitQuestion, text, setSubmitting, setQuestionText) {
  setSubmitting(true);
  try {
    await submitQuestion(text);
    setQuestionText("");
    toast.success("Question submitted successfully!");
  } catch {
    toast.error("Failed to submit question. Please try again.");
  } finally {
    setSubmitting(false);
  }
}

async function sendUpvote(upvoteQuestion, qId) {
  try {
    await upvoteQuestion(qId);
  } catch {
    toast.error("Failed to upvote question.");
  }
}

async function sendFlag(flagQuestion, qId) {
  try {
    await flagQuestion(qId);
    toast.info("Question flagged for moderation.");
  } catch {
    toast.error("Failed to flag question.");
  }
}

async function sendDelete(deleteQuestion, qId) {
  if (!window.confirm("Are you sure you want to delete this question?")) return;
  try {
    await deleteQuestion(qId);
    toast.success("Question deleted successfully.");
  } catch {
    toast.error("Failed to delete question.");
  }
}

export default function LiveQABoard({ eventId }) {
  const { user } = useAuth();
  const { questions, status, loading, error, submitQuestion, upvoteQuestion, deleteQuestion, flagQuestion } =
    useLiveAudience(eventId);

  const [questionText, setQuestionText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const moderator = isMod(user);
  const visibleQuestions = questions.filter((q) => !q.flagged || moderator);

  const handleSend = (e) => {
    e.preventDefault();
    if (questionText.trim()) sendQuestion(submitQuestion, questionText, setSubmitting, setQuestionText);
  };

  const handlers = {
    onUpvote: (qId) => sendUpvote(upvoteQuestion, qId),
    onFlag: (qId) => sendFlag(flagQuestion, qId),
    onDelete: (qId) => sendDelete(deleteQuestion, qId),
  };

  return (
    <div className="w-full flex flex-col gap-6 p-6 rounded-2xl bg-slate-900/30 backdrop-blur-xl border border-slate-800 shadow-premium-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-slate-100 font-sans tracking-wide">Live Q&A Board</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Sync:</span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              status === "connected"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : status === "connecting" || status === "reconnecting"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>Error syncing Q&A updates: {error}</span>
        </div>
      )}

      <QuestionInputForm
        onSubmit={handleSend}
        questionText={questionText}
        setQuestionText={setQuestionText}
        submitting={submitting}
      />

      <div className="flex flex-col gap-3 max-h-100 overflow-y-auto pr-1">
        <QuestionList
          loading={loading}
          visibleQuestions={visibleQuestions}
          isModerator={moderator}
          handlers={handlers}
        />
      </div>
    </div>
  );
}
