const LivePollPanel = ({ poll, onVote = () => {}, isSubmitting = false }) => {
  const activePoll = poll ?? {
    question: 'No active poll',
    options: [],
    duration: null,
  };

  return (
    <section className="rounded-2xl border border-white/15 bg-white/5 p-4 text-white">
      <h2 className="text-lg font-semibold">Live Poll Panel</h2>
      <p className="mt-1 text-sm text-white/75">This feature is under development.</p>

      <div className="mt-4 rounded-xl bg-black/20 p-3">
        <p className="text-sm font-medium">{activePoll.question}</p>
        {activePoll.duration ? (
          <p className="mt-1 text-xs text-white/60">Duration: {activePoll.duration}s</p>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2">
        {activePoll.options?.length ? (
          activePoll.options.map((option) => (
            <button
              key={option.id ?? option.text}
              type="button"
              className="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-left text-sm hover:bg-black/30 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => onVote(option.id)}
              disabled={isSubmitting}
            >
              <span>{option.text}</span>
              <span className="ml-2 text-xs text-white/60">({option.votes ?? 0} votes)</span>
            </button>
          ))
        ) : (
          <p className="text-xs text-white/60">No poll options available.</p>
        )}
      </div>
    </section>
  );
};

export default LivePollPanel;
