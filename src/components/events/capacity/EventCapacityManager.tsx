import React, { useMemo, useState } from "react";

interface EventCapacityManagerProps {
  eventId: string;
  currentCapacity?: number | null;
  registeredCount: number;
  isOrganizer: boolean;
  onCapacityChange?: (
    eventId: string,
    capacity: number
  ) => void;
}

const EventCapacityManager: React.FC<
  EventCapacityManagerProps
> = ({
  eventId,
  currentCapacity = null,
  registeredCount,
  isOrganizer,
  onCapacityChange,
}) => {
  const [capacity, setCapacity] = useState<string>(
    currentCapacity
      ? String(currentCapacity)
      : ""
  );

  const [error, setError] =
    useState<string>("");

  const [success, setSuccess] =
    useState<string>("");

  const remainingSeats = useMemo(() => {
    if (!currentCapacity) {
      return null;
    }

    return Math.max(
      currentCapacity - registeredCount,
      0
    );
  }, [
    currentCapacity,
    registeredCount,
  ]);

  const isFull =
    currentCapacity !== null &&
    currentCapacity !== undefined &&
    registeredCount >= currentCapacity;

  const handleCapacityChange = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const parsedCapacity =
      Number(capacity);

    if (
      !Number.isInteger(
        parsedCapacity
      )
    ) {
      setError(
        "Capacity must be a whole number."
      );
      return;
    }

    if (parsedCapacity <= 0) {
      setError(
        "Capacity must be greater than zero."
      );
      return;
    }

    if (
      parsedCapacity <
      registeredCount
    ) {
      setError(
        `Capacity cannot be lower than the current registration count of ${registeredCount}.`
      );
      return;
    }

    onCapacityChange?.(
      eventId,
      parsedCapacity
    );

    setSuccess(
      "Event capacity updated successfully."
    );
  };

  if (!isOrganizer) {
    return (
      <div
        className="
          rounded-xl
          border
          border-gray-200
          bg-white
          p-5
          shadow-sm
          dark:border-gray-700
          dark:bg-gray-900
        "
      >
        <h3
          className="
            text-lg
            font-semibold
            text-gray-900
            dark:text-white
          "
        >
          Registration Capacity
        </h3>

        {currentCapacity ? (
          <div className="mt-4">
            <div
              className="
                flex
                items-center
                justify-between
                text-sm
              "
            >
              <span
                className="
                  text-gray-600
                  dark:text-gray-300
                "
              >
                Registered
              </span>

              <span
                className="
                  font-semibold
                  text-gray-900
                  dark:text-white
                "
              >
                {registeredCount} /{" "}
                {currentCapacity}
              </span>
            </div>

            <div
              className="
                mt-3
                h-3
                overflow-hidden
                rounded-full
                bg-gray-200
                dark:bg-gray-700
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-blue-600
                  transition-all
                "
                style={{
                  width: `${Math.min(
                    (registeredCount /
                      currentCapacity) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>

            {isFull ? (
              <div
                className="
                  mt-4
                  rounded-lg
                  bg-red-50
                  p-3
                  text-sm
                  font-medium
                  text-red-700
                  dark:bg-red-950/30
                  dark:text-red-300
                "
              >
                Registration is full.
              </div>
            ) : (
              <p
                className="
                  mt-3
                  text-sm
                  text-gray-600
                  dark:text-gray-400
                "
              >
                {remainingSeats}{" "}
                {remainingSeats === 1
                  ? "seat"
                  : "seats"}{" "}
                remaining.
              </p>
            )}
          </div>
        ) : (
          <p
            className="
              mt-3
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            No registration capacity
            has been configured.
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className="
        rounded-xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-sm
        dark:border-gray-700
        dark:bg-gray-900
      "
    >
      <div
        className="
          flex
          flex-col
          gap-2
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <h3
            className="
              text-lg
              font-semibold
              text-gray-900
              dark:text-white
            "
          >
            Registration Capacity
          </h3>

          <p
            className="
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            Control the maximum number
            of participants.
          </p>
        </div>

        <div
          className="
            rounded-lg
            bg-gray-100
            px-4
            py-2
            text-sm
            dark:bg-gray-800
          "
        >
          <span
            className="
              text-gray-500
              dark:text-gray-400
            "
          >
            Registered:
          </span>{" "}
          <span
            className="
              font-semibold
              text-gray-900
              dark:text-white
            "
          >
            {registeredCount}
          </span>
        </div>
      </div>

      <form
        onSubmit={
          handleCapacityChange
        }
        className="mt-6 space-y-4"
      >
        <div>
          <label
            htmlFor="event-capacity"
            className="
              block
              text-sm
              font-medium
              text-gray-700
              dark:text-gray-300
            "
          >
            Maximum Participants
          </label>

          <input
            id="event-capacity"
            type="number"
            min="1"
            value={capacity}
            onChange={(event) =>
              setCapacity(
                event.target.value
              )
            }
            placeholder="Example: 100"
            className="
              mt-2
              w-full
              rounded-lg
              border
              border-gray-300
              bg-white
              px-4
              py-2.5
              text-gray-900
              outline-none
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-500/20
              dark:border-gray-600
              dark:bg-gray-800
              dark:text-white
            "
          />
        </div>

        {currentCapacity && (
          <div
            className="
              rounded-lg
              bg-gray-50
              p-4
              dark:bg-gray-800
            "
          >
            <div
              className="
                flex
                justify-between
                text-sm
              "
            >
              <span
                className="
                  text-gray-600
                  dark:text-gray-400
                "
              >
                Current registrations
              </span>

              <span
                className="
                  font-semibold
                  text-gray-900
                  dark:text-white
                "
              >
                {registeredCount}
              </span>
            </div>

            <div
              className="
                mt-2
                flex
                justify-between
                text-sm
              "
            >
              <span
                className="
                  text-gray-600
                  dark:text-gray-400
                "
              >
                Current capacity
              </span>

              <span
                className="
                  font-semibold
                  text-gray-900
                  dark:text-white
                "
              >
                {currentCapacity}
              </span>
            </div>

            <div
              className="
                mt-2
                flex
                justify-between
                text-sm
              "
            >
              <span
                className="
                  text-gray-600
                  dark:text-gray-400
                "
              >
                Remaining seats
              </span>

              <span
                className="
                  font-semibold
                  text-gray-900
                  dark:text-white
                "
              >
                {remainingSeats}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div
            className="
              rounded-lg
              bg-red-50
              p-3
              text-sm
              text-red-700
              dark:bg-red-950/30
              dark:text-red-300
            "
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="
              rounded-lg
              bg-green-50
              p-3
              text-sm
              text-green-700
              dark:bg-green-950/30
              dark:text-green-300
            "
          >
            {success}
          </div>
        )}

        <button
          type="submit"
          className="
            rounded-lg
            bg-blue-600
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-blue-700
          "
        >
          Save Capacity
        </button>
      </form>
    </div>
  );
};

export default EventCapacityManager;