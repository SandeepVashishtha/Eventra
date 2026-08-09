import { useState } from "react";
import { Calendar, Pin, Send, Clock } from "lucide-react";

const AnnouncementScheduler = ({ onPublish }) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  const handleSubmit = (publishNow = false) => {
    if (!title.trim() || !message.trim()) {
      alert("Please enter both title and message.");
      return;
    }

    const announcement = {
      id: Date.now(),
      title,
      message,
      pinned: isPinned,
      publishNow,
      scheduledAt: publishNow
        ? null
        : `${scheduleDate} ${scheduleTime}`,
      createdAt: new Date().toISOString(),
    };

    if (onPublish) {
      onPublish(announcement);
    }

    setTitle("");
    setMessage("");
    setScheduleDate("");
    setScheduleTime("");
    setIsPinned(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">

      <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">
        Organizer Announcement Center
      </h2>

      {/* Title */}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Announcement Title
        </label>

        <input
          type="text"
          placeholder="Enter title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Message */}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Message
        </label>

        <textarea
          rows={5}
          placeholder="Write announcement..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      {/* Schedule */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

        <div>
          <label className="block text-sm font-medium mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Schedule Date
          </label>

          <input
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            Schedule Time
          </label>

          <input
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3"
          />
        </div>

      </div>

      {/* Pin */}

      <div className="flex items-center gap-3 mb-6">

        <input
          type="checkbox"
          checked={isPinned}
          onChange={(e) => setIsPinned(e.target.checked)}
        />

        <span className="flex items-center gap-2">
          <Pin size={16} />
          Pin this announcement
        </span>

      </div>

      {/* Buttons */}

      <div className="flex flex-wrap gap-3">

        <button
          onClick={() => handleSubmit(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl transition"
        >
          <Send size={18} />
          Publish Now
        </button>

        <button
          onClick={() => handleSubmit(false)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl transition"
        >
          <Calendar size={18} />
          Schedule
        </button>

      </div>

    </div>
  );
};

export default AnnouncementScheduler;