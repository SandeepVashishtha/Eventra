import React, {
  FormEvent,
  useMemo,
  useState,
} from "react";

export interface EventAnnouncement {
  id: string;
  eventId: string;
  title: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
  authorName?: string;
}

interface EventAnnouncementsProps {
  eventId: string;
  announcements?: EventAnnouncement[];
  isOrganizer?: boolean;
  currentUserId?: string;
  onCreate?: (
    announcement: Omit<
      EventAnnouncement,
      "id" | "createdAt"
    >
  ) => Promise<void> | void;
  onUpdate?: (
    announcement: EventAnnouncement
  ) => Promise<void> | void;
  onDelete?: (
    announcementId: string
  ) => Promise<void> | void;
  className?: string;
}

const MAX_TITLE_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 2000;

const EventAnnouncements: React.FC<
  EventAnnouncementsProps
> = ({
  eventId,
  announcements = [],
  isOrganizer = false,
  currentUserId,
  onCreate,
  onUpdate,
  onDelete,
  className = "",
}) => {
  const [isCreating, setIsCreating] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [expandedIds, setExpandedIds] =
    useState<string[]>([]);

  const sortedAnnouncements =
    useMemo(() => {
      return [...announcements]
        .filter(
          (announcement) =>
            announcement.eventId ===
            eventId
        )
        .sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        );
    }, [
      announcements,
      eventId,
    ]);

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setError("");
    setEditingId(null);
    setIsCreating(false);
  };

  const openCreateForm = () => {
    setTitle("");
    setMessage("");
    setError("");
    setEditingId(null);
    setIsCreating(true);
  };

  const openEditForm = (
    announcement: EventAnnouncement
  ) => {
    setTitle(
      announcement.title
    );

    setMessage(
      announcement.message
    );

    setError("");
    setEditingId(
      announcement.id
    );

    setIsCreating(true);
  };

  const validateForm = () => {
    const trimmedTitle =
      title.trim();

    const trimmedMessage =
      message.trim();

    if (!trimmedTitle) {
      setError(
        "Please enter an announcement title."
      );

      return false;
    }

    if (!trimmedMessage) {
      setError(
        "Please enter an announcement message."
      );

      return false;
    }

    if (
      trimmedTitle.length >
      MAX_TITLE_LENGTH
    ) {
      setError(
        `Title cannot exceed ${MAX_TITLE_LENGTH} characters.`
      );

      return false;
    }

    if (
      trimmedMessage.length >
      MAX_MESSAGE_LENGTH
    ) {
      setError(
        `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!isOrganizer) {
      return;
    }

    if (submitting) {
      return;
    }

    setError("");

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      if (editingId) {
        const existing =
          sortedAnnouncements.find(
            (item) =>
              item.id ===
              editingId
          );

        if (!existing) {
          throw new Error(
            "Announcement could not be found."
          );
        }

        const updated: EventAnnouncement =
          {
            ...existing,
            title: title.trim(),
            message:
              message.trim(),
            updatedAt:
              new Date().toISOString(),
          };

        await onUpdate?.(
          updated
        );
      } else {
        await onCreate?.({
          eventId,
          title: title.trim(),
          message:
            message.trim(),
          authorName:
            currentUserId,
        });
      }

      resetForm();
    } catch (submissionError) {
      setError(
        submissionError instanceof
          Error
          ? submissionError.message
          : "Unable to save the announcement. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (
    announcementId: string
  ) => {
    if (!isOrganizer) {
      return;
    }

    if (deletingId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to remove this announcement?"
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      announcementId
    );

    try {
      await onDelete?.(
        announcementId
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof
          Error
          ? deleteError.message
          : "Unable to remove the announcement."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpanded = (
    announcementId: string
  ) => {
    setExpandedIds(
      (current) => {
        if (
          current.includes(
            announcementId
          )
        ) {
          return current.filter(
            (id) =>
              id !==
              announcementId
          );
        }

        return [
          ...current,
          announcementId,
        ];
      }
    );
  };

  const formatTimestamp = (
    timestamp: string
  ) => {
    const date =
      new Date(timestamp);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Unknown time";
    }

    return date.toLocaleString(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  return (
    <section
      className={`
        w-full
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-sm
        dark:border-gray-700
        dark:bg-gray-900
        ${className}
      `}
    >
      {/* Header */}
      <div
        className="
          flex
          flex-col
          gap-4
          border-b
          border-gray-200
          bg-gradient-to-r
          from-blue-50
          to-purple-50
          p-5
          dark:border-gray-700
          dark:from-blue-950/30
          dark:to-purple-950/30
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="flex items-start gap-3">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-100
              text-xl
              dark:bg-blue-950
            "
            aria-hidden="true"
          >
            📢
          </div>

          <div>
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-blue-600
                dark:text-blue-400
              "
            >
              Event Updates
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-bold
                text-gray-900
                dark:text-white
              "
            >
              Announcements
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              Important updates and information
              from the event organizer.
            </p>
          </div>
        </div>

        {isOrganizer && (
          <button
            type="button"
            onClick={
              openCreateForm
            }
            className="
              rounded-xl
              bg-blue-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-blue-700
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:ring-offset-2
              dark:focus:ring-offset-gray-900
            "
          >
            + New Announcement
          </button>
        )}
      </div>

      {/* Create / edit form */}
      {isOrganizer &&
        isCreating && (
          <div
            className="
              border-b
              border-gray-200
              bg-gray-50
              p-5
              dark:border-gray-700
              dark:bg-gray-800
            "
          >
            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="announcement-title"
                  className="
                    block
                    text-sm
                    font-semibold
                    text-gray-800
                    dark:text-gray-200
                  "
                >
                  Announcement Title
                </label>

                <input
                  id="announcement-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  maxLength={
                    MAX_TITLE_LENGTH
                  }
                  placeholder="e.g. Venue changed"
                  className="
                    mt-2
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-gray-900
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                    dark:border-gray-600
                    dark:bg-gray-900
                    dark:text-white
                    dark:focus:ring-blue-950
                  "
                />

                <p
                  className="
                    mt-1
                    text-right
                    text-[11px]
                    text-gray-400
                  "
                >
                  {title.length}/
                  {
                    MAX_TITLE_LENGTH
                  }
                </p>
              </div>

              <div>
                <label
                  htmlFor="announcement-message"
                  className="
                    block
                    text-sm
                    font-semibold
                    text-gray-800
                    dark:text-gray-200
                  "
                >
                  Announcement
                </label>

                <textarea
                  id="announcement-message"
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  maxLength={
                    MAX_MESSAGE_LENGTH
                  }
                  rows={6}
                  placeholder="Write an important update for event participants..."
                  className="
                    mt-2
                    w-full
                    resize-y
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                    px-4
                    py-3
                    text-sm
                    leading-6
                    text-gray-900
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                    dark:border-gray-600
                    dark:bg-gray-900
                    dark:text-white
                    dark:focus:ring-blue-950
                  "
                />

                <p
                  className="
                    mt-1
                    text-right
                    text-[11px]
                    text-gray-400
                  "
                >
                  {message.length}/
                  {
                    MAX_MESSAGE_LENGTH
                  }
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    p-3
                    text-sm
                    text-red-700
                    dark:border-red-900
                    dark:bg-red-950/30
                    dark:text-red-300
                  "
                >
                  {error}
                </div>
              )}

              <div
                className="
                  flex
                  flex-col
                  gap-2
                  sm:flex-row
                  sm:justify-end
                "
              >
                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  disabled={
                    submitting
                  }
                  className="
                    rounded-xl
                    border
                    border-gray-300
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-gray-700
                    hover:bg-gray-100
                    disabled:opacity-50
                    dark:border-gray-600
                    dark:text-gray-300
                    dark:hover:bg-gray-700
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="
                    rounded-xl
                    bg-blue-600
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-blue-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {submitting
                    ? "Saving..."
                    : editingId
                    ? "Update Announcement"
                    : "Publish Announcement"}
                </button>
              </div>
            </form>
          </div>
        )}

      {/* Announcement list */}
      <div className="p-5">
        {error &&
          !isCreating && (
            <div
              role="alert"
              className="
                mb-4
                rounded-xl
                border
                border-red-200
                bg-red-50
                p-3
                text-sm
                text-red-700
                dark:border-red-900
                dark:bg-red-950/30
                dark:text-red-300
              "
            >
              {error}
            </div>
          )}

        {sortedAnnouncements.length ===
        0 ? (
          <div
            className="
              rounded-xl
              border
              border-dashed
              border-gray-300
              p-8
              text-center
              dark:border-gray-700
            "
          >
            <div
              className="
                mx-auto
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-gray-100
                text-xl
                dark:bg-gray-800
              "
            >
              📢
            </div>

            <h3
              className="
                mt-3
                text-sm
                font-bold
                text-gray-800
                dark:text-gray-200
              "
            >
              No announcements yet
            </h3>

            <p
              className="
                mx-auto
                mt-1
                max-w-md
                text-xs
                leading-5
                text-gray-500
                dark:text-gray-400
              "
            >
              Important updates from the
              organizer will appear here.
            </p>

            {isOrganizer && (
              <button
                type="button"
                onClick={
                  openCreateForm
                }
                className="
                  mt-4
                  text-sm
                  font-semibold
                  text-blue-600
                  hover:underline
                  dark:text-blue-400
                "
              >
                Create the first announcement
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAnnouncements.map(
              (announcement) => {
                const expanded =
                  expandedIds.includes(
                    announcement.id
                  );

                const longMessage =
                  announcement.message
                    .length > 300;

                const displayedMessage =
                  expanded ||
                  !longMessage
                    ? announcement.message
                    : `${announcement.message.slice(
                        0,
                        300
                      )}...`;

                return (
                  <article
                    key={
                      announcement.id
                    }
                    className="
                      rounded-2xl
                      border
                      border-gray-200
                      bg-white
                      p-5
                      shadow-sm
                      dark:border-gray-700
                      dark:bg-gray-900
                    "
                  >
                    <div
                      className="
                        flex
                        items-start
                        gap-3
                      "
                    >
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-blue-100
                          text-lg
                          dark:bg-blue-950
                        "
                        aria-hidden="true"
                      >
                        📢
                      </div>

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <div
                          className="
                            flex
                            flex-col
                            gap-2
                            sm:flex-row
                            sm:items-start
                            sm:justify-between
                          "
                        >
                          <div>
                            <h3
                              className="
                                text-base
                                font-bold
                                text-gray-900
                                dark:text-white
                              "
                            >
                              {
                                announcement.title
                              }
                            </h3>

                            <p
                              className="
                                mt-1
                                text-[11px]
                                text-gray-400
                              "
                            >
                              Published{" "}
                              {formatTimestamp(
                                announcement.createdAt
                              )}

                              {announcement.updatedAt && (
                                <>
                                  {" "}
                                  · Updated{" "}
                                  {formatTimestamp(
                                    announcement.updatedAt
                                  )}
                                </>
                              )}
                            </p>
                          </div>

                          {isOrganizer && (
                            <div
                              className="
                                flex
                                shrink-0
                                gap-2
                              "
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  openEditForm(
                                    announcement
                                  )
                                }
                                className="
                                  rounded-lg
                                  px-3
                                  py-1.5
                                  text-xs
                                  font-semibold
                                  text-blue-600
                                  hover:bg-blue-50
                                  dark:text-blue-400
                                  dark:hover:bg-blue-950/30
                                "
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    announcement.id
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  announcement.id
                                }
                                className="
                                  rounded-lg
                                  px-3
                                  py-1.5
                                  text-xs
                                  font-semibold
                                  text-red-600
                                  hover:bg-red-50
                                  disabled:opacity-50
                                  dark:text-red-400
                                  dark:hover:bg-red-950/30
                                "
                              >
                                {deletingId ===
                                announcement.id
                                  ? "Removing..."
                                  : "Remove"}
                              </button>
                            </div>
                          )}
                        </div>

                        <p
                          className="
                            mt-4
                            whitespace-pre-wrap
                            text-sm
                            leading-6
                            text-gray-700
                            dark:text-gray-300
                          "
                        >
                          {
                            displayedMessage
                          }
                        </p>

                        {longMessage && (
                          <button
                            type="button"
                            onClick={() =>
                              toggleExpanded(
                                announcement.id
                              )
                            }
                            className="
                              mt-2
                              text-xs
                              font-semibold
                              text-blue-600
                              hover:underline
                              dark:text-blue-400
                            "
                          >
                            {expanded
                              ? "Show less"
                              : "Read more"}
                          </button>
                        )}

                        {announcement.authorName && (
                          <p
                            className="
                              mt-4
                              text-[11px]
                              text-gray-400
                            "
                          >
                            Posted by{" "}
                            {
                              announcement.authorName
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {sortedAnnouncements.length >
        0 && (
        <div
          className="
            border-t
            border-gray-200
            bg-gray-50
            px-5
            py-3
            dark:border-gray-700
            dark:bg-gray-800
          "
        >
          <p
            className="
              text-center
              text-[11px]
              text-gray-400
            "
          >
            {sortedAnnouncements.length}{" "}
            {sortedAnnouncements.length ===
            1
              ? "announcement"
              : "announcements"}{" "}
            for this event
          </p>
        </div>
      )}
    </section>
  );
};

export default EventAnnouncements;