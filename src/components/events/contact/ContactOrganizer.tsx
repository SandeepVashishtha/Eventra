import React, { FormEvent, useState } from "react";

interface ContactOrganizerProps {
  eventId: string;
  eventName?: string;
  organizerName?: string;
  open?: boolean;
  onClose?: () => void;
  onSubmit?: (inquiry: {
    eventId: string;
    topic: string;
    message: string;
  }) => void | Promise<void>;
}

const CONTACT_TOPICS = [
  {
    value: "event_information",
    label: "Event information",
    description:
      "Ask about event details, schedule, or requirements.",
  },
  {
    value: "registration",
    label: "Registration",
    description:
      "Questions about registration or participation.",
  },
  {
    value: "venue",
    label: "Venue or location",
    description:
      "Ask about the event venue, directions, or facilities.",
  },
  {
    value: "schedule",
    label: "Schedule",
    description:
      "Ask about timings, sessions, or important dates.",
  },
  {
    value: "participation",
    label: "Participation",
    description:
      "Questions about attending or participating in the event.",
  },
  {
    value: "other",
    label: "Other",
    description:
      "Ask something that does not fit the categories above.",
  },
];

const MAX_MESSAGE_LENGTH = 1000;

const ContactOrganizer: React.FC<
  ContactOrganizerProps
> = ({
  eventId,
  eventName,
  organizerName,
  open = false,
  onClose,
  onSubmit,
}) => {
  const [topic, setTopic] = useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const resetForm = () => {
    setTopic("");
    setMessage("");
    setError("");
    setSubmitting(false);
    setSubmitted(false);
  };

  const handleClose = () => {
    if (submitting) {
      return;
    }

    resetForm();
    onClose?.();
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!topic) {
      setError(
        "Please select a topic for your inquiry."
      );
      return;
    }

    const trimmedMessage =
      message.trim();

    if (!trimmedMessage) {
      setError(
        "Please enter your question."
      );
      return;
    }

    if (
      trimmedMessage.length >
      MAX_MESSAGE_LENGTH
    ) {
      setError(
        `Your message must be ${MAX_MESSAGE_LENGTH} characters or less.`
      );
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit?.({
        eventId,
        topic,
        message: trimmedMessage,
      });

      setSubmitted(true);
    } catch {
      setError(
        "Your inquiry could not be sent. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleClose();
        }
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-organizer-title"
        aria-describedby="contact-organizer-description"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl dark:bg-blue-950">
              💬
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Event Inquiry
              </p>

              <h2
                id="contact-organizer-title"
                className="mt-1 text-lg font-bold text-gray-900 dark:text-white"
              >
                Contact Organizer
              </h2>

              {organizerName && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Contact{" "}
                  {organizerName}
                </p>
              )}

              {eventName && (
                <p className="mt-1 max-w-xs truncate text-xs text-gray-400">
                  {eventName}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            aria-label="Close contact organizer dialog"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Success state */}
        {submitted ? (
          <div className="p-6 text-center sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-3xl dark:bg-green-950">
              ✓
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
              Inquiry sent
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">
              Your question has been sent to the
              organizer for this event.
            </p>

            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-gray-400">
              You will receive a response through
              the platform when the organizer replies.
            </p>

            <button
              type="button"
              onClick={handleClose}
              className="mt-6 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Done
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-6"
          >
            <p
              id="contact-organizer-description"
              className="mb-6 text-sm leading-6 text-gray-500 dark:text-gray-400"
            >
              Have a question about this event?
              Select a topic and send your inquiry
              directly through Eventra.
            </p>

            {/* Topic */}
            <fieldset>
              <legend className="text-sm font-bold text-gray-800 dark:text-gray-200">
                What is your question about?
              </legend>

              <div className="mt-3 space-y-2">
                {CONTACT_TOPICS.map(
                  (item) => {
                    const selected =
                      topic ===
                      item.value;

                    return (
                      <label
                        key={item.value}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                          selected
                            ? "border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        }`}
                      >
                        <input
                          type="radio"
                          name="contact-topic"
                          value={item.value}
                          checked={selected}
                          onChange={(event) => {
                            setTopic(
                              event.target.value
                            );
                            setError("");
                          }}
                          className="mt-1 h-4 w-4 accent-blue-600"
                        />

                        <span className="min-w-0">
                          <span
                            className={`block text-sm font-semibold ${
                              selected
                                ? "text-blue-800 dark:text-blue-300"
                                : "text-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {item.label}
                          </span>

                          <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">
                            {
                              item.description
                            }
                          </span>
                        </span>
                      </label>
                    );
                  }
                )}
              </div>
            </fieldset>

            {/* Message */}
            <div className="mt-6">
              <label
                htmlFor="contact-organizer-message"
                className="block text-sm font-bold text-gray-800 dark:text-gray-200"
              >
                Your question
              </label>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Please keep your message relevant to
                this event.
              </p>

              <textarea
                id="contact-organizer-message"
                value={message}
                onChange={(event) => {
                  setMessage(
                    event.target.value
                  );
                  setError("");
                }}
                maxLength={
                  MAX_MESSAGE_LENGTH
                }
                rows={6}
                placeholder="Write your question here..."
                className="mt-3 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-950"
              />

              <p className="mt-1 text-right text-xs text-gray-400">
                {message.length}/
                {MAX_MESSAGE_LENGTH}
              </p>
            </div>

            {/* Privacy notice */}
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
              <span className="text-lg">
                🔒
              </span>

              <div>
                <p className="text-xs font-bold text-blue-800 dark:text-blue-300">
                  Your contact information stays private
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-400">
                  Your inquiry is sent through Eventra.
                  The organizer does not need access to
                  your personal contact details to respond.
                </p>
              </div>
            </div>

            {/* Anti-spam notice */}
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <span className="text-lg">
                🛡️
              </span>

              <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
                Please avoid sending repeated or
                unrelated messages. Eventra may limit
                repeated submissions to help prevent spam.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                role="alert"
              >
                ⚠️ {error}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  submitting ||
                  !topic ||
                  !message.trim()
                }
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Sending..."
                  : "Send Inquiry"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactOrganizer;