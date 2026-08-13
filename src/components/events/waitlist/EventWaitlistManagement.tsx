import React, { useMemo, useState } from "react";

interface WaitlistUser {
  id: string | number;
  name: string;
  joinedAt: string;
  status?: "waiting" | "offered" | "registered";
}

interface EventWaitlistManagementProps {
  eventId: string | number;
  eventName: string;
  capacity: number;
  registeredCount: number;
  currentUserId?: string | number;
  initialWaitlist?: WaitlistUser[];
  onJoinWaitlist?: (eventId: string | number) => void;
  onLeaveWaitlist?: (eventId: string | number) => void;
}

const EventWaitlistManagement: React.FC<
  EventWaitlistManagementProps
> = ({
  eventId,
  eventName,
  capacity,
  registeredCount,
  currentUserId,
  initialWaitlist = [],
  onJoinWaitlist,
  onLeaveWaitlist,
}) => {
  const [waitlist, setWaitlist] =
    useState<WaitlistUser[]>(initialWaitlist);

  const [isJoining, setIsJoining] =
    useState(false);

  const [isLeaving, setIsLeaving] =
    useState(false);

  const [showLeaveConfirmation, setShowLeaveConfirmation] =
    useState(false);

  const [notification, setNotification] =
    useState("");

  const availableSeats = Math.max(
    capacity - registeredCount,
    0
  );

  const isFull = availableSeats === 0;

  const currentUserEntry = useMemo(() => {
    return waitlist.find(
      (user) =>
        String(user.id) === String(currentUserId)
    );
  }, [waitlist, currentUserId]);

  const isOnWaitlist = Boolean(currentUserEntry);

  const currentPosition = useMemo(() => {
    if (!currentUserEntry) {
      return null;
    }

    const waitingUsers = waitlist.filter(
      (user) => user.status === "waiting"
    );

    const index = waitingUsers.findIndex(
      (user) =>
        String(user.id) ===
        String(currentUserId)
    );

    return index >= 0 ? index + 1 : null;
  }, [waitlist, currentUserEntry, currentUserId]);

  const formatDate = (date: string) => {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const showNotification = (message: string) => {
    setNotification(message);

    setTimeout(() => {
      setNotification("");
    }, 4000);
  };

  const handleJoinWaitlist = () => {
    if (!isFull || isOnWaitlist || isJoining) {
      return;
    }

    setIsJoining(true);

    setTimeout(() => {
      const newUser: WaitlistUser = {
        id:
          currentUserId ??
          `user-${Date.now()}`,
        name: "You",
        joinedAt: new Date().toISOString(),
        status: "waiting",
      };

      setWaitlist((previous) => [
        ...previous,
        newUser,
      ]);

      setIsJoining(false);

      showNotification(
        "You have been added to the waitlist."
      );

      onJoinWaitlist?.(eventId);
    }, 500);
  };

  const handleLeaveWaitlist = () => {
    if (!isOnWaitlist || isLeaving) {
      return;
    }

    setIsLeaving(true);

    setTimeout(() => {
      setWaitlist((previous) =>
        previous.filter(
          (user) =>
            String(user.id) !==
            String(currentUserId)
        )
      );

      setIsLeaving(false);
      setShowLeaveConfirmation(false);

      showNotification(
        "You have been removed from the waitlist."
      );

      onLeaveWaitlist?.(eventId);
    }, 500);
  };

  const getStatusBadge = (
    status?: WaitlistUser["status"]
  ) => {
    switch (status) {
      case "offered":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";

      case "registered":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";

      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    }
  };

  return (
    <>
      <section className="w-full space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">

        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
              🎟️
            </div>

            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Event Registration
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                Event Waitlist
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Join the waitlist for{" "}
                <strong>{eventName}</strong> if
                registration is currently full.
              </p>
            </div>
          </div>

          <div
            className={`rounded-xl px-4 py-3 ${
              isFull
                ? "bg-red-50 dark:bg-red-950"
                : "bg-green-50 dark:bg-green-950"
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Available Seats
            </p>

            <p
              className={`mt-1 text-xl font-bold ${
                isFull
                  ? "text-red-700 dark:text-red-300"
                  : "text-green-700 dark:text-green-300"
              }`}
            >
              {availableSeats}
            </p>
          </div>
        </div>

        {/* Registration capacity */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Registration Capacity
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {registeredCount} of {capacity} seats
                currently registered
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isFull
                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                  : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
              }`}
            >
              {isFull ? "Full" : "Available"}
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full rounded-full transition-all ${
                isFull
                  ? "bg-red-500"
                  : "bg-green-500"
              }`}
              style={{
                width: `${Math.min(
                  (registeredCount /
                    Math.max(capacity, 1)) *
                    100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Current user status */}
        {isOnWaitlist && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg dark:bg-blue-900">
                  ✓
                </div>

                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200">
                    You are on the waitlist
                  </h3>

                  {currentPosition !== null && (
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                      Your current position is{" "}
                      <strong>
                        #{currentPosition}
                      </strong>
                    </p>
                  )}

                  {currentUserEntry?.status ===
                    "offered" && (
                    <p className="mt-2 text-sm font-medium text-yellow-700 dark:text-yellow-400">
                      🎉 A registration slot is
                      available for you!
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowLeaveConfirmation(true)
                }
                className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950"
              >
                Leave Waitlist
              </button>
            </div>
          </div>
        )}

        {/* Full event */}
        {isFull && !isOnWaitlist && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 dark:border-orange-900 dark:bg-orange-950">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xl dark:bg-orange-900">
                  ⏳
                </div>

                <div>
                  <h3 className="font-bold text-orange-900 dark:text-orange-200">
                    This event is full
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-orange-700 dark:text-orange-400">
                    You can join the waitlist and
                    receive a registration opportunity
                    if a seat becomes available.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleJoinWaitlist}
                disabled={isJoining}
                className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isJoining
                  ? "Joining..."
                  : "Join Waitlist"}
              </button>
            </div>
          </div>
        )}

        {/* Seats available */}
        {!isFull && !isOnWaitlist && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950">
            <div className="flex items-start gap-3">
              <span className="text-xl">✓</span>

              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">
                  Registration is available
                </h3>

                <p className="mt-1 text-sm leading-6 text-green-700 dark:text-green-400">
                  There are currently{" "}
                  <strong>{availableSeats}</strong>{" "}
                  available seats. You can register
                  directly for this event.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
            <div className="flex items-start gap-3">
              <span className="text-lg">✓</span>

              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                {notification}
              </p>
            </div>
          </div>
        )}

        {/* Waitlist information */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            How the waitlist works
          </h3>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                1
              </span>

              <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                Join the waitlist when the event reaches
                its registration limit.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                2
              </span>

              <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                Your position is maintained according to
                the time you joined.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                3
              </span>

              <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                When a seat becomes available, the next
                eligible user can be offered the slot.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                4
              </span>

              <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                Users can leave the waitlist at any time
                before receiving a registration slot.
              </p>
            </div>
          </div>
        </div>

        {/* Organizer waitlist preview */}
        {waitlist.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Waitlist
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {waitlist.length} user
                  {waitlist.length !== 1
                    ? "s"
                    : ""} currently waiting
                </p>
              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {waitlist.filter(
                  (user) =>
                    user.status === "waiting"
                ).length}{" "}
                waiting
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {waitlist.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Joined{" "}
                      {formatDate(
                        user.joinedAt
                      )}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(
                      user.status
                    )}`}
                  >
                    {user.status ===
                    "offered"
                      ? "Slot Offered"
                      : user.status ===
                        "registered"
                      ? "Registered"
                      : "Waiting"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Privacy notice */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-start gap-3">
            <span className="text-lg">🔒</span>

            <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
              Waitlist information should only be visible
              to authorized users. Personal information
              should not be exposed to other participants.
            </p>
          </div>
        </div>
      </section>

      {/* Leave confirmation modal */}
      {showLeaveConfirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-waitlist-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl dark:bg-red-950">
                ⚠️
              </div>

              <div>
                <h2
                  id="leave-waitlist-title"
                  className="text-xl font-bold text-gray-900 dark:text-white"
                >
                  Leave Waitlist?
                </h2>

                <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  Are you sure you want to leave the
                  waitlist for {eventName}?
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
              <p className="text-sm leading-6 text-yellow-700 dark:text-yellow-400">
                Leaving the waitlist will remove your
                current position. You will need to join
                again if you change your mind.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowLeaveConfirmation(false)
                }
                disabled={isLeaving}
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Keep My Place
              </button>

              <button
                type="button"
                onClick={handleLeaveWaitlist}
                disabled={isLeaving}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLeaving
                  ? "Leaving..."
                  : "Leave Waitlist"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventWaitlistManagement;