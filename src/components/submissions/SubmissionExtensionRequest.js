import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Send,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import {
  createExtensionRequest,
  validateExtensionRequest,
} from "../../utils/submissionExtensionUtils";

const SubmissionExtensionRequest = ({
  event = {},
  user = {},
  team = null,
  submission = null,
  existingRequest = null,
  onSubmit,
  onCancel,
  className = "",
}) => {
  const [reason, setReason] = useState(
    existingRequest?.reason || ""
  );

  const [requestedDeadline, setRequestedDeadline] =
    useState(
      existingRequest?.requestedDeadline || ""
    );

  const [teamInformation, setTeamInformation] =
    useState(
      existingRequest?.teamInformation ||
        getTeamInformation(team)
    );

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [submitted, setSubmitted] = useState(
    Boolean(existingRequest)
  );

  const eventId =
    event.id ??
    event.eventId ??
    event.event_id ??
    "";

  const participantId =
    user.id ??
    user.userId ??
    user.user_id ??
    "";

  const submissionId =
    submission?.id ??
    submission?.submissionId ??
    "";

  const originalDeadline =
    event.submissionDeadline ||
    event.submission_deadline ||
    event.deadline ||
    "";

  const handleSubmit = async (eventObject) => {
    eventObject.preventDefault();

    if (isSubmitting || submitted) {
      return;
    }

    setError("");

    const validation =
      validateExtensionRequest({
        eventId,
        participantId,
        reason,
        requestedDeadline,
        teamInformation,
        originalDeadline,
        submissionId,
      });

    if (!validation.valid) {
      setError(validation.errors.join(" "));
      return;
    }

    setIsSubmitting(true);

    try {
      const request =
        createExtensionRequest({
          eventId,
          participantId,
          submissionId,
          reason,
          requestedDeadline,
          teamInformation,
          originalDeadline,
        });

      await onSubmit?.(request);

      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError?.message ||
          "Unable to submit the extension request."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section
        className={`w-full rounded-2xl border border-green-200 bg-white p-6 shadow-sm dark:border-green-900/50 dark:bg-slate-900 ${className}`}
      >
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2
              size={28}
              className="text-green-600 dark:text-green-400"
            />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-800 dark:text-white">
            Extension Request Submitted
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Your submission deadline extension request has
            been sent to the event organizers for review.
          </p>

          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-left dark:bg-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <Clock3 size={14} />
              Requested deadline
            </div>

            <p className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {formatDateTime(requestedDeadline)}
            </p>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Close
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="border-b border-slate-200 p-5 dark:border-slate-700">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Clock3
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Request Submission Deadline Extension
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Explain why you need additional time and
              suggest a new submission deadline.
            </p>
          </div>
        </div>

        {originalDeadline && (
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-amber-50 p-4 dark:bg-amber-900/10">
            <CalendarDays
              size={18}
              className="shrink-0 text-amber-600 dark:text-amber-400"
            />

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                Current submission deadline
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-white">
                {formatDateTime(originalDeadline)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="p-5"
      >
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-5 text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400"
          >
            <X
              size={17}
              className="mt-0.5 shrink-0"
            />

            <p>{error}</p>
          </div>
        )}

        {/* Reason */}
        <div>
          <label
            htmlFor="extension-reason"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <FileText size={15} />
            Reason for extension *
          </label>

          <p className="mt-1 text-xs text-slate-400">
            Explain the circumstances preventing your team
            from completing the submission on time.
          </p>

          <textarea
            id="extension-reason"
            value={reason}
            onChange={(eventObject) =>
              setReason(
                eventObject.target.value
              )
            }
            rows={5}
            maxLength={2000}
            required
            placeholder="Describe why you need additional time..."
            className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400"
          />

          <p className="mt-1 text-right text-[11px] text-slate-400">
            {reason.length}/2000
          </p>
        </div>

        {/* Requested deadline */}
        <div className="mt-5">
          <label
            htmlFor="requested-deadline"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <CalendarDays size={15} />
            Requested new deadline *
          </label>

          <p className="mt-1 text-xs text-slate-400">
            Select the date and time by which your team
            expects to complete the submission.
          </p>

          <input
            id="requested-deadline"
            type="datetime-local"
            value={requestedDeadline}
            onChange={(eventObject) =>
              setRequestedDeadline(
                eventObject.target.value
              )
            }
            min={getMinimumDeadline(
              originalDeadline
            )}
            required
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400"
          />
        </div>

        {/* Team information */}
        <div className="mt-5">
          <label
            htmlFor="team-information"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <Users size={15} />
            Team information *
          </label>

          <p className="mt-1 text-xs text-slate-400">
            Provide your team name and any information that
            helps organizers identify your submission.
          </p>

          <textarea
            id="team-information"
            value={teamInformation}
            onChange={(eventObject) =>
              setTeamInformation(
                eventObject.target.value
              )
            }
            rows={3}
            maxLength={1000}
            required
            placeholder="Example: Team AquaLeaf — 4 members working on the hardware and AI components."
            className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400"
          />

          <p className="mt-1 text-right text-[11px] text-slate-400">
            {teamInformation.length}/1000
          </p>
        </div>

        {/* Review notice */}
        <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/40 dark:bg-indigo-900/10">
          <div className="flex items-start gap-3">
            <Clock3
              size={17}
              className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
            />

            <div>
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                Organizer review required
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Submitting this request does not automatically
                change your deadline. The organizer must approve
                the request before the new deadline takes effect.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <X size={16} />
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <Send size={16} />

            {isSubmitting
              ? "Submitting..."
              : "Submit Extension Request"}
          </button>
        </div>
      </form>
    </section>
  );
};

/**
 * Build initial team information from
 * common team object structures.
 */
const getTeamInformation = (
  team
) => {
  if (!team) {
    return "";
  }

  if (typeof team === "string") {
    return team;
  }

  const teamName =
    team.name ||
    team.teamName ||
    "";

  const members = Array.isArray(
    team.members
  )
    ? team.members
    : [];

  if (!teamName && !members.length) {
    return "";
  }

  const memberNames = members
    .map(
      (member) =>
        member.name ||
        member.username ||
        member.email
    )
    .filter(Boolean);

  if (!memberNames.length) {
    return teamName;
  }

  return `${teamName || "Team"} — ${memberNames.join(
    ", "
  )}`;
};

/**
 * Prevent selecting a requested deadline
 * before the current deadline.
 */
const getMinimumDeadline = (
  deadline
) => {
  if (!deadline) {
    return undefined;
  }

  const date = new Date(
    deadline
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return undefined;
  }

  const localDate = new Date(
    date.getTime() -
      date.getTimezoneOffset() *
        60000
  );

  return localDate
    .toISOString()
    .slice(0, 16);
};

/**
 * Format date/time for display.
 */
const formatDateTime = (
  value
) => {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

export default SubmissionExtensionRequest;