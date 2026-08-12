import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const EventRegistrationPauseResumeControl = ({
  eventId = "event-14403",
  eventTitle = "AI & ML Hackathon",
  registeredCount = 82,
  capacity = 100,
  initialPaused = false,
  initialPauseReason = "",
  initialResumeDate = "",
  onStatusChange,
  className = "",
}) => {
  const [isPaused, setIsPaused] =
    useState(initialPaused);

  const [pauseReason, setPauseReason] =
    useState(initialPauseReason);

  const [resumeDate, setResumeDate] =
    useState(initialResumeDate);

  const [showSettings, setShowSettings] =
    useState(false);

  const [notice, setNotice] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const remainingSeats = Math.max(
    capacity - registeredCount,
    0
  );

  const capacityPercentage =
    capacity > 0
      ? Math.min(
          Math.round(
            (registeredCount / capacity) * 100
          ),
          100
        )
      : 0;

  const resumeDateStatus = useMemo(() => {
    if (!resumeDate) {
      return {
        valid: true,
        message:
          "No automatic resume date configured.",
      };
    }

    const selectedDate = new Date(
      resumeDate
    );

    if (
      Number.isNaN(
        selectedDate.getTime()
      )
    ) {
      return {
        valid: false,
        message: "Invalid resume date.",
      };
    }

    if (
      selectedDate.getTime() <=
      Date.now()
    ) {
      return {
        valid: false,
        message:
          "Resume date must be in the future.",
      };
    }

    return {
      valid: true,
      message:
        "Registration can automatically resume on this date.",
    };
  }, [resumeDate]);

  const handlePause = async () => {
    if (!pauseReason.trim()) {
      setNotice(
        "Please provide a reason before pausing registration."
      );
      return;
    }

    if (
      resumeDate &&
      !resumeDateStatus.valid
    ) {
      setNotice(
        resumeDateStatus.message
      );
      return;
    }

    setIsSaving(true);

    const data = {
      eventId,
      eventTitle,
      registrationStatus: "paused",
      isPaused: true,
      pauseReason:
        pauseReason.trim(),
      resumeDate:
        resumeDate || null,
      registeredCount,
      capacity,
      remainingSeats,
    };

    setIsPaused(true);

    await onStatusChange?.(data);

    setNotice(
      "Registration has been temporarily paused."
    );

    setIsSaving(false);
  };

  const handleResume = async () => {
    setIsSaving(true);

    const data = {
      eventId,
      eventTitle,
      registrationStatus: "open",
      isPaused: false,
      pauseReason: "",
      resumeDate: null,
      registeredCount,
      capacity,
      remainingSeats,
    };

    setIsPaused(false);
    setPauseReason("");
    setResumeDate("");

    await onStatusChange?.(data);

    setNotice(
      "Registration has been resumed successfully."
    );

    setIsSaving(false);
  };

  const handleSaveSettings = async () => {
    if (
      isPaused &&
      !pauseReason.trim()
    ) {
      setNotice(
        "Please provide a pause reason."
      );
      return;
    }

    if (
      resumeDate &&
      !resumeDateStatus.valid
    ) {
      setNotice(
        resumeDateStatus.message
      );
      return;
    }

    setIsSaving(true);

    const data = {
      eventId,
      eventTitle,
      registrationStatus: isPaused
        ? "paused"
        : "open",
      isPaused,
      pauseReason: isPaused
        ? pauseReason.trim()
        : "",
      resumeDate:
        isPaused && resumeDate
          ? resumeDate
          : null,
      registeredCount,
      capacity,
      remainingSeats,
    };

    await onStatusChange?.(data);

    setNotice(
      "Registration settings updated successfully."
    );

    setShowSettings(false);
    setIsSaving(false);
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isPaused
                ? "bg-amber-100 dark:bg-amber-900/30"
                : "bg-green-100 dark:bg-green-900/30"
            }`}
          >
            {isPaused ? (
              <Pause
                size={21}
                className="text-amber-600 dark:text-amber-400"
              />
            ) : (
              <Play
                size={21}
                className="text-green-600 dark:text-green-400"
              />
            )}
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Controls
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration Pause / Resume
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Temporarily stop new registrations without
              permanently closing the event.
            </p>
          </div>
        </div>

        {/* Status badge */}
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 ${
            isPaused
              ? "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10"
              : "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
          }`}
        >
          {isPaused ? (
            <Pause
              size={14}
              className="text-amber-600 dark:text-amber-400"
            />
          ) : (
            <CheckCircle2
              size={14}
              className="text-green-600 dark:text-green-400"
            />
          )}

          <span
            className={`text-[8px] font-bold ${
              isPaused
                ? "text-amber-700 dark:text-amber-400"
                : "text-green-700 dark:text-green-400"
            }`}
          >
            {isPaused
              ? "Registration Temporarily Paused"
              : "Registration Open"}
          </span>
        </div>
      </div>

      {/* Notice */}
      {notice && (
        <div
          className={`mt-5 flex items-center gap-3 rounded-xl border px-4 py-3 ${
            notice.toLowerCase().includes("success") ||
            notice.toLowerCase().includes("resumed") ||
            notice.toLowerCase().includes("paused")
              ? "border-green-100 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
              : "border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10"
          }`}
        >
          <Clock3
            size={14}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <p className="flex-1 text-[9px] font-semibold text-slate-700 dark:text-slate-300">
            {notice}
          </p>

          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={<Users size={15} />}
          label="Registered"
          value={registeredCount}
        />

        <SummaryCard
          icon={<Users size={15} />}
          label="Capacity"
          value={capacity}
        />

        <SummaryCard
          icon={<CheckCircle2 size={15} />}
          label="Remaining Seats"
          value={remainingSeats}
        />

        <SummaryCard
          icon={<Clock3 size={15} />}
          label="Capacity Used"
          value={`${capacityPercentage}%`}
        />
      </div>

      {/* User-facing registration status */}
      <div
        className={`mt-5 rounded-2xl border p-4 ${
          isPaused
            ? "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10"
            : "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              isPaused
                ? "bg-amber-100 dark:bg-amber-900/30"
                : "bg-green-100 dark:bg-green-900/30"
            }`}
          >
            {isPaused ? (
              <Pause
                size={16}
                className="text-amber-600 dark:text-amber-400"
              />
            ) : (
              <CheckCircle2
                size={16}
                className="text-green-600 dark:text-green-400"
              />
            )}
          </div>

          <div className="flex-1">
            <h3
              className={`text-xs font-bold ${
                isPaused
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-green-700 dark:text-green-400"
              }`}
            >
              {isPaused
                ? "Registration Temporarily Paused"
                : "Registration is Open"}
            </h3>

            <p className="mt-1 text-[8px] leading-4 text-slate-500 dark:text-slate-400">
              {isPaused
                ? pauseReason ||
                  "New registrations are temporarily unavailable."
                : "Participants can currently register for this event."}
            </p>

            {isPaused &&
              resumeDate && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 dark:bg-slate-950/40">
                  <CalendarClock
                    size={12}
                    className="text-amber-600 dark:text-amber-400"
                  />

                  <span className="text-[8px] font-semibold text-slate-600 dark:text-slate-300">
                    Expected resume:{" "}
                    {formatDateTime(
                      resumeDate
                    )}
                  </span>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              Registration Controls
            </h3>

            <p className="mt-1 text-[8px] leading-4 text-slate-400">
              Pause registrations during reviews, capacity
              management, or event configuration updates.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowSettings(
                (current) => !current
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[8px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          >
            <Settings2 size={13} />
            Configure
          </button>
        </div>

        {/* Settings */}
        {showSettings && (
          <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
            <div className="grid gap-4">
              {/* Pause reason */}
              <div>
                <label
                  htmlFor="pause-reason"
                  className="text-[8px] font-bold uppercase tracking-wide text-slate-400"
                >
                  Pause Reason
                </label>

                <textarea
                  id="pause-reason"
                  value={pauseReason}
                  onChange={(event) =>
                    setPauseReason(
                      event.target.value
                    )
                  }
                  placeholder="Example: Registration is temporarily paused while applications are being reviewed."
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Resume date */}
              <div>
                <label
                  htmlFor="resume-date"
                  className="text-[8px] font-bold uppercase tracking-wide text-slate-400"
                >
                  Optional Resume Date
                </label>

                <input
                  id="resume-date"
                  type="datetime-local"
                  value={resumeDate}
                  onChange={(event) =>
                    setResumeDate(
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

                {resumeDate && (
                  <p
                    className={`mt-2 text-[8px] ${
                      resumeDateStatus.valid
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {resumeDateStatus.message}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                {isPaused ? (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={
                      handleResume
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <Play size={13} />
                    {isSaving
                      ? "Resuming..."
                      : "Resume Registration"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handlePause}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-[8px] font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                  >
                    <Pause size={13} />
                    {isSaving
                      ? "Pausing..."
                      : "Pause Registration"}
                  </button>
                )}

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={
                    handleSaveSettings
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[8px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                >
                  <Settings2 size={13} />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pause details */}
      {isPaused && (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <InfoCard
            icon={<Pause size={15} />}
            title="Pause Reason"
            value={
              pauseReason ||
              "No reason provided"
            }
            description="This message can be displayed to participants on the registration page."
          />

          <InfoCard
            icon={<CalendarClock size={15} />}
            title="Resume Schedule"
            value={
              resumeDate
                ? formatDateTime(
                    resumeDate
                  )
                : "Manual resume"
            }
            description={
              resumeDate
                ? "Registration can be automatically resumed by your backend scheduler."
                : "An organizer must manually resume registration."
            }
          />
        </div>
      )}

      {/* Registration button preview */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
          Participant Registration Button Preview
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-white">
              {eventTitle}
            </p>

            <p className="mt-1 text-[8px] text-slate-400">
              {isPaused
                ? "Participants cannot submit new registrations while paused."
                : "Participants can register normally."}
            </p>
          </div>

          <button
            type="button"
            disabled={isPaused}
            className={`rounded-xl px-5 py-3 text-[8px] font-bold ${
              isPaused
                ? "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {isPaused
              ? "Registration Temporarily Paused"
              : "Register Now"}
          </button>
        </div>
      </div>

      {/* Backend note */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <RotateCcw
          size={15}
          className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
        />

        <div>
          <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
            Backend integration
          </p>

          <p className="mt-1 text-[8px] leading-4 text-slate-400">
            Connect the{" "}
            <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">
              onStatusChange
            </code>{" "}
            callback to your event registration API. If an
            automatic resume date is configured, the backend
            should change the registration status back to
            <strong className="mx-1">
              open
            </strong>
            when that date is reached.
          </p>
        </div>
      </div>
    </section>
  );
};

const SummaryCard = ({
  icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center justify-between">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        {icon}
      </div>

      <span className="text-lg font-bold text-slate-800 dark:text-white">
        {value}
      </span>
    </div>

    <p className="mt-3 text-[8px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>
  </div>
);

const InfoCard = ({
  icon,
  title,
  value,
  description,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
          {title}
        </p>

        <p className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-white">
          {value}
        </p>
      </div>
    </div>

    <p className="mt-3 text-[8px] leading-4 text-slate-400">
      {description}
    </p>
  </div>
);

const formatDateTime = (value) => {
  if (!value) return "Not configured";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default EventRegistrationPauseResumeControl;