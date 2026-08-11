import { useState } from "react";
import AnnouncementCard from "./AnnouncementCard";
import AnnouncementScheduler from "./AnnouncementScheduler";

const AnnouncementCenter = () => {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Welcome to Eventra",
      message:
        "Stay tuned for the latest announcements regarding your events.",
      author: "Organizer",
      createdAt: new Date().toLocaleDateString(),
      scheduledAt: "",
      isPinned: true,
      isPublished: true,
    },
  ]);

  const handlePublish = (announcement) => {
    const newAnnouncement = {
      ...announcement,
      author: "Organizer",
      isPublished: announcement.publishNow,
      isPinned: announcement.pinned,
    };

    setAnnouncements((prev) => [
      newAnnouncement,
      ...prev,
    ]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">

      {/* Scheduler */}

      <AnnouncementScheduler
        onPublish={handlePublish}
      />

      {/* Announcement List */}

      <div className="mt-8">

        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">
          Announcements
        </h2>

        {announcements.length === 0 ? (
          <div className="text-center py-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-500">
              No announcements available.
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {announcements
              .sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return (
                  new Date(b.createdAt) -
                  new Date(a.createdAt)
                );
              })
              .map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  title={announcement.title}
                  message={announcement.message}
                  author={announcement.author}
                  createdAt={announcement.createdAt}
                  scheduledAt={announcement.scheduledAt}
                  isPinned={announcement.isPinned}
                  isPublished={announcement.isPublished}
                />
              ))}

          </div>
        )}

      </div>

    </div>
  );
};

export default AnnouncementCenter;