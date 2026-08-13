import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Eye,
  Trophy,
  Users,
  Award,
  FileText,
  Send,
  X,
} from "lucide-react";

const leaderboard = [
  {
    rank: 1,
    team: "Team Phoenix",
    score: 94.5,
  },
  {
    rank: 2,
    team: "Code Warriors",
    score: 91.8,
  },
  {
    rank: 3,
    team: "Innovators",
    score: 89.6,
  },
];

const EventResultsAnnouncement = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [published, setPublished] = useState(false);

  const [announcement, setAnnouncement] = useState({
    title: "Competition Results Are Live!",
    message:
      "The official results for the competition have been published. Congratulations to all participating teams!",
    includeLeaderboard: true,
    includeFeedback: true,
    includeCertificates: true,
  });

  const updateAnnouncement = (key, value) => {
    setAnnouncement((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handlePublish = () => {
    setPublished(true);
    setShowPreview(false);
  };

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <Bell size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Results Announcement
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Notify participants when official competition results are published.
            </p>
          </div>
        </div>
      </div>

      {/* Success state */}
      {published && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/40 dark:bg-green-900/10">
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={21}
              className="mt-0.5 text-green-600"
            />

            <div>
              <h2 className="font-bold text-green-800 dark:text-green-300">
                Results Announcement Published
              </h2>

              <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                Participating teams have been notified that the official
                results are available.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Announcement editor */}
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="font-bold text-slate-900 dark:text-white">
              Announcement Editor
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Configure the message participants will receive.
            </p>
          </div>

          <div className="space-y-5 p-5">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Announcement Title
              </label>

              <input
                type="text"
                value={announcement.title}
                onChange={(e) =>
                  updateAnnouncement("title", e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Message */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Message
              </label>

              <textarea
                rows={5}
                value={announcement.message}
                onChange={(e) =>
                  updateAnnouncement("message", e.target.value)
                }
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Content options */}
            <div>
              <h3 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-200">
                Include in Announcement
              </h3>

              <div className="space-y-3">
                <Option
                  checked={announcement.includeLeaderboard}
                  onChange={() =>
                    updateAnnouncement(
                      "includeLeaderboard",
                      !announcement.includeLeaderboard
                    )
                  }
                  icon={<Trophy size={17} />}
                  title="Leaderboard"
                  description="Show official team rankings and scores."
                />

                <Option
                  checked={announcement.includeFeedback}
                  onChange={() =>
                    updateAnnouncement(
                      "includeFeedback",
                      !announcement.includeFeedback
                    )
                  }
                  icon={<FileText size={17} />}
                  title="Feedback"
                  description="Provide access to available evaluation feedback."
                />

                <Option
                  checked={announcement.includeCertificates}
                  onChange={() =>
                    updateAnnouncement(
                      "includeCertificates",
                      !announcement.includeCertificates
                    )
                  }
                  icon={<Award size={17} />}
                  title="Certificates"
                  description="Show certificate availability information."
                />
              </div>
            </div>

            {/* Preview button */}
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                <Eye size={17} />
                Preview Announcement
              </button>

              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                <Send size={17} />
                Review & Publish
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="font-bold text-slate-900 dark:text-white">
              Announcement Summary
            </h2>

            <div className="mt-4 space-y-4">
              <SummaryItem
                icon={<Users size={17} />}
                label="Recipients"
                value="All participating teams"
              />

              <SummaryItem
                icon={<Trophy size={17} />}
                label="Leaderboard"
                value={
                  announcement.includeLeaderboard
                    ? "Included"
                    : "Not included"
                }
              />

              <SummaryItem
                icon={<FileText size={17} />}
                label="Feedback"
                value={
                  announcement.includeFeedback
                    ? "Included"
                    : "Not included"
                }
              />

              <SummaryItem
                icon={<Award size={17} />}
                label="Certificates"
                value={
                  announcement.includeCertificates
                    ? "Included"
                    : "Not included"
                }
              />
            </div>
          </div>

          {/* Leaderboard */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white">
                Final Results
              </h2>

              <Trophy size={18} className="text-amber-500" />
            </div>

            <div className="mt-4 space-y-3">
              {leaderboard.map((team) => (
                <div
                  key={team.team}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                      {team.rank}
                    </span>

                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {team.team}
                    </span>
                  </div>

                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {team.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-950">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Announcement Preview
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  This is how participants will see the announcement.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <X size={19} />
              </button>
            </div>

            {/* Preview content */}
            <div className="p-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                    <Trophy size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                      Official Results
                    </p>

                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {announcement.title}
                    </h3>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {announcement.message}
                </p>

                {announcement.includeLeaderboard && (
                  <div className="mt-6">
                    <h4 className="mb-3 font-bold text-slate-900 dark:text-white">
                      Final Leaderboard
                    </h4>

                    <div className="space-y-2">
                      {leaderboard.map((team) => (
                        <div
                          key={team.team}
                          className="flex items-center justify-between rounded-xl bg-white p-3 dark:bg-slate-950"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-black text-indigo-600">
                              #{team.rank}
                            </span>

                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                              {team.team}
                            </span>
                          </div>

                          <span className="font-black text-slate-900 dark:text-white">
                            {team.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {announcement.includeFeedback && (
                    <button
                      type="button"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                    >
                      View Feedback
                    </button>
                  )}

                  {announcement.includeCertificates && (
                    <button
                      type="button"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                    >
                      View Certificates
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-300"
              >
                Edit Announcement
              </button>

              <button
                type="button"
                onClick={handlePublish}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
              >
                <Send size={16} />
                Publish Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const Option = ({
  checked,
  onChange,
  icon,
  title,
  description,
}) => (
  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="mt-1 h-4 w-4 accent-indigo-600"
    />

    <span className="mt-0.5 text-indigo-500">{icon}</span>

    <span>
      <span className="block text-sm font-bold text-slate-800 dark:text-slate-200">
        {title}
      </span>

      <span className="mt-1 block text-xs text-slate-500">
        {description}
      </span>
    </span>
  </label>
);

const SummaryItem = ({ icon, label, value }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 text-slate-500">
      {icon}
      <span className="text-xs">{label}</span>
    </div>

    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
      {value}
    </span>
  </div>
);

export default EventResultsAnnouncement;