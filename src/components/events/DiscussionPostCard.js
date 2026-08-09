import { MessageCircle, Pin, ThumbsUp, User } from "lucide-react";
import {
  toggleUpvote,
  pinDiscussion,
  formatPostedTime,
} from "../../utils/discussionUtils";

const DiscussionPostCard = ({
  discussion,
  refresh,
}) => {
  if (!discussion) return null;

  const handleUpvote = () => {
    toggleUpvote(discussion.id);

    if (refresh) {
      refresh();
    }
  };

  const handlePin = () => {
    pinDiscussion(discussion.id);

    if (refresh) {
      refresh();
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all duration-300 p-5">

      {/* Header */}

      <div className="flex items-start justify-between">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <User
              size={20}
              className="text-indigo-600"
            />
          </div>

          <div>

            <div className="flex items-center gap-2">

              <h3 className="font-semibold text-slate-800 dark:text-white">
                {discussion.author}
              </h3>

              {discussion.isOrganizer && (
                <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-xs font-medium">
                  Organizer
                </span>
              )}

              {discussion.pinned && (
                <span className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 text-xs font-medium flex items-center gap-1">
                  <Pin size={12} />
                  Pinned
                </span>
              )}

            </div>

            <p className="text-xs text-slate-500 mt-1">
              {formatPostedTime(discussion.createdAt)}
            </p>

          </div>

        </div>

      </div>

      {/* Content */}

      <div className="mt-5">
        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
          {discussion.content}
        </p>
      </div>

      {/* Replies */}

      {discussion.replies?.length > 0 && (
        <div className="mt-5 border-t border-slate-200 dark:border-slate-700 pt-4">

          <h4 className="font-medium text-sm mb-3 text-slate-700 dark:text-slate-300">
            Replies
          </h4>

          <div className="space-y-3">

            {discussion.replies.map((reply) => (
              <div
                key={reply.id}
                className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3"
              >
                <div className="flex items-center gap-2">

                  <span className="font-semibold text-sm">
                    {reply.author}
                  </span>

                  {reply.isOrganizer && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      Organizer
                    </span>
                  )}

                </div>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {reply.content}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {formatPostedTime(reply.createdAt)}
                </p>

              </div>
            ))}

          </div>

        </div>
      )}

      {/* Footer */}

      <div className="mt-6 flex flex-wrap gap-3">

        <button
          onClick={handleUpvote}
          className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ThumbsUp size={16} />

          <span>
            {discussion.upvotes}
          </span>
        </button>

        <button
          onClick={handlePin}
          className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Pin size={16} />

          <span>
            {discussion.pinned ? "Unpin" : "Pin"}
          </span>
        </button>

        <div className="ml-auto flex items-center gap-2 text-slate-500">

          <MessageCircle size={16} />

          <span>
            {discussion.replies?.length || 0} Replies
          </span>

        </div>

      </div>

    </div>
  );
};

export default DiscussionPostCard;