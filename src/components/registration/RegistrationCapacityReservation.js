import {
  CheckCircle2,
  Clock3,
  LockKeyhole,
  RefreshCw,
  Unlock,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_DURATION_SECONDS = 5 * 60;

const RegistrationCapacityReservation = ({
  capacity = 0,
  registeredCount = 0,
  reservationDuration = DEFAULT_DURATION_SECONDS,
  initialReserved = false,
  onReserve,
  onRelease,
  onExpired,
  onComplete,
  className = "",
}) => {
  const [reserved, setReserved] =
    useState(initialReserved);

  const [remainingSeconds, setRemainingSeconds] =
    useState(
      initialReserved
        ? reservationDuration
        : 0
    );

  const [isProcessing, setIsProcessing] =
    useState(false);

  const availableSeats = useMemo(() => {
    return Math.max(
      0,
      Number(capacity) -
        Number(registeredCount) -
        (reserved ? 1 : 0)
    );
  }, [
    capacity,
    registeredCount,
    reserved,
  ]);

  const hasCapacity =
    Number(capacity) <= 0 ||
    availableSeats > 0 ||
    reserved;

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(
      0,
      Number(seconds) || 0
    );

    const minutes = Math.floor(
      safeSeconds / 60
    );

    const remaining =
      safeSeconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remaining).padStart(
      2,
      "0"
    )}`;
  };

  const releaseReservation = useCallback(
    async (reason = "manual") => {
      setReserved(false);
      setRemainingSeconds(0);

      try {
        await onRelease?.({
          reason,
        });
      } catch (error) {
        console.error(
          "Failed to release registration reservation:",
          error
        );
      }
    },
    [onRelease]
  );

  const reserveSeat = async () => {
    if (isProcessing || reserved) {
      return;
    }

    if (
      Number(capacity) > 0 &&
      availableSeats <= 0
    ) {
      return;
    }

    setIsProcessing(true);

    try {
      const result =
        await onReserve?.({
          durationSeconds:
            reservationDuration,
        });

      if (
        result === false
      ) {
        return;
      }

      setReserved(true);
      setRemainingSeconds(
        reservationDuration
      );
    } catch (error) {
      console.error(
        "Failed to reserve registration slot:",
        error
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const completeRegistration =
    async () => {
      if (!reserved) {
        return;
      }

      setIsProcessing(true);

      try {
        const result =
          await onComplete?.();

        if (result === false) {
          return;
        }

        setReserved(false);
        setRemainingSeconds(0);
      } catch (error) {
        console.error(
          "Failed to complete registration:",
          error
        );
      } finally {
        setIsProcessing(false);
      }
    };

  useEffect(() => {
    if (!reserved) {
      return undefined;
    }

    if (remainingSeconds <= 0) {
      setReserved(false);
      onExpired?.();
      return undefined;
    }

    const timer = setInterval(() => {
      setRemainingSeconds(
        (current) =>
          Math.max(
            0,
            current - 1
          )
      );
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [
    reserved,
    remainingSeconds,
    onExpired,
  ]);

  useEffect(() => {
    if (
      reserved &&
      remainingSeconds === 0
    ) {
      onExpired?.();
    }
  }, [
    reserved,
    remainingSeconds,
    onExpired,
  ]);

  const progress = reserved
    ? Math.max(
        0,
        Math.min(
          100,
          (remainingSeconds /
            reservationDuration) *
            100
        )
      )
    : 0;

  const isUrgent =
    reserved &&
    remainingSeconds <= 60;

  return (
    <section
      aria-label="Registration capacity reservation"
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            reserved
              ? "bg-indigo-100 dark:bg-indigo-900/30"
              : "bg-slate-100 dark:bg-slate-800"
          }`}
        >
          {reserved ? (
            <LockKeyhole
              size={18}
              className="text-indigo-600 dark:text-indigo-400"
            />
          ) : (
            <Users
              size={18}
              className="text-slate-500 dark:text-slate-400"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Registration Capacity
          </h2>

          <p className="mt-1 text-[11px] leading-5 text-slate-400">
            {reserved
              ? "Your registration slot is temporarily reserved."
              : "Reserve a seat while you complete registration."}
          </p>
        </div>
      </div>

      {/* Capacity */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <CapacityCard
          label="Available Seats"
          value={
            reserved
              ? Math.max(
                  0,
                  availableSeats + 1
                )
              : availableSeats
          }
        />

        <CapacityCard
          label="Registered"
          value={
            Number(registeredCount) || 0
          }
        />
      </div>

      {/* Reservation state */}
      {reserved ? (
        <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-900/10">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                isUrgent
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "bg-white dark:bg-slate-800"
              }`}
            >
              <Clock3
                size={17}
                className={
                  isUrgent
                    ? "text-red-600 dark:text-red-400"
                    : "text-indigo-600 dark:text-indigo-400"
                }
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                Seat reserved
              </p>

              <p className="mt-1 text-[11px] text-indigo-700 dark:text-indigo-300">
                Complete your registration before
                the reservation expires.
              </p>

              <div
                className={`mt-3 text-2xl font-bold tabular-nums ${
                  isUrgent
                    ? "text-red-600 dark:text-red-400"
                    : "text-indigo-700 dark:text-indigo-300"
                }`}
                aria-live="polite"
              >
                {formatTime(
                  remainingSeconds
                )}
              </div>

              <p className="mt-1 text-[10px] text-indigo-600/70 dark:text-indigo-300/70">
                Time remaining
              </p>
            </div>
          </div>

          {/* Timer progress */}
          <div className="mt-4">
            <div
              className="h-2 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-950"
              role="progressbar"
              aria-valuenow={
                remainingSeconds
              }
              aria-valuemin="0"
              aria-valuemax={
                reservationDuration
              }
              aria-label="Registration reservation time remaining"
            >
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  isUrgent
                    ? "bg-red-500"
                    : "bg-indigo-600"
                }`}
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {onComplete && (
              <button
                type="button"
                onClick={
                  completeRegistration
                }
                disabled={isProcessing}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2
                  size={14}
                />

                {isProcessing
                  ? "Processing..."
                  : "Complete Registration"}
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                releaseReservation(
                  "manual"
                )
              }
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 px-4 py-2.5 text-xs font-semibold text-indigo-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-slate-800"
            >
              <Unlock
                size={14}
              />
              Release Seat
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
          <div className="flex items-start gap-3">
            <RefreshCw
              size={17}
              className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-400"
            />

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Reserve your seat
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-400">
                A seat will be held for{" "}
                {Math.round(
                  reservationDuration /
                    60
                )}{" "}
                minutes while you complete
                registration.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={reserveSeat}
            disabled={
              isProcessing ||
              !hasCapacity
            }
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
          >
            <LockKeyhole
              size={14}
            />

            {isProcessing
              ? "Reserving..."
              : !hasCapacity
              ? "Registration Full"
              : "Reserve Registration Slot"}
          </button>
        </div>
      )}
    </section>
  );
};

/**
 * Capacity statistic card.
 */
const CapacityCard = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

export default RegistrationCapacityReservation;