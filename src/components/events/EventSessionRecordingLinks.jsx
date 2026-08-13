import {
  CalendarDays,
  Clock3,
  ExternalLink,
  FileText,
  Link2,
  Lock,
  Pencil,
  PlayCircle,
  Plus,
  Trash2,
  Unlock,
  Video,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_SESSIONS = [
  {
    id: "session-1",
    title: "Introduction to Artificial Intelligence",
    speaker: "Dr. Rahul Sharma",
    date: "2026-08-10",
    duration: "48 min",
    completed: true,
    recording: {
      url: "https://example.com/recordings/ai-introduction",
      title: "AI Introduction - Full Recording",
      duration: "48 min",
      access: "registered",
      resources: [
        {
          title: "Presentation Slides",
          url: "https://example.com/slides/ai",
        },
      ],
    },
  },
  {
    id: "session-2",
    title: "Building Modern Web Applications",
    speaker: "Priya Patel",
    date: "2026-08-11",
    duration: "55 min",
    completed: true,
    recording: null,
  },
  {
    id: "session-3",
    title: "Future of Machine Learning",
    speaker: "Amit Shah",
    date: "2026-08-12",
    duration: "60 min",
    completed: false,
    recording: null,
  },
];

const ACCESS_OPTIONS = [
  {
    value: "public",
    label: "Public",
    description: "Anyone with the recording link can access it.",
  },
  {
    value: "registered",
    label: "Registered Participants",
    description:
      "Only registered event participants can access it.",
  },
  {
    value: "attendees",
    label: "Session Attendees",
    description:
      "Only participants who attended the session can access it.",
  },
  {
    value: "private",
    label: "Private",
    description:
      "Only organizers can access the recording.",
  },
];

const formatDate = (value) => {
  if (!value) return "Unknown date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const EventSessionRecordingLinks = ({
  sessions = DEFAULT_SESSIONS,
  isOrganizer = false,
  onSaveRecording,
  onDeleteRecording,
}) => {
  const [sessionList, setSessionList] =
    useState(sessions);

  const [selectedSession, setSelectedSession] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

  const [search, setSearch] = useState("");

  const [filter, setFilter] =
    useState("all");

  const [form, setForm] = useState({
    url: "",
    title: "",
    duration: "",
    access: "registered",
    resources: [],
  });

  const [resource, setResource] =
    useState({
      title: "",
      url: "",
    });

  const [saving, setSaving] =
    useState(false);

  const filteredSessions = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return sessionList.filter((session) => {
      const matchesSearch =
        !query ||
        session.title
          ?.toLowerCase()
          .includes(query) ||
        session.speaker
          ?.toLowerCase()
          .includes(query);

      const hasRecording =
        Boolean(session.recording);

      const matchesFilter =
        filter === "all" ||
        (filter === "available" &&
          hasRecording) ||
        (filter === "missing" &&
          session.completed &&
          !hasRecording);

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [
    sessionList,
    search,
    filter,
  ]);

  const recordingCount =
    sessionList.filter(
      (session) =>
        Boolean(session.recording)
    ).length;

  const completedSessions =
    sessionList.filter(
      (session) => session.completed
    ).length;

  const openCreateForm = (session) => {
    setSelectedSession(session);

    setForm({
      url: session.recording?.url || "",
      title:
        session.recording?.title ||
        `${session.title} - Recording`,
      duration:
        session.recording?.duration ||
        session.duration ||
        "",
      access:
        session.recording?.access ||
        "registered",
      resources:
        session.recording?.resources ||
        [],
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedSession(null);
    setResource({
      title: "",
      url: "",
    });
  };

  const addResource = () => {
    if (
      !resource.title.trim() ||
      !resource.url.trim()
    ) {
      return;
    }

    setForm((current) => ({
      ...current,
      resources: [
        ...current.resources,
        {
          title: resource.title.trim(),
          url: resource.url.trim(),
        },
      ],
    }));

    setResource({
      title: "",
      url: "",
    });
  };

  const removeResource = (index) => {
    setForm((current) => ({
      ...current,
      resources: current.resources.filter(
        (_, itemIndex) =>
          itemIndex !== index
      ),
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!selectedSession || !form.url.trim()) {
      return;
    }

    setSaving(true);

    const recording = {
      url: form.url.trim(),
      title: form.title.trim(),
      duration: form.duration.trim(),
      access: form.access,
      resources: form.resources,
    };

    try {
      const updatedSession = {
        ...selectedSession,
        recording,
      };

      setSessionList((current) =>
        current.map((session) =>
          session.id ===
          selectedSession.id
            ? updatedSession
            : session
        )
      );

      await onSaveRecording?.(
        selectedSession.id,
        recording
      );

      closeForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (session) => {
    if (!session.recording) return;

    const confirmed = window.confirm(
      "Remove this recording from the session?"
    );

    if (!confirmed) return;

    setSessionList((current) =>
      current.map((item) =>
        item.id === session.id
          ? {
              ...item,
              recording: null,
            }
          : item
      )
    );

    await onDeleteRecording?.(
      session.id
    );
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Video size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Post-Event Resources
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Session Recordings
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Access recordings and related resources for completed
              event sessions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SummaryBadge
            label="Completed"
            value={completedSessions}
          />

          <SummaryBadge
            label="Recordings"
            value={recordingCount}
          />
        </div>
      </div>

      {/* Search / Filter */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Video
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search sessions or speakers..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[8px] font-semibold outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="all">
              All Sessions
            </option>

            <option value="available">
              Recordings Available
            </option>

            <option value="missing">
              Missing Recordings
            </option>
          </select>
        </div>
      </div>

      {/* Session List */}
      <div className="mt-6 space-y-4">
        {filteredSessions.length ===
        0 ? (
          <EmptyState />
        ) : (
          filteredSessions.map(
            (session) => (
              <SessionCard
                key={session.id}
                session={session}
                isOrganizer={isOrganizer}
                onAddRecording={
                  openCreateForm
                }
                onEditRecording={
                  openCreateForm
                }
                onDeleteRecording={
                  handleDelete
                }
              />
            )
          )
        )}
      </div>

      {/* Modal */}
      {showForm &&
        selectedSession && (
          <RecordingForm
            session={selectedSession}
            form={form}
            setForm={setForm}
            resource={resource}
            setResource={setResource}
            onAddResource={
              addResource
            }
            onRemoveResource={
              removeResource
            }
            onClose={closeForm}
            onSubmit={handleSave}
            saving={saving}
          />
        )}
    </section>
  );
};

/* --------------------------------
   Session Card
--------------------------------- */

const SessionCard = ({
  session,
  isOrganizer,
  onAddRecording,
  onEditRecording,
  onDeleteRecording,
}) => {
  const recording =
    session.recording;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        {/* Session Info */}
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              recording
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                : "bg-slate-100 text-slate-400 dark:bg-slate-800"
            }`}
          >
            {recording ? (
              <PlayCircle size={20} />
            ) : (
              <Video size={20} />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                {session.title}
              </h3>

              {session.completed ? (
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-[6px] font-bold text-green-600 dark:bg-green-900/10 dark:text-green-400">
                  Completed
                </span>
              ) : (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[6px] font-bold text-amber-600 dark:bg-amber-900/10 dark:text-amber-400">
                  Upcoming
                </span>
              )}
            </div>

            <p className="mt-1 text-[7px] text-slate-400">
              Speaker: {session.speaker}
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-[6px] text-slate-400">
              <span className="flex items-center gap-1">
                <CalendarDays size={10} />
                {formatDate(
                  session.date
                )}
              </span>

              <span className="flex items-center gap-1">
                <Clock3 size={10} />
                {session.duration}
              </span>
            </div>
          </div>
        </div>

        {/* Organizer Actions */}
        {isOrganizer &&
          session.completed && (
            <div className="flex gap-2">
              {recording ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      onEditRecording(
                        session
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-[7px] font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Pencil size={11} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onDeleteRecording(
                        session
                      )
                    }
                    className="rounded-xl bg-red-50 p-2 text-red-500 hover:bg-red-100 dark:bg-red-900/10"
                    title="Delete recording"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onAddRecording(
                      session
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-[7px] font-bold text-white hover:bg-indigo-700"
                >
                  <Plus size={12} />
                  Add Recording
                </button>
              )}
            </div>
          )}
      </div>

      {/* Recording */}
      {recording && (
        <RecordingDetails
          recording={recording}
        />
      )}

      {/* Missing Recording */}
      {session.completed &&
        !recording && (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <Video
                size={14}
                className="text-slate-400"
              />

              <p className="text-[7px] font-semibold text-slate-500 dark:text-slate-400">
                No recording has been added for this session yet.
              </p>
            </div>
          </div>
        )}
    </article>
  );
};

/* --------------------------------
   Recording Details
--------------------------------- */

const RecordingDetails = ({
  recording,
}) => {
  const access =
    ACCESS_OPTIONS.find(
      (option) =>
        option.value ===
        recording.access
    ) ||
    ACCESS_OPTIONS[1];

  const isPrivate =
    recording.access === "private";

  return (
    <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 dark:bg-slate-900 dark:text-indigo-400">
            <PlayCircle size={18} />
          </div>

          <div>
            <p className="text-[9px] font-bold text-slate-800 dark:text-white">
              {recording.title}
            </p>

            <div className="mt-2 flex flex-wrap gap-3 text-[7px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Clock3 size={10} />
                {recording.duration ||
                  "Duration unavailable"}
              </span>

              <span className="flex items-center gap-1">
                {isPrivate ? (
                  <Lock size={10} />
                ) : (
                  <Unlock size={10} />
                )}

                {access.label}
              </span>
            </div>
          </div>
        </div>

        {!isPrivate && (
          <a
            href={recording.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[7px] font-bold text-white hover:bg-indigo-700"
          >
            <PlayCircle size={12} />
            Watch Recording
            <ExternalLink size={10} />
          </a>
        )}
      </div>

      {/* Resources */}
      {recording.resources?.length >
        0 && (
        <div className="mt-4 border-t border-indigo-100 pt-4 dark:border-indigo-900/30">
          <p className="flex items-center gap-1.5 text-[7px] font-bold text-slate-600 dark:text-slate-300">
            <FileText size={11} />
            Related Resources
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {recording.resources.map(
              (item, index) => (
                <a
                  key={`${item.url}-${index}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[7px] font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-slate-900 dark:text-indigo-400"
                >
                  <Link2 size={10} />
                  {item.title}
                  <ExternalLink
                    size={9}
                  />
                </a>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* --------------------------------
   Recording Form
--------------------------------- */

const RecordingForm = ({
  session,
  form,
  setForm,
  resource,
  setResource,
  onAddResource,
  onRemoveResource,
  onClose,
  onSubmit,
  saving,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6 dark:bg-slate-900">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[7px] font-bold uppercase tracking-wide text-indigo-500">
              Session Recording
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              {session.title}
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Add or update the recording details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={17} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-6 space-y-5"
        >
          {/* URL */}
          <div>
            <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
              Recording URL *
            </label>

            <div className="relative mt-2">
              <Link2
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="url"
                required
                value={form.url}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    url: event.target.value,
                  }))
                }
                placeholder="https://example.com/recording"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* Title / Duration */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
                Recording Title
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Session recording"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
                Duration
              </label>

              <input
                type="text"
                value={form.duration}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    duration:
                      event.target.value,
                  }))
                }
                placeholder="45 min"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* Access */}
          <div>
            <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
              Access Restrictions
            </label>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {ACCESS_OPTIONS.map(
                (option) => {
                  const selected =
                    form.access ===
                    option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setForm(
                          (current) => ({
                            ...current,
                            access:
                              option.value,
                          })
                        )
                      }
                      className={`rounded-xl border p-3 text-left ${
                        selected
                          ? "border-indigo-300 bg-indigo-50 dark:border-indigo-900/40 dark:bg-indigo-900/10"
                          : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {option.value ===
                        "private" ? (
                          <Lock
                            size={12}
                          />
                        ) : (
                          <Unlock
                            size={12}
                          />
                        )}

                        <p className="text-[7px] font-bold text-slate-700 dark:text-slate-300">
                          {option.label}
                        </p>
                      </div>

                      <p className="mt-1 text-[6px] leading-3 text-slate-400">
                        {option.description}
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Resources */}
          <div>
            <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
              Related Resources
            </label>

            {form.resources.length >
              0 && (
              <div className="mt-3 space-y-2">
                {form.resources.map(
                  (item, index) => (
                    <div
                      key={`${item.url}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText
                          size={13}
                          className="shrink-0 text-indigo-500"
                        />

                        <div className="min-w-0">
                          <p className="truncate text-[7px] font-bold text-slate-700 dark:text-slate-300">
                            {item.title}
                          </p>

                          <p className="truncate text-[6px] text-slate-400">
                            {item.url}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onRemoveResource(
                            index
                          )
                        }
                        className="shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                      >
                        <Trash2
                          size={12}
                        />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                type="text"
                value={resource.title}
                onChange={(event) =>
                  setResource(
                    (current) => ({
                      ...current,
                      title:
                        event.target.value,
                    })
                  )
                }
                placeholder="Resource title"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[8px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />

              <input
                type="url"
                value={resource.url}
                onChange={(event) =>
                  setResource(
                    (current) => ({
                      ...current,
                      url: event.target.value,
                    })
                  )
                }
                placeholder="Resource URL"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[8px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />

              <button
                type="button"
                onClick={onAddResource}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-[7px] font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                Add
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-5 py-3 text-[8px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Recording"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --------------------------------
   Summary Badge
--------------------------------- */

const SummaryBadge = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-center dark:border-slate-700 dark:bg-slate-900">
      <p className="text-[6px] uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = () => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <Video
        size={30}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-300">
        No sessions found
      </p>

      <p className="mt-1 text-[7px] text-slate-400">
        Try changing your search or filter.
      </p>
    </div>
  );
};

export default EventSessionRecordingLinks;