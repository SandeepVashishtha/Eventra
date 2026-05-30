import { useMemo, useState } from "react";
import { BarChart3, CheckCircle2 } from "lucide-react";

const LivePollPanel = ({ poll, onVote }) => {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [localVotes, setLocalVotes] = useState({});

  const options = poll?.options ?? [];

  const totalVotes = useMemo(() => {
    return options.reduce(
      (sum, option) => sum + (localVotes[option.id] ?? option.votes ?? 0),
      0
    );
  }, [localVotes, options]);

  const handleVote = (option) => {
    setSelectedOptionId(option.id);
    setLocalVotes((current) => ({
      ...current,
      [option.id]: (current[option.id] ?? option.votes ?? 0) + 1,
    }));
    onVote?.(option);
  };

  if (!poll) {
    return null;
  }

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-slate-950/70 p-5 text-white shadow-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
          <BarChart3 className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Live Poll</h3>
          <p className="text-sm text-slate-300">Vote in real time and track the current response split.</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-base font-medium text-white">{poll.question}</p>
        <p className="mt-1 text-xs text-slate-400">{poll.duration ? `Poll closes in ${poll.duration}s` : "Live results update instantly"}</p>
      </div>

      <div className="space-y-3">
        {options.map((option) => {
          const currentVotes = localVotes[option.id] ?? option.votes ?? 0;
          const share = totalVotes > 0 ? Math.round((currentVotes / totalVotes) * 100) : 0;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleVote(option)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-colors hover:border-emerald-400/60 hover:bg-emerald-500/10"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-white">{option.text}</span>
                {selectedOptionId === option.id && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs text-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Voted
                  </span>
                )}
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                  style={{ width: `${share}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>{currentVotes} vote{currentVotes === 1 ? "" : "s"}</span>
                <span>{share}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default LivePollPanel;