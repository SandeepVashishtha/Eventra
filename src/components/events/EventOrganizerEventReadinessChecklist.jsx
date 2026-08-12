import {
  AlertCircle,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Info,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_EVENT = {
  title: "AI Hackathon 2026",
  description:
    "A collaborative hackathon focused on artificial intelligence and emerging technologies.",
  date: "August 30, 2026",
  startTime: "09:00 AM",
  endTime: "06:00 PM",
  venue: "Marwadi University",
  meetingLink: "",
  registrationDeadline: "August 25, 2026",
  capacity: 100,
  eligibility:
    "Open to undergraduate and postgraduate students.",
  registrationForm: true,
  organizerName: "Eventra Organizing Team",
};

const EventOrganizerEventReadinessChecklist = ({
  event = DEFAULT_EVENT,
  onPublish,
}) => {
  const [showAll, setShowAll] = useState(true);

  const checklist = useMemo(() => {
    return [
      {
        id: "title",
        label: "Event title",
        description: "A clear title is required.",
        completed: Boolean(event.title?.trim()),
        critical: true,
      },
      {
        id: "description",
        label: "Event description",
        description: "Provide details about the event.",
        completed: Boolean(event.description?.trim()),
        critical: true,
      },
      {
        id: "date-time",
        label: "Date and time",
        description: "Set a valid event date and schedule.",
        completed:
          Boolean(event.date) &&
          Boolean(event.startTime) &&
          Boolean(event.endTime),
        critical: true,
      },
      {
        id: "venue",
        label: "Venue or meeting link",
        description:
          "Provide a physical venue or online meeting link.",
        completed:
          Boolean(event.venue?.trim()) ||
          Boolean(event.meetingLink?.trim()),
        critical: true,
      },
      {
        id: "deadline",
        label: "Registration deadline",
        description:
          "Participants need a clear registration deadline.",
        completed: Boolean(
          event.registrationDeadline
        ),
        critical: true,
      },
      {
        id: "capacity",
        label: "Participant capacity",
        description:
          "Set the maximum number of participants.",
        completed:
          Number.isFinite(Number(event.capacity)) &&
          Number(event.capacity) > 0,
        critical: true,
      },
      {
        id: "eligibility",
        label: "Eligibility requirements",
        description:
          "Define who can participate in the event.",
        completed: Boolean(
          event.eligibility?.trim()
        ),
        critical: false,
      },
      {
        id: "registration-form",
        label: "Registration form",
        description:
          "Configure the participant registration form.",
        completed: Boolean(event.registrationForm),
        critical: true,
      },
      {
        id: "organizer",
        label: "Organizer information",
        description:
          "Provide organizer or contact information.",
        completed: Boolean(
          event.organizerName?.trim()
        ),
        critical: true,
      },
    ];
  }, [event]);

  const completedItems = checklist.filter(
    (item) => item.completed
  );

  const missingItems = checklist.filter(
    (item) => !item.completed
  );

  const readinessScore = Math.round(
    (completedItems.length / checklist.length) * 100
  );

  const criticalMissingItems = missingItems.filter(
    (item) => item.critical
  );

  const canPublish =
    criticalMissingItems.length === 0;

  const handlePublish = () => {
    if (!canPublish) {
      setShowAll(true);
      return;
    }

    if (onPublish) {
      onPublish(event);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <ClipboardCheck size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Tools
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Event Readiness Checklist
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Check whether your event contains all required
              information before publishing it.
            </p>
          </div>
        </div>

        <div
          className={`rounded-2xl border px-5 py-4 text-center ${
            readinessScore === 100
              ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
              : readinessScore >= 70
              ? "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10"
              : "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10"
          }`}
        >
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Event Readiness
          </p>

          <p
            className={`mt-1 text-2xl font-black ${
              readinessScore === 100
                ? "text-green-600 dark:text-green-400"
                : readinessScore >= 70
                ? "text-amber-600 dark:text-amber-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {readinessScore}%
          </p>
        </div>
      </div>

      {/* Event Name */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          Event Being Evaluated
        </p>

        <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
          {event.title || "Untitled Event"}
        </h3>
      </div>

      {/* Progress */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Readiness Progress
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              {completedItems.length} of{" "}
              {checklist.length} requirements completed
            </p>
          </div>

          <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400">
            {completedItems.length}/{checklist.length}
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              readinessScore === 100
                ? "bg-green-500"
                : readinessScore >= 70
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
            style={{
              width: `${readinessScore}%`,
            }}
          />
        </div>
      </div>

      {/* Critical Warning */}
      {criticalMissingItems.length > 0 && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
            />

            <div>
              <h3 className="text-[8px] font-bold text-red-700 dark:text-red-400">
                Event is not ready to publish
              </h3>

              <p className="mt-1 text-[7px] leading-4 text-red-600 dark:text-red-500">
                Complete the following critical requirements
                before publishing this event:
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {criticalMissingItems.map((item) => (
                  <span
                    key={item.id}
                    className="rounded-lg bg-white px-2.5 py-2 text-[6px] font-bold text-red-600 dark:bg-slate-900 dark:text-red-400"
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ready Message */}
      {canPublish && (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
          <div className="flex items-center gap-3">
            <CheckCircle2
              size={20}
              className="text-green-600 dark:text-green-400"
            />

            <div>
              <h3 className="text-[8px] font-bold text-green-700 dark:text-green-400">
                Event is ready to publish
              </h3>

              <p className="mt-1 text-[6px] text-green-600 dark:text-green-500">
                All critical event requirements have been
                completed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Header */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Publication Checklist
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Review every requirement before publishing.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-[7px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {showAll ? "Hide details" : "Show details"}
        </button>
      </div>

      {/* Checklist */}
      {showAll && (
        <div className="mt-4 space-y-3">
          {checklist.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
            />
          ))}
        </div>
      )}

      {/* Missing Summary */}
      {missingItems.length > 0 && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Info
              size={14}
              className="text-indigo-500"
            />

            <h4 className="text-[8px] font-bold text-slate-800 dark:text-white">
              Items still needing attention
            </h4>
          </div>

          <div className="mt-3 space-y-2">
            {missingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2"
              >
                <X
                  size={12}
                  className={
                    item.critical
                      ? "text-red-500"
                      : "text-amber-500"
                  }
                />

                <span className="text-[7px] text-slate-600 dark:text-slate-300">
                  {item.label}
                </span>

                {item.critical && (
                  <span className="rounded-full bg-red-50 px-2 py-1 text-[5px] font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    Required
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publish */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handlePublish}
          disabled={!canPublish}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[8px] font-bold transition ${
            canPublish
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
          }`}
        >
          {canPublish ? (
            <>
              <Check size={14} />
              Publish Event
            </>
          ) : (
            <>
              <AlertCircle size={14} />
              Complete Required Items
            </>
          )}
        </button>

        {!canPublish && (
          <p className="mt-2 text-center text-[6px] text-slate-400">
            Critical requirements must be completed before
            publication.
          </p>
        )}
      </div>
    </section>
  );
};

/* --------------------------------
   Checklist Item
--------------------------------- */

const ChecklistItem = ({ item }) => {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        item.completed
          ? "border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10"
          : item.critical
          ? "border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10"
          : "border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            item.completed
              ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : item.critical
              ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
              : "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
          }`}
        >
          {item.completed ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-[8px] font-bold text-slate-800 dark:text-white">
              {item.label}
            </h4>

            {item.critical && (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[5px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                Required
              </span>
            )}

            <span
              className={`rounded-full px-2 py-1 text-[5px] font-bold ${
                item.completed
                  ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {item.completed ? "Complete" : "Missing"}
            </span>
          </div>

          <p className="mt-1 text-[7px] leading-4 text-slate-500 dark:text-slate-400">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventOrganizerEventReadinessChecklist;