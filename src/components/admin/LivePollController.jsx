import { useState, useEffect } from "react";
import { useAuth } from "context/AuthContext.js";
import useLiveAudience from "hooks/useLiveAudience.js";
import { BarChart3, Plus, Pause, Play, XCircle, Vote, Check, Loader2, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isMod(user) {
  return user?.role === "admin" || user?.role === "organizer" || user?.role === "developer";
}

function getVotedPolls(eventId) {
  return JSON.parse(localStorage.getItem(`voted_polls_${eventId}`) || "[]");
}

function saveVotedPoll(eventId, pollId) {
  const voted = getVotedPolls(eventId);
  voted.push(pollId);
  localStorage.setItem(`voted_polls_${eventId}`, JSON.stringify(voted));
}

function pollStatusLabel(activePoll, hasVoted) {
  if (activePoll.status === "closed") return "Voting Closed";
  if (activePoll.status === "paused") return "Voting Paused";
  if (hasVoted) return "Thank you for voting!";
  return "";
}

// ─── Shared results display ───────────────────────────────────────────────────
function PollResultsList({ activePoll, totalVotes }) {
  return (
    <div className="flex flex-col gap-4">
      {activePoll.options.map((opt) => {
        const votes = activePoll.results[opt] || 0;
        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
        return (
          <div key={opt} className="flex flex-col gap-1">
            <div className="flex justify-between text-sm font-sans font-medium text-slate-300">
              <span>{opt}</span>
              <span>{votes} votes ({percentage}%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-950/60 overflow-hidden border border-slate-900">
              <div
                style={{ width: `${percentage}%` }}
                className="h-full rounded-full bg-linear-to-r from-cyan-500 to-primary transition-all duration-1000 ease-out"
              />
            </div>
          </div>
        );
      })}
      <div className="text-xs text-slate-500 font-medium text-right mt-1">
        Total Votes: {totalVotes}
      </div>
    </div>
  );
}

// ─── Moderator: status controls ───────────────────────────────────────────────
function PollStatusButtons({ activePoll, handleStatusChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {activePoll.status === "active" && (
        <button
          onClick={() => handleStatusChange("paused")}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-slate-800 hover:border-amber-500/40 hover:bg-amber-500/5 hover:text-amber-400 transition-all duration-300 cursor-pointer"
        >
          <Pause className="h-4 w-4" /><span>Pause Voting</span>
        </button>
      )}
      {activePoll.status === "paused" && (
        <button
          onClick={() => handleStatusChange("active")}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-slate-800 hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-emerald-400 transition-all duration-300 cursor-pointer"
        >
          <Play className="h-4 w-4" /><span>Resume Voting</span>
        </button>
      )}
      {activePoll.status !== "closed" && (
        <button
          onClick={() => handleStatusChange("closed")}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-slate-800 hover:border-rose-500/40 hover:bg-rose-500/5 hover:text-rose-400 transition-all duration-300 cursor-pointer"
        >
          <XCircle className="h-4 w-4" /><span>Close Poll</span>
        </button>
      )}
      <button
        onClick={() => handleStatusChange("closed")}
        className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-linear-to-r from-cyan-400 to-primary hover:brightness-110 active:scale-95 transition-all duration-300 shadow-glow-sm cursor-pointer"
      >
        <RefreshCw className="h-4 w-4 text-slate-950" /><span>Create New Poll</span>
      </button>
    </div>
  );
}

// ─── Moderator: create form ───────────────────────────────────────────────────
function PollCreateForm({ newQuestion, setNewQuestion, options, handlers, submitting }) {
  return (
    <form onSubmit={handlers.launch} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Poll Question</label>
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="What is your question?"
          className="w-full px-4 py-3 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Options</label>
        <div className="flex flex-col gap-2">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => handlers.optionChange(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                className="grow px-4 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => handlers.removeOption(idx)}
                className="p-2.5 rounded-xl border border-slate-800 hover:border-rose-500/40 hover:text-rose-400 transition-all duration-300 cursor-pointer text-slate-500"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handlers.addOption}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover hover:underline w-fit mt-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" /><span>Add Option</span>
        </button>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold text-slate-950 bg-linear-to-r from-cyan-400 to-primary hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all duration-300 shadow-glow-sm cursor-pointer"
      >
        {submitting ? <Loader2 className="h-5 w-5 animate-spin text-slate-950" /> : <Play className="h-4 w-4 text-slate-950" />}
        <span>Launch Poll</span>
      </button>
    </form>
  );
}

// ─── Moderator panel ──────────────────────────────────────────────────────────
function PollModeratorPanel({ activePoll, totalVotes, pollState, handlers }) {
  if (activePoll) {
    return (
      <div className="flex flex-col gap-6">
        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
          <h3 className="text-base font-bold text-slate-200 mb-4 font-sans leading-snug">
            Q: {activePoll.question}
          </h3>
          <PollResultsList activePoll={activePoll} totalVotes={totalVotes} />
        </div>
        <PollStatusButtons activePoll={activePoll} handleStatusChange={handlers.statusChange} />
      </div>
    );
  }

  return (
    <PollCreateForm
      newQuestion={pollState.newQuestion}
      setNewQuestion={pollState.setNewQuestion}
      options={pollState.options}
      handlers={handlers}
      submitting={pollState.submitting}
    />
  );
}

// ─── Attendee view ────────────────────────────────────────────────────────────
function PollVotingForm({ activePoll, selectedOption, setSelectedOption }) {
  return (
    <form className="flex flex-col gap-4">
      <h3 className="text-base font-bold text-slate-200 mb-2 leading-snug">Q: {activePoll.question}</h3>
      <div className="flex flex-col gap-2">
        {activePoll.options.map((opt) => (
          <label
            key={opt}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 cursor-pointer ${
              selectedOption === opt
                ? "border-primary bg-primary/5 text-primary-hover font-semibold"
                : "border-slate-850 bg-slate-950/20 hover:border-slate-700 text-slate-300"
            }`}
          >
            <input
              type="radio"
              name="poll-option"
              value={opt}
              checked={selectedOption === opt}
              onChange={() => setSelectedOption(opt)}
              className="accent-primary h-4 w-4 cursor-pointer"
            />
            <span className="text-sm">{opt}</span>
          </label>
        ))}
      </div>
    </form>
  );
}

function PollAttendeeView({ activePoll, hasVoted, selectedOption, setSelectedOption, handleVoteSubmit, votingLoading, totalVotes }) {
  if (!activePoll) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/70 mb-3" />
        <p className="text-sm font-medium">Waiting for the presenter to launch a poll...</p>
      </div>
    );
  }

  if (hasVoted || activePoll.status !== "active") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center bg-slate-950/30 border border-slate-800/80 px-4 py-3 rounded-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {pollStatusLabel(activePoll, hasVoted)}
          </span>
          {hasVoted && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <Check className="h-3.5 w-3.5" /> Voted
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-slate-200 mb-2 leading-snug">Q: {activePoll.question}</h3>
        <PollResultsList activePoll={activePoll} totalVotes={totalVotes} />
      </div>
    );
  }

  return (
    <form onSubmit={handleVoteSubmit} className="flex flex-col gap-4">
      <PollVotingForm
        activePoll={activePoll}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        votingLoading={votingLoading}
      />
      <button
        type="submit"
        disabled={votingLoading || !selectedOption}
        className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold text-slate-950 bg-linear-to-r from-cyan-400 to-primary hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:brightness-100 transition-all duration-300 shadow-glow-sm cursor-pointer"
      >
        {votingLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-950" /> : <Vote className="h-4 w-4 text-slate-950" />}
        <span>Submit Vote</span>
      </button>
    </form>
  );
}

// ─── Action handlers (outside component) ─────────────────────────────────────
async function doLaunchPoll(createPoll, { newQuestion, options, setNewQuestion, setOptions, setSubmitting }) {
  if (!newQuestion.trim()) { toast.error("Please enter a poll question."); return; }
  const filtered = options.map((o) => o.trim()).filter(Boolean);
  if (filtered.length < 2) { toast.error("Please enter at least 2 non-empty options."); return; }
  setSubmitting(true);
  try {
    await createPoll(newQuestion, "single_choice", filtered);
    setNewQuestion("");
    setOptions(["", ""]);
    toast.success("Poll launched successfully!");
  } catch {
    toast.error("Failed to launch poll.");
  } finally {
    setSubmitting(false);
  }
}

async function doVoteSubmit(submitVote, activePoll, eventId, selectedOption, setVotingLoading, setHasVoted) {
  if (!selectedOption || !activePoll) return;
  setVotingLoading(true);
  try {
    await submitVote(activePoll.id, selectedOption);
    saveVotedPoll(eventId, activePoll.id);
    setHasVoted(true);
    toast.success("Vote recorded!");
  } catch {
    toast.error("Failed to record vote.");
  } finally {
    setVotingLoading(false);
  }
}

async function doStatusChange(updatePollStatus, activePoll, newStatus) {
  if (!activePoll) return;
  try {
    await updatePollStatus(activePoll.id, newStatus);
    toast.info(`Poll is now ${newStatus}.`);
  } catch {
    toast.error("Failed to update poll status.");
  }
}

// ─── Extracted helpers to keep LivePollController complexity ≤ 10 ─────────────
function getPollStatusClass(status) {
  if (status === "active") return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  if (status === "paused") return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
  return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
}

function computeTotalVotes(activePoll) {
  return activePoll ? Object.values(activePoll.results || {}).reduce((a, b) => a + b, 0) : 0;
}

function addPollOption(options, setOptions) {
  if (options.length >= 6) { toast.warn("Maximum of 6 options allowed."); return; }
  setOptions([...options, ""]);
}

function removePollOption(options, setOptions, i) {
  if (options.length <= 2) { toast.warn("Minimum of 2 options required."); return; }
  setOptions(options.filter((_, j) => j !== i));
}

function syncActivePoll(activePoll, eventId, setHasVoted, setSelectedOption) {
  if (activePoll) {
    setHasVoted(getVotedPolls(eventId).includes(activePoll.id));
    setSelectedOption("");
  } else {
    setHasVoted(false);
  }
}

function buildHandlers(createPoll, updatePollStatus, submitVote, activePoll, eventId, pollState, setSubmitting, setVotingLoading, setHasVoted, options, setOptions) {
  return {
    launch: (e) => { e.preventDefault(); doLaunchPoll(createPoll, { ...pollState, setSubmitting }); },
    addOption: () => addPollOption(options, setOptions),
    removeOption: (i) => removePollOption(options, setOptions, i),
    optionChange: (i, v) => { const u = [...options]; u[i] = v; setOptions(u); },
    statusChange: (s) => doStatusChange(updatePollStatus, activePoll, s),
    voteSubmit: (e) => { e.preventDefault(); doVoteSubmit(submitVote, activePoll, eventId, pollState.selectedOption, setVotingLoading, setHasVoted); },
  };
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LivePollController({ eventId }) {
  const { user } = useAuth();
  const { activePoll, submitVote, createPoll, updatePollStatus } = useLiveAudience(eventId);
  const moderator = isMod(user);

  const [newQuestion, setNewQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [votingLoading, setVotingLoading] = useState(false);

  useEffect(() => {
    syncActivePoll(activePoll, eventId, setHasVoted, setSelectedOption);
  }, [activePoll, eventId]);

  const totalVotes = computeTotalVotes(activePoll);
  const pollState = { newQuestion, setNewQuestion, options, setOptions, submitting, selectedOption };
  const handlers = buildHandlers(
    createPoll, updatePollStatus, submitVote, activePoll, eventId,
    pollState, setSubmitting, setVotingLoading, setHasVoted, options, setOptions
  );

  return (
    <div className="w-full flex flex-col gap-6 p-6 rounded-2xl bg-slate-900/30 backdrop-blur-xl border border-slate-800 shadow-premium-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          {moderator ? <BarChart3 className="h-6 w-6 text-primary" /> : <Vote className="h-6 w-6 text-primary" />}
          <h2 className="text-xl font-bold text-slate-100 font-sans tracking-wide">
            {moderator ? "Live Poll Control" : "Live Poll"}
          </h2>
        </div>
        {moderator && activePoll && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getPollStatusClass(activePoll.status)}`}>
            {activePoll.status}
          </span>
        )}
      </div>

      {moderator ? (
        <PollModeratorPanel
          activePoll={activePoll}
          totalVotes={totalVotes}
          pollState={pollState}
          handlers={handlers}
        />
      ) : (
        <PollAttendeeView
          activePoll={activePoll}
          hasVoted={hasVoted}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          handleVoteSubmit={handlers.voteSubmit}
          votingLoading={votingLoading}
          totalVotes={totalVotes}
        />
      )}
    </div>
  );
}
