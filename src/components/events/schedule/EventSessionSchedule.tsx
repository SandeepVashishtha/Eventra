import React, { useMemo, useState } from "react";

export interface EventSession {
  id: string;
  eventId: string;
  title: string;
  startTime: string;
  endTime: string;
  speaker?: string;
  location?: string;
  description?: string;
}

interface EventSessionScheduleProps {
  eventId: string;
  sessions?: EventSession[];
  isOrganizer?: boolean;

  onAddSession?: (
    session: Omit<EventSession, "id">
  ) => void;

  onUpdateSession?: (
    session: EventSession
  ) => void;

  onDeleteSession?: (
    sessionId: string
  ) => void;
}

const EventSessionSchedule: React.FC<
  EventSessionScheduleProps
> = ({
  eventId,
  sessions = [],
  isOrganizer = false,
  onAddSession,
  onUpdateSession,
  onDeleteSession,
}) => {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const eventSessions = useMemo(() => {
    return sessions
      .filter(
        (session) =>
          session.eventId === eventId
      )
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() -
          new Date(b.startTime).getTime()
      );
  }, [sessions, eventId]);

  const resetForm = () => {
    setTitle("");
    setStartTime("");
    setEndTime("");
    setSpeaker("");
    setLocation("");
    setDescription("");
    setEditingId(null);
    setError("");
  };

  const validateForm = () => {
    if (!title.trim()) {
      return "Session title is required.";
    }

    if (!startTime) {
      return "Session start time is required.";
    }

    if (!endTime) {
      return "Session end time is required.";
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime())) {
      return "Invalid session start time.";
    }

    if (Number.isNaN(end.getTime())) {
      return "Invalid session end time.";
    }

    if (end <= start) {
      return "End time must be after start time.";
    }

    return "";
  };

  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (editingId) {
      const existingSession =
        eventSessions.find(
          (session) =>
            session.id === editingId
        );

      if (!existingSession) {
        setError(
          "The selected session could not be found."
        );
        return;
      }

      const updatedSession: EventSession = {
        ...existingSession,
        title: title.trim(),
        startTime,
        endTime,
        speaker: speaker.trim(),
        location: location.trim(),
        description:
          description.trim(),
      };

      onUpdateSession?.(
        updatedSession
      );

      setSuccess(
        "Session updated successfully."
      );

      resetForm();

      return;
    }

    const newSession: Omit<
      EventSession,
      "id"
    > = {
      eventId,
      title: title.trim(),
      startTime,
      endTime,
      speaker: speaker.trim(),
      location: location.trim(),
      description:
        description.trim(),
    };

    onAddSession?.(newSession);

    setSuccess(
      "Session added successfully."
    );

    resetForm();
  };

  const handleEdit = (
    session: EventSession
  ) => {
    setEditingId(session.id);
    setTitle(session.title);
    setStartTime(session.startTime);
    setEndTime(session.endTime);
    setSpeaker(session.speaker ?? "");
    setLocation(session.location ?? "");
    setDescription(
      session.description ?? ""
    );
    setError("");
    setSuccess("");
  };

  const formatDate = (
    value: string
  ) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(date);
  };

  const formatTime = (
    value: string
  ) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return new Intl.DateTimeFormat(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit",
      }
    ).format(date);
  };

  const getDateLabel = (
    value: string
  ) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return new Intl.DateTimeFormat(
      undefined,
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    ).format(date);
  };

  return (
    <section
      className="
        w-full
        space-y-6
      "
    >
      <header
        className="
          rounded-2xl
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
            gap-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <h2
              className="
                text-2xl
                font-bold
                text-gray-900
                dark:text-white
              "
            >
              Event Schedule
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              View all event sessions
              in chronological order.
            </p>
          </div>

          <div
            className="
              rounded-lg
              bg-gray-100
              px-4
              py-2
              text-sm
              font-medium
              text-gray-700
              dark:bg-gray-800
              dark:text-gray-300
            "
          >
            {eventSessions.length}{" "}
            {eventSessions.length === 1
              ? "Session"
              : "Sessions"}
          </div>
        </div>
      </header>

      {isOrganizer && (
        <div
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-6
            shadow-sm
            dark:border-gray-700
            dark:bg-gray-900
          "
        >
          <div>
            <h3
              className="
                text-xl
                font-semibold
                text-gray-900
                dark:text-white
              "
            >
              {editingId
                ? "Edit Session"
                : "Add Session"}
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              Add the session details
              participants need.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="
              mt-6
              space-y-5
            "
          >
            <div>
              <label
                htmlFor="session-title"
                className="
                  block
                  text-sm
                  font-medium
                  text-gray-700
                  dark:text-gray-300
                "
              >
                Session Title
              </label>

              <input
                id="session-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="e.g. Opening Ceremony"
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
                  dark:border-gray-600
                  dark:bg-gray-800
                  dark:text-white
                "
              />
            </div>

            <div
              className="
                grid
                grid-cols-1
                gap-5
                md:grid-cols-2
              "
            >
              <div>
                <label
                  htmlFor="session-start"
                  className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    dark:text-gray-300
                  "
                >
                  Start Time
                </label>

                <input
                  id="session-start"
                  type="datetime-local"
                  value={startTime}
                  onChange={(event) =>
                    setStartTime(
                      event.target.value
                    )
                  }
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
                    dark:border-gray-600
                    dark:bg-gray-800
                    dark:text-white
                  "
                />
              </div>

              <div>
                <label
                  htmlFor="session-end"
                  className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    dark:text-gray-300
                  "
                >
                  End Time
                </label>

                <input
                  id="session-end"
                  type="datetime-local"
                  value={endTime}
                  onChange={(event) =>
                    setEndTime(
                      event.target.value
                    )
                  }
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
                    dark:border-gray-600
                    dark:bg-gray-800
                    dark:text-white
                  "
                />
              </div>
            </div>

            <div
              className="
                grid
                grid-cols-1
                gap-5
                md:grid-cols-2
              "
            >
              <div>
                <label
                  htmlFor="session-speaker"
                  className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    dark:text-gray-300
                  "
                >
                  Speaker
                </label>

                <input
                  id="session-speaker"
                  type="text"
                  value={speaker}
                  onChange={(event) =>
                    setSpeaker(
                      event.target.value
                    )
                  }
                  placeholder="Speaker name"
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
                    dark:border-gray-600
                    dark:bg-gray-800
                    dark:text-white
                  "
                />
              </div>

              <div>
                <label
                  htmlFor="session-location"
                  className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    dark:text-gray-300
                  "
                >
                  Location
                </label>

                <input
                  id="session-location"
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                  placeholder="Room or venue"
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
                    dark:border-gray-600
                    dark:bg-gray-800
                    dark:text-white
                  "
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="session-description"
                className="
                  block
                  text-sm
                  font-medium
                  text-gray-700
                  dark:text-gray-300
                "
              >
                Description
              </label>

              <textarea
                id="session-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Add session details..."
                className="
                  mt-2
                  w-full
                  resize-y
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-4
                  py-2.5
                  text-gray-900
                  outline-none
                  focus:border-blue-500
                  dark:border-gray-600
                  dark:bg-gray-800
                  dark:text-white
                "
              />
            </div>

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

            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
              "
            >
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
                {editingId
                  ? "Update Session"
                  : "Add Session"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="
                    rounded-lg
                    border
                    border-gray-300
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-gray-700
                    transition
                    hover:bg-gray-50
                    dark:border-gray-600
                    dark:text-gray-200
                    dark:hover:bg-gray-800
                  "
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div
        className="
          rounded-2xl
          border
          border-gray-200
          bg-white
          p-6
          shadow-sm
          dark:border-gray-700
          dark:bg-gray-900
        "
      >
        <h3
          className="
            text-xl
            font-semibold
            text-gray-900
            dark:text-white
          "
        >
          Schedule
        </h3>

        {eventSessions.length ===
        0 ? (
          <div
            className="
              mt-6
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
              📅
            </div>

            <h4
              className="
                mt-4
                font-semibold
                text-gray-900
                dark:text-white
              "
            >
              No sessions yet
            </h4>

            <p
              className="
                mt-2
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              The event schedule will
              appear here once sessions
              are added.
            </p>
          </div>
        ) : (
          <div
            className="
              relative
              mt-8
            "
          >
            <div
              className="
                absolute
                bottom-0
                left-5
                top-0
                hidden
                w-px
                bg-gray-200
                dark:bg-gray-700
                sm:block
              "
            />

            <div
              className="
                space-y-8
              "
            >
              {eventSessions.map(
                (session) => (
                  <article
                    key={session.id}
                    className="
                      relative
                      sm:pl-14
                    "
                  >
                    <div
                      className="
                        absolute
                        left-3
                        top-1
                        hidden
                        h-5
                        w-5
                        rounded-full
                        border-4
                        border-white
                        bg-blue-600
                        dark:border-gray-900
                        sm:block
                      "
                    />

                    <div
                      className="
                        rounded-xl
                        border
                        border-gray-200
                        p-5
                        transition
                        hover:shadow-md
                        dark:border-gray-700
                      "
                    >
                      <div
                        className="
                          flex
                          flex-col
                          gap-4
                          lg:flex-row
                          lg:items-start
                          lg:justify-between
                        "
                      >
                        <div className="flex-1">
                          <div
                            className="
                              flex
                              flex-wrap
                              items-center
                              gap-2
                            "
                          >
                            <span
                              className="
                                rounded-full
                                bg-blue-100
                                px-3
                                py-1
                                text-xs
                                font-semibold
                                text-blue-700
                                dark:bg-blue-900/30
                                dark:text-blue-300
                              "
                            >
                              {formatTime(
                                session.startTime
                              )}
                              {" - "}
                              {formatTime(
                                session.endTime
                              )}
                            </span>
                          </div>

                          <h4
                            className="
                              mt-3
                              text-lg
                              font-bold
                              text-gray-900
                              dark:text-white
                            "
                          >
                            {session.title}
                          </h4>

                          <p
                            className="
                              mt-1
                              text-sm
                              font-medium
                              text-gray-600
                              dark:text-gray-400
                            "
                          >
                            {getDateLabel(
                              session.startTime
                            )}
                          </p>

                          {session.description && (
                            <p
                              className="
                                mt-3
                                text-sm
                                leading-6
                                text-gray-600
                                dark:text-gray-400
                              "
                            >
                              {
                                session.description
                              }
                            </p>
                          )}

                          <div
                            className="
                              mt-4
                              flex
                              flex-col
                              gap-2
                              text-sm
                              text-gray-600
                              dark:text-gray-400
                            "
                          >
                            {session.speaker && (
                              <div>
                                <strong>
                                  Speaker:
                                </strong>{" "}
                                {
                                  session.speaker
                                }
                              </div>
                            )}

                            {session.location && (
                              <div>
                                <strong>
                                  Location:
                                </strong>{" "}
                                {
                                  session.location
                                }
                              </div>
                            )}
                          </div>
                        </div>

                        {isOrganizer && (
                          <div
                            className="
                              flex
                              gap-2
                            "
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  session
                                )
                              }
                              className="
                                rounded-lg
                                border
                                border-gray-300
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-gray-700
                                hover:bg-gray-50
                                dark:border-gray-600
                                dark:text-gray-200
                                dark:hover:bg-gray-800
                              "
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                onDeleteSession?.(
                                  session.id
                                )
                              }
                              className="
                                rounded-lg
                                border
                                border-red-200
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-red-600
                                hover:bg-red-50
                                dark:border-red-900
                                dark:text-red-400
                                dark:hover:bg-red-950/20
                              "
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      <div
                        className="
                          mt-4
                          text-xs
                          text-gray-400
                          dark:text-gray-500
                        "
                      >
                        {formatDate(
                          session.startTime
                        )}{" "}
                        to{" "}
                        {formatDate(
                          session.endTime
                        )}
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventSessionSchedule;