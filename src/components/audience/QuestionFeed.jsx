import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';

export const QuestionFeed = ({ questions = [], onUpvote }) => {
  const containerRef = useRef(null);
  const scrollOffsetRef = useRef(0);
  const [prevQuestionsLength, setPrevQuestionsLength] = useState(questions.length);

  // Snapshot current scroll top and height before DOM mutations occur on SSE updates
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (questions.length > prevQuestionsLength) {
      const scrollHeightDiff = container.scrollHeight - scrollOffsetRef.current;
      container.scrollTop = container.scrollTop + scrollHeightDiff;
    }
    
    setPrevQuestionsLength(questions.length);
  }, [questions]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (container) {
      scrollOffsetRef.current = container.scrollHeight - container.scrollTop;
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="question-feed-container overflow-y-auto max-h-[600px] p-4 space-y-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
    >
      {questions.length === 0 ? (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
          No audience questions yet. Be the first to ask!
        </p>
      ) : (
        questions.map((q) => (
          <div
            key={q.id}
            className="question-card p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-start justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {q.author || 'Anonymous'}
                </span>
                <span className="text-xs text-gray-400">
                  {q.timestamp ? new Date(q.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {q.content}
              </p>
            </div>

            <button
              onClick={() => onUpvote && onUpvote(q.id)}
              className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-gray-200 dark:border-gray-600"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M10 3.25l7 7h-4.5v6.5h-5v-6.5h-4.5l7-7z" />
              </svg>
              <span className="text-xs font-bold mt-1">{q.upvotes || 0}</span>
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default QuestionFeed;
