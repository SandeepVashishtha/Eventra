import React, { useState } from "react";

interface RegistrationConfirmationProps {
  success?: boolean;
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  isOnline?: boolean;
  registrationReference?: string;
  eventDetailsUrl?: string;
  initialSaved?: boolean;
  onBackToEvent?: () => void;
  onSaveEvent?: (saved: boolean) => void;
  onRetry?: () => void;
  onBrowseEvents?: () => void;
}

const RegistrationConfirmation: React.FC<
  RegistrationConfirmationProps
> = ({
  success = true,
  eventName = "Event Registration",
  eventDate = "",
  eventTime = "",
  venue = "",
  isOnline = false,
  registrationReference = "",
  eventDetailsUrl = "#",
  initialSaved = false,
  onBackToEvent,
  onSaveEvent,
  onRetry,
  onBrowseEvents,
}) => {
  const [saved, setSaved] =
    useState(initialSaved);

  const [copied, setCopied] =
    useState(false);

  const [showReference, setShowReference] =
    useState(false);

  const handleSaveEvent = () => {
    const nextValue = !saved;

    setSaved(nextValue);
    onSaveEvent?.(nextValue);
  };

  const handleCopyReference = async () => {
    if (!registrationReference) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        registrationReference
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  const formatDate = (
    value: string
  ): string => {
    if (!value) {
      return "Date to be announced";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  /*
   * Failed registration state
   */
  if (!success) {
    return (
      <main className="min-h-[500px] w-full bg-gray-50 px-4 py-10 dark:bg-gray-950">
        <div className="mx-auto w-full max-w-2xl">
          <div className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-sm dark:border-red-900 dark:bg-gray-900">
            <div className="flex flex-col items-center px-6 py-10 text-center sm:px-10">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl dark:bg-red-950">
                ✕
              </div>

              <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                Registration unsuccessful
              </p>

              <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                Registration could not be completed
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-6 text-gray-500 dark:text-gray-400">
                We could not complete your registration
                for this event. No successful registration
                confirmation has been created.
              </p>

              <div className="mt-8 w-full rounded-2xl border border-gray-200 bg-gray-50 p-5 text-left dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-start gap-3">
                  <span className="text-xl">
                    ℹ️
                  </span>

                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      What you can do
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                      You can try registering again or
                      return to the event page to check
                      the event details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                )}

                {onBackToEvent && (
                  <button
                    type="button"
                    onClick={onBackToEvent}
                    className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Back to Event
                  </button>
                )}

                {!onRetry &&
                  !onBackToEvent &&
                  onBrowseEvents && (
                    <button
                      type="button"
                      onClick={onBrowseEvents}
                      className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Browse Events
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Successful registration state
   */
  return (
    <main className="min-h-[600px] w-full bg-gray-50 px-4 py-10 dark:bg-gray-950 sm:py-14">
      <div className="mx-auto w-full max-w-3xl">
        {/* Success header */}
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 px-6 py-10 text-center dark:from-green-950/40 dark:via-gray-900 dark:to-blue-950/40 sm:px-10 sm:py-14">
            {/* Decorative circles */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-green-100/70 dark:bg-green-900/30" />

            <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-blue-100/60 dark:bg-blue-900/20" />

            {/* Success icon */}
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 shadow-sm dark:bg-green-900">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-3xl font-bold text-white">
                ✓
              </div>
            </div>

            <p className="relative mt-6 text-sm font-bold uppercase tracking-[0.18em] text-green-600 dark:text-green-400">
              Registration confirmed
            </p>

            <h1 className="relative mt-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              You're registered!
            </h1>

            <p className="relative mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-400">
              Your registration for this event was
              successful. Keep your registration
              reference for future use.
            </p>
          </div>

          {/* Event information */}
          <div className="p-6 sm:p-8">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
                  🎟️
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Event
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                    {eventName}
                  </h2>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                ✓
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
                  Registration status
                </p>

                <p className="mt-0.5 text-sm font-bold text-green-800 dark:text-green-300">
                  Successfully registered
                </p>
              </div>
            </div>

            {/* Event details grid */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Date */}
              <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg dark:bg-blue-950">
                    📅
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {formatDate(eventDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Time */}
              <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-lg dark:bg-purple-950">
                    🕐
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Time
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {eventTime ||
                        "Time to be announced"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="rounded-2xl border border-gray-200 p-5 dark:border-gray-700 sm:col-span-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-lg dark:bg-orange-950">
                    {isOnline ? "💻" : "📍"}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {isOnline
                        ? "Event Format"
                        : "Venue"}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {isOnline
                        ? "Online Event"
                        : venue ||
                          "Venue to be announced"}
                    </p>

                    {isOnline && venue && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {venue}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Registration reference */}
            {registrationReference && (
              <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      Registration Reference
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <code className="rounded-lg bg-white px-3 py-2 text-sm font-bold tracking-wider text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white">
                        {showReference
                          ? registrationReference
                          : "••••••••••••"}
                      </code>

                      <button
                        type="button"
                        onClick={() =>
                          setShowReference(
                            (previous) =>
                              !previous
                          )
                        }
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900"
                        aria-label={
                          showReference
                            ? "Hide reference"
                            : "Show reference"
                        }
                      >
                        {showReference
                          ? "🙈"
                          : "👁️"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleCopyReference
                    }
                    className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 dark:border-blue-800 dark:bg-gray-900 dark:text-blue-400 dark:hover:bg-blue-900"
                  >
                    {copied
                      ? "✓ Copied"
                      : "Copy Reference"}
                  </button>
                </div>

                <p className="mt-3 text-xs leading-5 text-blue-700 dark:text-blue-300">
                  Keep this reference available in
                  case you need to verify your
                  registration.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {onBackToEvent ? (
                <button
                  type="button"
                  onClick={onBackToEvent}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <span>View Event Details</span>
                  <span>→</span>
                </button>
              ) : (
                <a
                  href={eventDetailsUrl}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <span>View Event Details</span>
                  <span>→</span>
                </a>
              )}

              <button
                type="button"
                onClick={handleSaveEvent}
                className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-3.5 text-sm font-semibold transition ${
                  saved
                    ? "border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <span>
                  {saved ? "★" : "☆"}
                </span>

                <span>
                  {saved
                    ? "Event Saved"
                    : "Save Event"}
                </span>
              </button>
            </div>

            {/* Helpful information */}
            <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-lg">
                  💡
                </span>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    What's next?
                  </h3>

                  <ul className="mt-2 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <li className="flex gap-2">
                      <span className="text-green-500">
                        ✓
                      </span>
                      <span>
                        Your registration has been
                        recorded successfully.
                      </span>
                    </li>

                    <li className="flex gap-2">
                      <span className="text-green-500">
                        ✓
                      </span>
                      <span>
                        Keep your registration
                        reference for your records.
                      </span>
                    </li>

                    <li className="flex gap-2">
                      <span className="text-green-500">
                        ✓
                      </span>
                      <span>
                        Check the event page for the
                        latest event information.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Back to events */}
            {onBrowseEvents && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={onBrowseEvents}
                  className="text-sm font-semibold text-gray-500 underline-offset-4 hover:text-blue-600 hover:underline dark:text-gray-400 dark:hover:text-blue-400"
                >
                  Browse more events
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Privacy / accuracy note */}
        <p className="mt-5 text-center text-xs leading-5 text-gray-400">
          Registration confirmation is displayed only
          after a successful registration response.
        </p>
      </div>
    </main>
  );
};

export default RegistrationConfirmation;