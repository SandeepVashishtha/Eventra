import {
  Bell,
  CalendarDays,
  ChevronDown,
  Clock3,
  FileCheck2,
  Megaphone,
  RefreshCw,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_UPDATES = [
  {
    id: 1,
    type: "event",
    title: "AI Innovation Summit",
    message: "Your event is coming up in 3 days.",
    date: "Aug 16, 2026",
    priority: "High",
  },
  {
    id: 2,
    type: "deadline",
    title: "Registration Deadline",
    message: "Registration closes tomorrow at 11:59 PM.",
    date: "Aug 14, 2026",
    priority: "High",
  },
  {
    id: 3,
    type: "announcement",
    title: "New Event Announcement",
    message: "The organizer published a new event announcement.",
    date: "Aug 13, 2026",
    priority: "Medium",
  },
  {
    id: 4,
    type: "session",
    title: "Session Time Changed",
    message: "Your selected workshop has been moved to 3:00 PM.",
    date: "Aug 13, 2026",
    priority: "Medium",
  },
  {
    id: 5,
    type: "certificate",
    title: "Certificate Available",
    message: "Your participation certificate is now available.",
    date: "Aug 12, 2026",
    priority: "Low",
  },
];

const typeConfig = {
  event: {
    label: "Upcoming Event",
    icon: CalendarDays,
  },
  deadline: {
    label: "Deadline Reminder",
    icon: Clock3,
  },
  announcement: {
    label: "Announcement",
    icon: Megaphone,
  },
  session: {
    label: "Session Change",
    icon: RefreshCw,
  },
  certificate: {
    label: "Certificate",
    icon: FileCheck2,
  },
};

const EventParticipantNotificationDigest = ({
  updates = DEFAULT_UPDATES,
  onFrequencyChange,
}) => {
  const [frequency, setFrequency] = useState("Daily");
  const [openFrequency, setOpenFrequency] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const visibleUpdates = useMemo(
    () => (showAll ? updates : updates.slice(0, 4)),
    [updates, showAll]
  );

  const handleFrequencyChange = (value) => {
    setFrequency(value);
    setOpenFrequency(false);

    if (onFrequencyChange) {
      onFrequencyChange(value);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Bell size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Participant Notifications
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Notification Digest
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Receive important event updates together instead of
              receiving multiple individual notifications.
            </p>
          </div>
        </div>

        {/* Frequency Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenFrequency((current) => !current)
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[7px] font-bold text-slate-700 transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <Clock3 size={12} />
            {frequency} Digest
            <ChevronDown size={12} />
          </button>

          {openFrequency && (
            <div className="absolute right-0 z-20 mt-2 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
              {["Daily", "Weekly", "Off"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    handleFrequencyChange(option)
                  }
                  className={`block w-full px-4 py-3 text-left text-[7px] font-bold transition hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    frequency === option
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Digest Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={Bell}
          label="Updates"
          value={updates.length}
        />

        <SummaryCard
          icon={Clock3}
          label="Deadlines"
          value={
            updates.filter(
              (item) => item.type === "deadline"
            ).length
          }
        />

        <SummaryCard
          icon={CalendarDays}
          label="Upcoming Events"
          value={
            updates.filter(
              (item) => item.type === "event"
            ).length
          }
        />
      </div>

      {/* Digest Preview */}
      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white p-2 text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400">
            <Bell size={15} />
          </div>

          <div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              Digest Preview
            </p>

            <h3 className="mt-1 text-sm font-black text-slate-800 dark:text-white">
              Your {frequency.toLowerCase()} event update
            </h3>

            <p className="mt-1 text-[7px] leading-4 text-slate-500 dark:text-slate-400">
              {frequency === "Off"
                ? "Digest notifications are currently disabled."
                : `You have ${updates.length} event-related update${
                    updates.length === 1 ? "" : "s"
                  } to review.`}
            </p>
          </div>
        </div>
      </div>

      {/* Updates */}
      {frequency !== "Off" && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800">
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Included Updates
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Important updates included in your notification
              digest.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {visibleUpdates.length === 0 ? (
              <div className="p-8 text-center">
                <Bell
                  size={24}
                  className="mx-auto text-slate-400"
                />

                <p className="mt-3 text-[8px] font-bold text-slate-700 dark:text-slate-300">
                  No updates available
                </p>

                <p className="mt-1 text-[6px] text-slate-400">
                  New event updates will appear here.
                </p>
              </div>
            ) : (
              visibleUpdates.map((update) => (
                <NotificationItem
                  key={update.id}
                  update={update}
                />
              ))
            )}
          </div>

          {updates.length > 4 && (
            <div className="border-t border-slate-100 p-4 text-center dark:border-slate-800">
              <button
                type="button"
                onClick={() =>
                  setShowAll((current) => !current)
                }
                className="rounded-xl px-4 py-2 text-[7px] font-bold text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
              >
                {showAll ? "Show Less" : "View All Updates"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Digest Preferences */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div>
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Digest Preferences
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Choose how frequently you want to receive combined
            event updates.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <FrequencyCard
            title="Daily"
            description="Receive important updates once per day."
            selected={frequency === "Daily"}
            onClick={() => handleFrequencyChange("Daily")}
          />

          <FrequencyCard
            title="Weekly"
            description="Receive a summary of your event activity each week."
            selected={frequency === "Weekly"}
            onClick={() =>
              handleFrequencyChange("Weekly")
            }
          />

          <FrequencyCard
            title="Off"
            description="Disable digest notifications."
            selected={frequency === "Off"}
            onClick={() => handleFrequencyChange("Off")}
          />
        </div>
      </div>

      {/* Included Categories */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
          Digest Categories
        </h3>

        <p className="mt-1 text-[7px] text-slate-400">
          Event information that can be included in your digest.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(typeConfig).map(
            ([type, config]) => {
              const Icon = config.icon;

              return (
                <div
                  key={type}
                  className="rounded-xl border border-slate-100 p-3 dark:border-slate-800"
                >
                  <Icon
                    size={14}
                    className="text-indigo-600 dark:text-indigo-400"
                  />

                  <p className="mt-3 text-[7px] font-bold text-slate-700 dark:text-slate-300">
                    {config.label}
                  </p>
                </div>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
};

const NotificationItem = ({ update }) => {
  const config =
    typeConfig[update.type] || typeConfig.event;

  const Icon = config.icon;

  return (
    <div className="p-5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Icon size={15} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
                  {update.title}
                </h4>

                <PriorityBadge
                  priority={update.priority}
                />
              </div>

              <p className="mt-1 text-[7px] leading-4 text-slate-500 dark:text-slate-400">
                {update.message}
              </p>
            </div>

            <span className="shrink-0 text-[6px] font-bold text-slate-400">
              {update.date}
            </span>
          </div>

          <div className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[5px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {config.label}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <Icon size={15} />
      </div>

      <div>
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </div>
);

const FrequencyCard = ({
  title,
  description,
  selected,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-xl border p-4 text-left transition ${
      selected
        ? "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200 dark:border-indigo-800 dark:bg-indigo-900/20 dark:ring-indigo-900"
        : "border-slate-200 hover:border-indigo-200 dark:border-slate-700"
    }`}
  >
    <div className="flex items-center justify-between">
      <p
        className={`text-[8px] font-bold ${
          selected
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-slate-700 dark:text-slate-300"
        }`}
      >
        {title}
      </p>

      <span
        className={`h-3 w-3 rounded-full border-2 ${
          selected
            ? "border-indigo-600 bg-indigo-600"
            : "border-slate-300 dark:border-slate-600"
        }`}
      />
    </div>

    <p className="mt-2 text-[6px] leading-4 text-slate-400">
      {description}
    </p>
  </button>
);

const PriorityBadge = ({ priority }) => {
  const styles = {
    High: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    Medium:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    Low: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-[5px] font-bold ${
        styles[priority] || styles.Medium
      }`}
    >
      {priority}
    </span>
  );
};

export default EventParticipantNotificationDigest;