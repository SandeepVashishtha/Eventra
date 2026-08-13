import React, { useEffect, useMemo, useState } from "react";

interface EventCapacityIndicatorProps {
  capacity: number;
  registeredCount: number;
  showRegisteredCount?: boolean;
  nearlyFullThreshold?: number;
  onCapacityChange?: (data: {
    capacity: number;
    registeredCount: number;
    remainingSeats: number;
    percentageFull: number;
    isFull: boolean;
  }) => void;
}

const EventCapacityIndicator: React.FC<
  EventCapacityIndicatorProps
> = ({
  capacity,
  registeredCount,
  showRegisteredCount = true,
  nearlyFullThreshold = 80,
  onCapacityChange,
}) => {
  const [currentRegisteredCount, setCurrentRegisteredCount] =
    useState(Math.max(0, registeredCount));

  /*
   * Update the displayed registration count whenever
   * the parent provides a new registration count.
   */
  useEffect(() => {
    setCurrentRegisteredCount(
      Math.max(0, registeredCount)
    );
  }, [registeredCount]);

  const capacityData = useMemo(() => {
    const safeCapacity = Math.max(0, capacity);

    const safeRegisteredCount = Math.min(
      Math.max(0, currentRegisteredCount),
      safeCapacity
    );

    const remainingSeats = Math.max(
      safeCapacity - safeRegisteredCount,
      0
    );

    const percentageFull =
      safeCapacity > 0
        ? Math.min(
            Math.round(
              (safeRegisteredCount / safeCapacity) * 100
            ),
            100
          )
        : 0;

    const isFull =
      safeCapacity > 0 &&
      safeRegisteredCount >= safeCapacity;

    const isNearlyFull =
      !isFull &&
      safeCapacity > 0 &&
      percentageFull >= nearlyFullThreshold;

    return {
      capacity: safeCapacity,
      registeredCount: safeRegisteredCount,
      remainingSeats,
      percentageFull,
      isFull,
      isNearlyFull,
    };
  }, [
    capacity,
    currentRegisteredCount,
    nearlyFullThreshold,
  ]);

  /*
   * Notify the parent whenever the calculated
   * capacity state changes.
   */
  useEffect(() => {
    onCapacityChange?.({
      capacity: capacityData.capacity,
      registeredCount:
        capacityData.registeredCount,
      remainingSeats:
        capacityData.remainingSeats,
      percentageFull:
        capacityData.percentageFull,
      isFull: capacityData.isFull,
    });
  }, [
    capacityData,
    onCapacityChange,
  ]);

  /*
   * No capacity configured.
   */
  if (capacityData.capacity === 0) {
    return (
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl dark:bg-gray-800">
            👥
          </div>

          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Event Capacity
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Registration capacity information is not
              available for this event.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
              capacityData.isFull
                ? "bg-red-100 dark:bg-red-950"
                : capacityData.isNearlyFull
                ? "bg-orange-100 dark:bg-orange-950"
                : "bg-blue-100 dark:bg-blue-950"
            }`}
          >
            {capacityData.isFull
              ? "🚫"
              : capacityData.isNearlyFull
              ? "⚠️"
              : "👥"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Registration Capacity
            </p>

            <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
              {capacityData.isFull
                ? "Event is Full"
                : `${capacityData.remainingSeats} ${
                    capacityData.remainingSeats === 1
                      ? "seat"
                      : "seats"
                  } remaining`}
            </h2>

            {showRegisteredCount && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {capacityData.registeredCount.toLocaleString()}{" "}
                of{" "}
                {capacityData.capacity.toLocaleString()}{" "}
                registrations filled
              </p>
            )}
          </div>

          <div className="shrink-0 text-right">
            <span
              className={`text-2xl font-bold ${
                capacityData.isFull
                  ? "text-red-600 dark:text-red-400"
                  : capacityData.isNearlyFull
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            >
              {capacityData.percentageFull}%
            </span>

            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
              Filled
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="p-5 sm:p-6">
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
          aria-label={`${capacityData.percentageFull}% of event capacity filled`}
          role="progressbar"
          aria-valuenow={capacityData.percentageFull}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              capacityData.isFull
                ? "bg-red-600"
                : capacityData.isNearlyFull
                ? "bg-orange-500"
                : "bg-blue-600"
            }`}
            style={{
              width: `${capacityData.percentageFull}%`,
            }}
          />
        </div>

        {/* Status */}
        {capacityData.isFull ? (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
            <span className="text-lg">
              🚫
            </span>

            <div>
              <h3 className="text-sm font-bold text-red-800 dark:text-red-300">
                Registration is full
              </h3>

              <p className="mt-1 text-xs leading-5 text-red-700 dark:text-red-400">
                All available registration slots have
                been filled. New registrations are not
                currently available.
              </p>
            </div>
          </div>
        ) : capacityData.isNearlyFull ? (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/40">
            <span className="text-lg">
              ⚠️
            </span>

            <div>
              <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300">
                Almost full
              </h3>

              <p className="mt-1 text-xs leading-5 text-orange-700 dark:text-orange-400">
                Registration is filling quickly. Only{" "}
                <strong>
                  {capacityData.remainingSeats}
                </strong>{" "}
                {capacityData.remainingSeats === 1
                  ? "seat"
                  : "seats"}{" "}
                remain.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/40">
            <span className="text-lg">
              ✓
            </span>

            <div>
              <h3 className="text-sm font-bold text-green-800 dark:text-green-300">
                Seats available
              </h3>

              <p className="mt-1 text-xs leading-5 text-green-700 dark:text-green-400">
                There are{" "}
                <strong>
                  {capacityData.remainingSeats}
                </strong>{" "}
                available{" "}
                {capacityData.remainingSeats === 1
                  ? "seat"
                  : "seats"}{" "}
                for this event.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <span className="text-lg">
            🔄
          </span>

          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Registration capacity updates automatically
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
              The indicator reflects the latest registration
              count supplied by the event system.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventCapacityIndicator;