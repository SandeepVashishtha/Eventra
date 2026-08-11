import React, { useState, useMemo } from 'react';

export const LivePollWidget = ({ poll, onVote }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  const totalVotes = useMemo(() => {
    if (!poll || !poll.options) return 0;
    return poll.options.reduce((acc, opt) => acc + (opt.votes || 0), 0);
  }, [poll]);

  const handleVoteSubmit = (optionId) => {
    if (hasVoted) return;
    setSelectedOption(optionId);
    setHasVoted(true);
    if (onVote) {
      onVote(poll.id, optionId);
    }
  };

  if (!poll) return null;

  return (
    <div className="live-poll-widget w-full max-w-lg p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {poll.question || 'Live Audience Poll'}
        </h3>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {hasVoted ? 'Voted' : 'Live'}
        </span>
      </div>

      <div className="space-y-3">
        {poll.options && poll.options.map((option) => {
          const voteCount = option.votes || 0;
          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const isSelected = selectedOption === option.id;

          return (
            <button
              key={option.id}
              disabled={hasVoted}
              onClick={() => handleVoteSubmit(option.id)}
              className={`relative w-full overflow-hidden p-4 rounded-lg text-left transition-all duration-200 border ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              } ${hasVoted ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {/* Animated Progress Bar Fill */}
              {hasVoted && (
                <div
                  className="absolute top-0 left-0 bottom-0 bg-blue-500/15 dark:bg-blue-500/25 transition-all duration-700 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative z-10 flex items-center justify-between">
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {option.text}
                </span>

                {hasVoted && (
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-3">
                    {percentage}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} total</span>
        {hasVoted && <span>Thank you for voting!</span>}
      </div>
    </div>
  );
};

export default LivePollWidget;
