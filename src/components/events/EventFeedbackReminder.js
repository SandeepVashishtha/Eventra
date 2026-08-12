import {
  Bell,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MessageSquareText,
  Send,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_REMINDER_OPTIONS = [
  {
    value: 24,
    label: "24 hours after event",
  },
  {
    value: 48,
    label: "48 hours after event",
  },
  {
    value: 72,
    label: "72 hours after event",
  },
  {
    value: 168,
    label: "7 days after event",
  },
];

const EventFeedbackReminder = ({
  eventName = "Event",
  eventEndDate = null,
  feedbackUrl = "#feedback",
  attendees = [],
  initialReminderHours = 24,
  onSendReminder,
  onReminderTimingChange,
  onFeedbackSubmitted,
  className = "",
}) => {
  const [reminderHours, setReminderHours] =
    useState(initialReminderHours);

  const [participants, setParticipants] =
    useState(() =>
      normalizeParticipants(attendees)
    );

  const [message, setMessage] =
    useState("");

  const [showSettings, setShowSettings] =
    useState(false);

  const [now, setNow] = useState(
    () => new Date()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setParticipants(
      normalizeParticipants(attendees)
    );
  }, [attendees]);

  const attendedParticipants =
    useMemo(
      () =>
        participants.filter(
          (participant) =>
            participant.attended
        ),
      [participants]
    );

  const pendingFeedback =
    useMemo(
      () =>
        attendedParticipants.filter(
          (participant) =>
            !participant.feedbackSubmitted
        ),
      [attendedParticipants]
    );

  const submittedFeedback =
    useMemo(
      () =>
        attendedParticipants.filter(
          (participant) =>
            participant.feedbackSubmitted
        ),
      [attendedParticipants]
    );

  const eventEnded =
    getEventEnded(eventEndDate, now);

  const reminderState =
    getReminderState({
      eventEndDate,
      reminderHours,
      now,
      pendingCount:
        pendingFeedback.length,
    });

  const handleTimingChange = (
    event
  ) => {
    const hours = Number(
      event.target.value
    );

    setReminderHours(hours);

    onReminderTimingChange?.(hours);

    setMessage(
      "Reminder timing updated."
    );
  };

  const handleSendReminder = (
    participant = null
  ) => {
    if (!eventEnded) {
      setMessage(
        "Feedback reminders can be sent after the event ends."
      );
      return;
    }

    if (participant) {
      if (
        participant.feedbackSubmitted
      ) {
        return;
      }

      onSendReminder?.({
        eventName,
        participant,
        feedbackUrl,
        reminderHours,
      });

      setMessage(
        `Feedback reminder sent to ${participant.name}.`
      );

      return;
    }

    if (pendingFeedback.length === 0) {
      setMessage(
        "All attended participants have submitted feedback."
      );
      return;
    }

    onSendReminder?.({
      eventName,
      participants:
        pendingFeedback,
      feedbackUrl,
      reminderHours,
    });

    setMessage(
      `Feedback reminders sent to ${pendingFeedback.length} participant${
        pendingFeedback.length === 1
          ? ""
          : "s"
      }.`
    );
  };

  const markFeedbackSubmitted = (
    participantId
  ) => {
    setParticipants((current) =>
      current.map((participant) =>
        participant.id ===
        participantId
          ? {
              ...participant,
              feedbackSubmitted: true,
              feedbackSubmittedAt:
                new Date().toISOString(),
            }
          : participant
      )
    );

    const participant =
      participants.find(
        (item) =>
          item.id === participantId
      );

    onFeedbackSubmitted?.(
      participant
    );

    setMessage(
      participant
        ? `Feedback marked as submitted for ${participant.name}.`
        : "Feedback marked as submitted."
    );
  };

  const completionPercentage =
    attendedParticipants.length === 0
      ? 0
      : Math.round(
          (submittedFeedback.length /
            attendedParticipants.length) *
            100
        );

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Bell
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Post-Event Engagement
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Event Feedback Reminder
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Remind attendees to submit feedback after
              {eventName
                ? ` ${eventName}`
                : " the event"}.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowSettings(
              (current) => !current
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <Settings size={13} />
          Reminder Settings
        </button>
      </div>

      {/* Event status */}
      <div
        className={`mt-6 rounded-2xl border p-4 ${
          eventEnded
            ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10"
            : "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10"
        }`}
      >
        <div className="flex items-center gap-3">
          {eventEnded ? (
            <CheckCircle2
              size={18}
              className="shrink-0 text-green-600 dark:text-green-400"
            />
          ) : (
            <Clock3
              size={18}
              className="shrink-0 text-amber-600 dark:text-amber-400"
            />
          )}

          <div>
            <p
              className={`text-xs font-bold ${
                eventEnded
                  ? "text-green-700 dark:text-green-400"
                  : "text-amber-700 dark:text-amber-400"
              }`}
            >
              {eventEnded
                ? "Event Completed"
                : "Event Has Not Ended"}
            </p>

            <p className="mt-1 text-[9px] text-slate-500 dark:text-slate-400">
              {eventEndDate
                ? eventEnded
                  ? `Ended ${formatDate(
                      eventEndDate
                    )}`
                  : `Ends ${formatDate(
                      eventEndDate
                    )}`
                : "Event end time has not been configured."}
            </p>
          </div>
        </div>
      </div>

      {/* Reminder settings */}
      {showSettings && (
        <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <div className="flex items-start gap-3">
            <Settings
              size={16}
              className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
            />

            <div className="flex-1">
              <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                Reminder Timing
              </p>

              <p className="mt-1 text-[9px] leading-4 text-slate-500 dark:text-slate-400">
                Choose when attendees should receive their
                feedback reminder after the event.
              </p>

              <select
                value={reminderHours}
                onChange={
                  handleTimingChange
                }
                className="mt-3 w-full rounded-xl border border-indigo-200 bg-white px-3 py-3 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 dark:border-indigo-800 dark:bg-slate-950 dark:text-slate-200"
              >
                {DEFAULT_REMINDER_OPTIONS.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users size={17} />}
          label="Attended"
          value={
            attendedParticipants.length
          }
          description="Participants eligible for feedback"
        />

        <StatCard
          icon={
            <MessageSquareText
              size={17}
            />
          }
          label="Pending"
          value={
            pendingFeedback.length
          }
          description="Feedback not submitted"
        />

        <StatCard
          icon={<CheckCircle2 size={17} />}
          label="Submitted"
          value={
            submittedFeedback.length
          }
          description="Feedback received"
        />

        <StatCard
          icon={<Bell size={17} />}
          label="Response Rate"
          value={`${completionPercentage}%`}
          description="Attendee feedback completion"
        />
      </div>

      {/* Progress */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Feedback Progress
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {completionPercentage}%
            </p>
          </div>

          <p className="text-[9px] text-slate-400">
            {submittedFeedback.length} of{" "}
            {attendedParticipants.length} submitted
          </p>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${completionPercentage}%`,
            }}
          />
        </div>
      </div>

      {/* Reminder status */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <Clock3
            size={16}
            className="mt-0.5 shrink-0 text-slate-400"
          />

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 dark:text-white">
              Reminder Status
            </p>

            <p className="mt-1 text-[10px] leading-4 text-slate-500 dark:text-slate-400">
              {reminderState.message}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-wide ${
              reminderState.ready
                ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {reminderState.ready
              ? "Ready"
              : "Waiting"}
          </span>
        </div>
      </div>

      {/* Main action */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() =>
            handleSendReminder()
          }
          disabled={
            !eventEnded ||
            pendingFeedback.length === 0
          }
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={14} />
          Send Pending Reminders
        </button>

        <a
          href={feedbackUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <ExternalLink size={14} />
          Open Feedback Form
        </a>
      </div>

      {/* Participants */}
      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Attendee Feedback
            </h3>

            <p className="mt-1 text-[10px] text-slate-400">
              Only participants marked as attended are included.
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[9px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {attendedParticipants.length} attendees
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {attendedParticipants.length ===
          0 ? (
            <EmptyAttendees />
          ) : (
            attendedParticipants.map(
              (participant) => (
                <ParticipantRow
                  key={participant.id}
                  participant={
                    participant
                  }
                  feedbackUrl={
                    feedbackUrl
                  }
                  onSendReminder={() =>
                    handleSendReminder(
                      participant
                    )
                  }
                  onMarkSubmitted={() =>
                    markFeedbackSubmitted(
                      participant.id
                    )
                  }
                  eventEnded={
                    eventEnded
                  }
                />
              )
            )
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-3 text-[10px] font-semibold text-green-700 dark:border-green-900/40 dark:bg-green-900/10 dark:text-green-400">
          {message}
        </div>
      )}
    </section>
  );
};

/* ----------------------------------
   Statistic card
----------------------------------- */

const StatCard = ({
  icon,
  label,
  value,
  description,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        {icon}
      </div>

      <p className="mt-4 text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>

      <p className="mt-1 truncate text-[9px] text-slate-400">
        {description}
      </p>
    </div>
  );
};

/* ----------------------------------
   Participant row
----------------------------------- */

const ParticipantRow = ({
  participant,
  feedbackUrl,
  onSendReminder,
  onMarkSubmitted,
  eventEnded,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
        {getInitials(
          participant.name
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-800 dark:text-white">
          {participant.name}
        </p>

        <p className="truncate text-[9px] text-slate-400">
          {participant.email}
        </p>
      </div>

      {participant.feedbackSubmitted ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1.5 text-[8px] font-bold text-green-600 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle2 size={11} />
          Feedback Submitted
        </span>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSendReminder}
            disabled={!eventEnded}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-[9px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={11} />
            Remind
          </button>

          <a
            href={feedbackUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[9px] font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ExternalLink size={11} />
            Form
          </a>

          <button
            type="button"
            onClick={onMarkSubmitted}
            className="rounded-lg border border-green-100 px-3 py-2 text-[9px] font-semibold text-green-600 hover:bg-green-50 dark:border-green-900/30 dark:hover:bg-green-900/20"
          >
            Mark Submitted
          </button>
        </div>
      )}
    </div>
  );
};

/* ----------------------------------
   Empty attendees
----------------------------------- */

const EmptyAttendees = () => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <Users
        size={20}
        className="mx-auto text-slate-400"
      />

      <h3 className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
        No attended participants
      </h3>

      <p className="mt-1 text-[9px] text-slate-400">
        Participants marked as attended will appear here.
      </p>
    </div>
  );
};

/* ----------------------------------
   Helpers
----------------------------------- */

const normalizeParticipants = (
  participants
) => {
  return participants.map(
    (participant, index) => ({
      id:
        participant.id ||
        `participant-${index}`,
      name:
        participant.name ||
        "Unknown Participant",
      email:
        participant.email ||
        "",
      attended:
        Boolean(
          participant.attended
        ),
      feedbackSubmitted:
        Boolean(
          participant.feedbackSubmitted
        ),
      feedbackSubmittedAt:
        participant.feedbackSubmittedAt ||
        null,
    })
  );
};

const getEventEnded = (
  eventEndDate,
  now
) => {
  if (!eventEndDate) {
    return false;
  }

  const end = new Date(
    eventEndDate
  );

  if (
    Number.isNaN(
      end.getTime()
    )
  ) {
    return false;
  }

  return now.getTime() >= end.getTime();
};

const getReminderState = ({
  eventEndDate,
  reminderHours,
  now,
  pendingCount,
}) => {
  if (!eventEndDate) {
    return {
      ready: false,
      message:
        "Configure the event end time to determine when feedback reminders should be sent.",
    };
  }

  const end = new Date(
    eventEndDate
  );

  if (
    Number.isNaN(
      end.getTime()
    )
  ) {
    return {
      ready: false,
      message:
        "The configured event end time is invalid.",
    };
  }

  const reminderTime =
    new Date(
      end.getTime() +
        reminderHours *
          60 *
          60 *
          1000
    );

  if (now < end) {
    return {
      ready: false,
      message: `Reminders become available after the event ends. Scheduled reminder: ${formatDate(
        reminderTime
      )}.`,
    };
  }

  if (
    now < reminderTime
  ) {
    return {
      ready: false,
      message: `The reminder is scheduled for ${formatDate(
        reminderTime
      )}.`,
    };
  }

  if (pendingCount === 0) {
    return {
      ready: false,
      message:
        "All attended participants have submitted feedback.",
    };
  }

  return {
    ready: true,
    message: `${pendingCount} participant${
      pendingCount === 1
        ? ""
        : "s"
    } can receive a feedback reminder.`,
  };
};

const formatDate = (
  value
) => {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

const getInitials = (
  name
) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
};

export default EventFeedbackReminder;