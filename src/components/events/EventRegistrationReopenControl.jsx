import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Users,
  XCircle,
  RotateCcw,
  Settings2,
} from "lucide-react";
import { useMemo, useState } from "react";

const EventRegistrationReopenControl = ({
  eventId = "event-14296",
  eventTitle = "AI & ML Hackathon",
  originalDeadline = "2026-08-10T23:59",
  originalCapacity = 100,
  registeredCount = 82,
  initialReopened = false,
  initialReopenDeadline = "",
  initialAdditionalCapacity = 20,
  onRegistrationChange,
  className = "",
}) => {
  const [isReopened, setIsReopened] =
    useState(initialReopened);

  const [reopenDeadline, setReopenDeadline] =
    useState(initialReopenDeadline);

  const [additionalCapacity, setAdditionalCapacity] =
    useState(initialAdditionalCapacity);

  const [notice, setNotice] = useState("");

  const [showSettings, setShowSettings] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const currentCapacity =
    originalCapacity + Number(additionalCapacity || 0);

  const remainingSeats = Math.max(
    currentCapacity - registeredCount,
    0
  );

  const capacityPercentage =
    currentCapacity > 0
      ? Math.min(
          Math.round(
            (registeredCount / currentCapacity) * 100
          ),
          100
        )
      : 0;

  const deadlineStatus = useMemo(() => {
    if (!reopenDeadline) {
      return {
        valid: false,
        message: "No reopening deadline configured.",
      };
    }

    const deadline = new Date(
      reopenDeadline
    ).getTime();

    if (Number.isNaN(deadline)) {
      return {
        valid: false,
        message: "Invalid reopening deadline.",
      };
    }

    if (deadline <= Date.now()) {
      return {
        valid: false,
        message:
          "The reopening deadline has already passed.",
      };
    }

    return {
      valid: true,
      message: "Registration will close automatically.",
    };
  }, [reopenDeadline]);

  const handleReopenRegistration = async () => {
    if (!reopenDeadline) {
      setNotice(
        "Please select a new registration closing deadline."
      );
      return;
    }

    if (!deadlineStatus.valid) {
      setNotice(deadlineStatus.message);
      return;
    }

    if (
      Number(additionalCapacity) < 0 ||
      Number.isNaN(Number(additionalCapacity))
    ) {
      setNotice(
        "Additional capacity must be a valid number."
      );
      return;
    }

    setIsSaving(true);

    const updatedData = {
      eventId,
      eventTitle,
      registrationReopened: true,
      reopenDeadline,
      additionalCapacity:
        Number(additionalCapacity),
      totalCapacity: currentCapacity,
      registeredCount,
      remainingSeats,
    };

    setIsReopened(true);

    await onRegistrationChange?.(updatedData);

    setNotice(
      "Registration has been reopened successfully."
    );

    setIsSaving(false);
  };

  const handleCloseRegistration = async () => {
    setIsSaving(true);

    const updatedData = {
      eventId,
      eventTitle,
      registrationReopened: false,
      reopenDeadline: null,
      additionalCapacity: 0,
    };

    setIsReopened(false);

    await onRegistrationChange?.(updatedData);

    setNotice(
      "Registration has been closed again."
    );

    setIsSaving(false);
  };

  const handleSaveSettings = async () => {
    if (!reopenDeadline) {
      setNotice(
        "Please select a reopening deadline."
      );
      return;
    }

    if (!deadlineStatus.valid) {
      setNotice(deadlineStatus.message);
      return;
    }

    setIsSaving(true);

    const updatedData = {
      eventId,
      eventTitle,
      registrationReopened: isReopened,
      reopenDeadline,
      additionalCapacity:
        Number(additionalCapacity),
      totalCapacity: currentCapacity,
    };

    await onRegistrationChange?.(updatedData);

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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <RotateCcw
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Controls
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration Reopen Control
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Temporarily reopen event registration after
              the original deadline while keeping control
              over capacity and the new closing deadline.
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 ${
            isReopened
              ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
              : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
          }`}
        >
          {isReopened ? (
            <CheckCircle2
              size={14}
              className="text-green-600 dark:text-green-400"
            />
          ) : (
            <XCircle
              size={14}
              className="text-slate-400"
            />
          )}

          <span
            className={`text-[8px] font-bold ${
              isReopened
                ? "text-green-700 dark:text-green-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {isReopened
              ? "Registration Reopened"
              : "Registration Closed"}
          </span>
        </div>
      </div>

      {/* Notification */}
      {notice && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <CalendarClock
            size={14}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <p className="flex-1 text-[9px] font-semibold text-indigo-700 dark:text-indigo-300">
            {notice}
          </p>

          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-indigo-400"
          >
            ×
          </button>
        </div>
      )}

      {/* Registration status */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={<Users size={15} />}
          label="Registered"
          value={registeredCount}
        />

        <SummaryCard
          icon={<Users size={15} />}
          label="Total Capacity"
          value={currentCapacity}
        />

        <SummaryCard
          icon={<CheckCircle2 size={15} />}
          label="Available Seats"
          value={remainingSeats}
        />

        <SummaryCard
          icon={<Clock3 size={15} />}
          label="Capacity Used"
          value={`${capacityPercentage}%`}
        />
      </div>

      {/* Capacity progress */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
              Registration Capacity
            </p>

            <p className="mt-1 text-[8px] text-slate-400">
              {registeredCount} of {currentCapacity} seats
              currently registered
            </p>
          </div>

          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {capacityPercentage}%
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{
              width: `${capacityPercentage}%`,
            }}
          />
        </div>
      </div>

      {/* Original deadline */}
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <InfoCard
          icon={<Clock3 size={15} />}
          title="Original Deadline"
          value={formatDateTime(
            originalDeadline
          )}
          description="The original registration deadline remains unchanged."
        />

        <InfoCard
          icon={<Users size={15} />}
          title="Original Capacity"
          value={`${originalCapacity} participants`}
          description="Additional capacity can be configured when reopening."
        />
      </div>

      {/* Reopen controls */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              Registration Controls
            </h3>

            <p className="mt-1 text-[8px] leading-4 text-slate-400">
              Reopen registration and define a temporary
              deadline and additional capacity.
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

        {showSettings && (
          <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Deadline */}
              <div>
                <label
                  htmlFor="reopen-deadline"
                  className="text-[8px] font-bold uppercase tracking-wide text-slate-400"
                >
                  New Closing Deadline
                </label>

                <input
                  id="reopen-deadline"
                  type="datetime-local"
                  value={reopenDeadline}
                  onChange={(event) =>
                    setReopenDeadline(
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

                {reopenDeadline && (
                  <p
                    className={`mt-2 text-[8px] ${
                      deadlineStatus.valid
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {deadlineStatus.message}
                  </p>
                )}
              </div>

              {/* Additional capacity */}
              <div>
                <label
                  htmlFor="additional-capacity"
                  className="text-[8px] font-bold uppercase tracking-wide text-slate-400"
                >
                  Additional Capacity
                </label>

                <input
                  id="additional-capacity"
                  type="number"
                  min="0"
                  value={additionalCapacity}
                  onChange={(event) =>
                    setAdditionalCapacity(
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

                <p className="mt-2 text-[8px] text-slate-400">
                  New total capacity:{" "}
                  <strong>
                    {currentCapacity}
                  </strong>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              {isReopened && (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={
                    handleCloseRegistration
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[8px] font-bold text-red-600 hover:bg-red-100 disabled:opacity-50 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400"
                >
                  <XCircle size={13} />
                  Close Registration
                </button>
              )}

              <button
                type="button"
                disabled={isSaving}
                onClick={
                  handleSaveSettings
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[8px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
              >
                <Settings2 size={13} />
                Save Settings
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={
                  handleReopenRegistration
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <RotateCcw size={13} />
                {isSaving
                  ? "Saving..."
                  : "Reopen Registration"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active reopening state */}
      {isReopened && (
        <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
              <CheckCircle2
                size={16}
                className="text-green-600 dark:text-green-400"
              />
            </div>

            <div className="flex-1">
              <h3 className="text-xs font-bold text-green-700 dark:text-green-400">
                Registration Reopened
              </h3>

              <p className="mt-1 text-[8px] leading-4 text-green-600 dark:text-green-300">
                Participants can register again until the
                configured reopening deadline.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <StatusItem
                  label="New Deadline"
                  value={formatDateTime(
                    reopenDeadline
                  )}
                />

                <StatusItem
                  label="Additional Seats"
                  value={`+${additionalCapacity}`}
                />

                <StatusItem
                  label="Remaining Seats"
                  value={remainingSeats}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Automatic close information */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <Clock3
          size={15}
          className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
        />

        <div>
          <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
            Automatic Registration Closure
          </p>

          <p className="mt-1 text-[8px] leading-4 text-slate-400">
            Once the new deadline is reached, registration
            should automatically return to the closed state.
            The frontend state here is ready to be connected
            to your backend scheduler or event-status API.
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

      <div>
        <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
          {title}
        </p>

        <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
          {value}
        </p>
      </div>
    </div>

    <p className="mt-3 text-[8px] leading-4 text-slate-400">
      {description}
    </p>
  </div>
);

const StatusItem = ({
  label,
  value,
}) => (
  <div className="rounded-xl bg-white/70 p-3 dark:bg-slate-950/40">
    <p className="text-[7px] font-bold uppercase tracking-wide text-green-600 dark:text-green-400">
      {label}
    </p>

    <p className="mt-1 text-[9px] font-bold text-green-700 dark:text-green-300">
      {value}
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

export default EventRegistrationReopenControl;