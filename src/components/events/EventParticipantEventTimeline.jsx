import {
  Award,
  CalendarCheck,
  Check,
  Circle,
  Clock3,
  LogIn,
  Users,
  X,
} from "lucide-react";

const DEFAULT_MILESTONES = [
  {
    id: "registered",
    title: "Registered",
    description: "You successfully registered for the event.",
    status: "completed",
    timestamp: "August 1, 2026 • 10:30 AM",
    icon: CalendarCheck,
  },
  {
    id: "eligibility",
    title: "Eligibility Verified",
    description: "Your eligibility for this event has been verified.",
    status: "completed",
    timestamp: "August 2, 2026 • 02:15 PM",
    icon: Check,
  },
  {
    id: "team",
    title: "Team Joined",
    description: "You joined a team for this event.",
    status: "completed",
    timestamp: "August 3, 2026 • 11:45 AM",
    icon: Users,
  },
  {
    id: "session",
    title: "Session Selected",
    description: "You selected sessions from the event schedule.",
    status: "completed",
    timestamp: "August 5, 2026 • 04:20 PM",
    icon: CalendarCheck,
  },
  {
    id: "started",
    title: "Event Started",
    description: "The event is currently in progress.",
    status: "current",
    timestamp: "August 12, 2026 • 09:00 AM",
    icon: Clock3,
  },
  {
    id: "checked-in",
    title: "Checked In",
    description: "Check in at the event venue to continue.",
    status: "pending",
    timestamp: null,
    icon: LogIn,
  },
  {
    id: "attended",
    title: "Attended",
    description: "Attendance will be recorded after the event.",
    status: "pending",
    timestamp: null,
    icon: Check,
  },
  {
    id: "certificate",
    title: "Certificate Issued",
    description: "Your event certificate will appear here once issued.",
    status: "pending",
    timestamp: null,
    icon: Award,
  },
];

const STATUS_CONFIG = {
  completed: {
    label: "Completed",
    iconClass:
      "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    lineClass: "bg-green-500",
    badgeClass:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  },
  current: {
    label: "Current",
    iconClass:
      "bg-indigo-100 text-indigo-600 ring-4 ring-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 dark:ring-indigo-900/10",
    lineClass: "bg-slate-200 dark:bg-slate-700",
    badgeClass:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
  },
  pending: {
    label: "Pending",
    iconClass:
      "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
    lineClass: "bg-slate-200 dark:bg-slate-700",
    badgeClass:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
  failed: {
    label: "Action Required",
    iconClass:
      "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    lineClass: "bg-slate-200 dark:bg-slate-700",
    badgeClass:
      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  },
};

const EventParticipantEventTimeline = ({
  eventName = "AI Hackathon 2026",
  participantName = "Alex Johnson",
  milestones = DEFAULT_MILESTONES,
}) => {
  const completedCount = milestones.filter(
    (item) => item.status === "completed"
  ).length;

  const progress =
    milestones.length > 0
      ? Math.round((completedCount / milestones.length) * 100)
      : 0;

  const currentMilestone =
    milestones.find((item) => item.status === "current") ||
    milestones.find((item) => item.status === "pending");

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Participant Journey
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Event Timeline
          </h2>

          <p className="mt-1 max-w-xl text-xs text-slate-500 dark:text-slate-400">
            Follow every important milestone in your event
            journey from registration to certificate issuance.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Progress
          </p>

          <p className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {progress}%
          </p>
        </div>
      </div>

      {/* Event Info */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
              Event
            </p>

            <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
              {eventName}
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Participant: {participantName}
            </p>
          </div>

          <div className="min-w-40">
            <div className="flex items-center justify-between">
              <span className="text-[6px] font-bold text-slate-400">
                Journey Progress
              </span>

              <span className="text-[6px] font-bold text-indigo-600 dark:text-indigo-400">
                {completedCount}/{milestones.length}
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      {currentMilestone && (
        <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <div className="flex items-start gap-3">
            <Clock3
              size={17}
              className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
            />

            <div>
              <p className="text-[6px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
                Next Milestone
              </p>

              <h4 className="mt-1 text-[9px] font-bold text-indigo-700 dark:text-indigo-300">
                {currentMilestone.title}
              </h4>

              <p className="mt-1 text-[7px] leading-4 text-indigo-600 dark:text-indigo-400">
                {currentMilestone.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="mt-7">
        <div className="mb-5">
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Your Event Journey
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            All important activities are shown in chronological
            order.
          </p>
        </div>

        <div className="relative">
          {milestones.map((milestone, index) => {
            const config =
              STATUS_CONFIG[milestone.status] ||
              STATUS_CONFIG.pending;

            const Icon = milestone.icon || Circle;
            const isLast = index === milestones.length - 1;

            return (
              <div
                key={milestone.id || index}
                className="relative flex gap-4"
              >
                {/* Timeline line */}
                {!isLast && (
                  <div
                    className={`absolute left-5 top-11 h-[calc(100%-20px)] w-0.5 ${
                      milestone.status === "completed"
                        ? "bg-green-500"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}

                {/* Icon */}
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconClass}`}
                >
                  <Icon size={17} />
                </div>

                {/* Content */}
                <div
                  className={`min-w-0 flex-1 ${
                    isLast ? "pb-0" : "pb-7"
                  }`}
                >
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
                            {milestone.title}
                          </h4>

                          <span
                            className={`rounded-full px-2 py-1 text-[5px] font-bold ${config.badgeClass}`}
                          >
                            {config.label}
                          </span>
                        </div>

                        <p className="mt-2 text-[7px] leading-4 text-slate-500 dark:text-slate-400">
                          {milestone.description}
                        </p>
                      </div>

                      {milestone.timestamp && (
                        <div className="flex shrink-0 items-center gap-1 text-[6px] text-slate-400">
                          <Clock3 size={10} />
                          {milestone.timestamp}
                        </div>
                      )}
                    </div>

                    {milestone.status === "pending" && (
                      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <Circle
                          size={9}
                          className="text-slate-400"
                        />

                        <span className="text-[6px] text-slate-400">
                          Waiting for this milestone to be completed
                        </span>
                      </div>
                    )}

                    {milestone.status === "current" && (
                      <div className="mt-3 flex items-center gap-2 border-t border-indigo-100 pt-3 dark:border-indigo-900/30">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600" />
                        </span>

                        <span className="text-[6px] font-bold text-indigo-600 dark:text-indigo-400">
                          Currently active
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <Award
          size={16}
          className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
        />

        <div>
          <h4 className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
            Complete your event journey
          </h4>

          <p className="mt-1 text-[7px] leading-4 text-slate-400">
            Complete the remaining milestones to finish your
            participant journey and receive your event
            certificate.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EventParticipantEventTimeline;