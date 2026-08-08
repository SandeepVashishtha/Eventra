import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Search, Send } from "lucide-react";
import DiscussionPostCard from "./DiscussionPostCard";
import {
  getEventDiscussions,
  addDiscussion,
  searchDiscussions,
  sortDiscussions,
} from "../../utils/discussionUtils";

const DiscussionThread = ({ eventId, currentUser = "Anonymous" }) => {
  const [discussions, setDiscussions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDiscussions();
  }, [eventId]);

  const loadDiscussions = () => {
    const data = getEventDiscussions(eventId);
    setDiscussions(sortDiscussions(data));
  };

  const handlePost = () => {
    if (!message.trim()) return;

    addDiscussion({
      author: currentUser,
      content: message,
      eventId,
      isOrganizer: false,
    });

    setMessage("");
    loadDiscussions();
  };

  const filteredDiscussions = useMemo(() => {
    return searchDiscussions(discussions, searchQuery);
  }, [discussions, searchQuery]);

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg p-6">

      {/* Header */}

      <div className="flex items-center gap-3 mb-6">
        <MessageSquare
          size={28}
          className="text-indigo-600"
        />

        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Event Discussion
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ask questions, share ideas and interact with participants.
          </p>
        </div>
      </div>

      {/* Search */}

      <div className="relative mb-5">
        <Search
          size={18}
          className="absolute left-3 top-3.5 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search discussions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Create Post */}

      <div className="mb-8">

        <textarea
          rows={4}
          placeholder="Start a discussion..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 resize-none outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handlePost}
          className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 transition"
        >
          <Send size={18} />
          Post Discussion
        </button>

      </div>

      {/* Discussion List */}

      {filteredDiscussions.length === 0 ? (
        <div className="text-center py-12">

          <MessageSquare
            size={52}
            className="mx-auto text-slate-400 mb-4"
          />

          <h3 className="text-lg font-semibold text-slate-700 dark:text-white">
            No Discussions Yet
          </h3>

          <p className="text-slate-500 mt-2">
            Be the first participant to start a discussion.
          </p>

        </div>
      ) : (
        <div className="space-y-5">

          {filteredDiscussions.map((discussion) => (
            <DiscussionPostCard
              key={discussion.id}
              discussion={discussion}
              refresh={loadDiscussions}
            />
          ))}

        </div>
      )}

    </section>
  );
};

export default DiscussionThread;