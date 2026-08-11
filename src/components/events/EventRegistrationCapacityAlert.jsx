import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Settings2,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_THRESHOLDS = [50, 75, 90, 100];

const EventRegistrationCapacityAlert = ({
  totalCapacity = 0,
  registeredCount = 0,
  initialThresholds = DEFAULT_THRESHOLDS,
  onThresholdsChange,
  onAlert,
  className = "",
}) => {
  const [thresholds, setThresholds] =
    useState(initialThresholds);

  const [showSettings, setShowSettings] =
    useState(false);

  const [customThreshold, setCustomThreshold] =
    useState("");

  const safeCapacity = Math.max(
    0,
    Number(totalCapacity) || 0
  );

  const safeRegistered = Math.min(
    safeCapacity,
    Math.max(0, Number(registeredCount) || 0)
  );

  const capacityPercentage =
    safeCapacity === 0
      ? 0
      : Math.round(
          (safeRegistered / safeCapacity) * 100
        );

  const remainingSeats = Math.max(
    0,
    safeCapacity - safeRegistered
  );

  const reachedThresholds = useMemo(
    () =>
      thresholds.filter(
        (threshold) =>
          capacityPercentage >= threshold
      ),
    [thresholds, capacityPercentage]
  );

  const currentThreshold =
    reachedThresholds.length > 0
      ? Math.max(...reachedThresholds)
      : null;

  const currentAlert = getAlertLevel(
    capacityPercentage
  );

  useEffect(() => {
    if (currentThreshold !== null) {
      onAlert?.({
        threshold: currentThreshold,
        percentage: capacityPercentage,
        registeredCount: safeRegistered,
        totalCapacity: safeCapacity,
      });
    }
  }, [
    currentThreshold,
    capacityPercentage,
    safeRegistered,
    safeCapacity,
    onAlert,
  ]);

  const handleThresholdToggle = (
    threshold
  ) => {
    const updated = thresholds.includes(
      threshold
    )
      ? thresholds.filter(
          (item) => item !== threshold
        )
      : [...thresholds, threshold].sort(
          (a, b) => a - b
        );

    setThresholds(updated);
    onThresholdsChange?.(updated);
  };

  const addCustomThreshold = () => {
    const value = Number(
      customThreshold
    );

    if (
      !Number.isFinite(value) ||
      value <= 0 ||
      value > 100 ||
      thresholds.includes(value)
    ) {
      return;
    }

    const updated = [
      ...thresholds,
      value,
    ].sort((a, b) => a - b);

    setThresholds(updated);
    onThresholdsChange?.(updated);
    setCustomThreshold("");
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Bell
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Alerts
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration Capacity
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Monitor registration levels and receive capacity
              alerts.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowSettings(
              (value) => !value
            )
          }
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[8px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <Settings2 size={13} />
          Configure Alerts
        </button>
      </div>

      {/* Capacity overview */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center self-center sm:self-auto">
            <svg
              viewBox="0 0 120 120"
              className="h-32 w-32 -rotate-90"
            >
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="9"
                className="text-slate-100 dark:text-slate-800"
              />

              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray="314"
                strokeDashoffset={
                  314 -
                  (314 *
                    Math.min(
                      100,
                      capacityPercentage
                    )) /
                    100
                }
                className={
                  currentAlert.color
                }
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {capacityPercentage}%
              </span>

              <span className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                Filled
              </span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                  Registrations
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
                  {safeRegistered} /{" "}
                  {safeCapacity}
                </p>
              </div>

              <span
                className={`text-[9px] font-bold ${currentAlert.textColor}`}
              >
                {currentAlert.label}
              </span>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${currentAlert.barColor}`}
                style={{
                  width: `${Math.min(
                    100,
                    capacityPercentage
                  )}%`,
                }}
              />
            </div>

            <div className="mt-3 flex justify-between text-[7px] text-slate-400">
              <span>0</span>

              <span>
                {remainingSeats} seats remaining
              </span>

              <span>
                {safeCapacity}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current alert */}
      {currentThreshold !== null && (
        <div
          className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 ${currentAlert.alertBackground} ${currentAlert.alertBorder}`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${currentAlert.iconBackground}`}
          >
            {capacityPercentage >= 100 ? (
              <AlertTriangle
                size={17}
                className={currentAlert.textColor}
              />
            ) : (
              <Bell
                size={17}
                className={currentAlert.textColor}
              />
            )}
          </div>

          <div className="flex-1">
            <p
              className={`text-[9px] font-bold ${currentAlert.textColor}`}
            >
              {currentThreshold}% Capacity Alert
            </p>

            <p
              className={`mt-1 text-[8px] leading-4 ${currentAlert.descriptionColor}`}
            >
              {getAlertMessage(
                currentThreshold,
                capacityPercentage,
                remainingSeats
              )}
            </p>
          </div>
        </div>
      )}

      {/* Threshold progress */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {thresholds.map(
          (threshold) => {
            const reached =
              capacityPercentage >=
              threshold;

            return (
              <div
                key={threshold}
                className={`rounded-2xl border p-4 ${
                  reached
                    ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900/40 dark:bg-indigo-900/10"
                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-lg font-bold ${
                      reached
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {threshold}%
                  </span>

                  {reached ? (
                    <CheckCircle2
                      size={15}
                      className="text-green-500"
                    />
                  ) : (
                    <Bell
                      size={14}
                      className="text-slate-300"
                    />
                  )}
                </div>

                <p className="mt-2 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                  {reached
                    ? "Reached"
                    : "Not reached"}
                </p>
              </div>
            );
          }
        )}
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <Settings2 size={16} />
            </div>

            <div>
              <p className="text-[9px] font-bold text-slate-800 dark:text-white">
                Capacity Alert Thresholds
              </p>

              <p className="mt-1 text-[7px] leading-4 text-slate-400">
                Choose when organizers should be alerted.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DEFAULT_THRESHOLDS.map(
              (threshold) => (
                <ThresholdButton
                  key={threshold}
                  threshold={threshold}
                  active={thresholds.includes(
                    threshold
                  )}
                  onClick={() =>
                    handleThresholdToggle(
                      threshold
                    )
                  }
                />
              )
            )}
          </div>

          {/* Custom threshold */}
          <div className="mt-5">
            <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Add Custom Threshold
            </p>

            <div className="mt-2 flex gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={customThreshold}
                onChange={(event) =>
                  setCustomThreshold(
                    event.target.value
                  )
                }
                placeholder="e.g. 85"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />

              <button
                type="button"
                onClick={
                  addCustomThreshold
                }
                className="rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Users size={16} />
        </div>

        <div className="flex-1">
          <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
            Registration Summary
          </p>

          <p className="mt-1 text-[7px] text-slate-400">
            {safeRegistered} participants registered,
            {remainingSeats} spots remaining.
          </p>
        </div>

        <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
          {reachedThresholds.length} alert
          {reachedThresholds.length === 1
            ? ""
            : "s"}{" "}
          reached
        </span>
      </div>
    </section>
  );
};

const ThresholdButton = ({
  threshold,
  active,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-xl border px-3 py-3 text-[8px] font-bold transition ${
      active
        ? "border-indigo-600 bg-indigo-600 text-white"
        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400"
    }`}
  >
    {threshold}% capacity
  </button>
);

const getAlertLevel = (
  percentage
) => {
  if (percentage >= 100) {
    return {
      label: "Full",
      color: "text-red-500",
      textColor: "text-red-600 dark:text-red-400",
      descriptionColor:
        "text-red-600/80 dark:text-red-400/80",
      barColor: "bg-red-500",
      alertBackground:
        "bg-red-50 dark:bg-red-900/10",
      alertBorder:
        "border-red-200 dark:border-red-900/30",
      iconBackground:
        "bg-red-100 dark:bg-red-900/20",
    };
  }

  if (percentage >= 90) {
    return {
      label: "Critical",
      color: "text-orange-500",
      textColor:
        "text-orange-600 dark:text-orange-400",
      descriptionColor:
        "text-orange-600/80 dark:text-orange-400/80",
      barColor: "bg-orange-500",
      alertBackground:
        "bg-orange-50 dark:bg-orange-900/10",
      alertBorder:
        "border-orange-200 dark:border-orange-900/30",
      iconBackground:
        "bg-orange-100 dark:bg-orange-900/20",
    };
  }

  if (percentage >= 75) {
    return {
      label: "High",
      color: "text-amber-500",
      textColor:
        "text-amber-600 dark:text-amber-400",
      descriptionColor:
        "text-amber-600/80 dark:text-amber-400/80",
      barColor: "bg-amber-500",
      alertBackground:
        "bg-amber-50 dark:bg-amber-900/10",
      alertBorder:
        "border-amber-200 dark:border-amber-900/30",
      iconBackground:
        "bg-amber-100 dark:bg-amber-900/20",
    };
  }

  if (percentage >= 50) {
    return {
      label: "Moderate",
      color: "text-indigo-500",
      textColor:
        "text-indigo-600 dark:text-indigo-400",
      descriptionColor:
        "text-indigo-600/80 dark:text-indigo-400/80",
      barColor: "bg-indigo-500",
      alertBackground:
        "bg-indigo-50 dark:bg-indigo-900/10",
      alertBorder:
        "border-indigo-200 dark:border-indigo-900/30",
      iconBackground:
        "bg-indigo-100 dark:bg-indigo-900/20",
    };
  }

  return {
    label: "Normal",
    color: "text-green-500",
    textColor:
      "text-green-600 dark:text-green-400",
    descriptionColor:
      "text-green-600/80 dark:text-green-400/80",
    barColor: "bg-green-500",
    alertBackground:
      "bg-green-50 dark:bg-green-900/10",
    alertBorder:
      "border-green-200 dark:border-green-900/30",
    iconBackground:
      "bg-green-100 dark:bg-green-900/20",
  };
};

const getAlertMessage = (
  threshold,
  percentage,
  remainingSeats
) => {
  if (percentage >= 100) {
    return "Registration capacity has been reached. Consider closing registration or increasing the event capacity.";
  }

  if (threshold >= 90) {
    return `Registration has reached ${percentage}% capacity. Only ${remainingSeats} spot${
      remainingSeats === 1
        ? ""
        : "s"
    } remain.`;
  }

  if (threshold >= 75) {
    return `Registration has reached ${percentage}% capacity. The event is approaching its maximum capacity.`;
  }

  return `Registration has reached ${percentage}% capacity. Consider monitoring remaining availability.`;
};

export default EventRegistrationCapacityAlert;