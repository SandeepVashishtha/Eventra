import {
  BookOpen,
  ExternalLink,
  FileText,
  Link2,
  PlayCircle,
  Presentation,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";

const DEFAULT_SESSIONS = [
  {
    id: 1,
    title: "AI & Machine Learning Workshop",
    speaker: "Dr. Priya Sharma",
    resources: [
      {
        id: 1,
        type: "Presentation",
        name: "AI Workshop Slides.pdf",
        url: "#",
      },
      {
        id: 2,
        type: "Reading Material",
        name: "Machine Learning Guide.pdf",
        url: "#",
      },
      {
        id: 3,
        type: "Recording",
        name: "Workshop Recording",
        url: "#",
      },
    ],
  },
  {
    id: 2,
    title: "Modern React Development",
    speaker: "Rahul Mehta",
    resources: [
      {
        id: 4,
        type: "Speaker Notes",
        name: "React Speaker Notes.pdf",
        url: "#",
      },
      {
        id: 5,
        type: "External Link",
        name: "React Documentation",
        url: "https://react.dev",
      },
    ],
  },
];

const RESOURCE_TYPES = [
  "Presentation",
  "Speaker Notes",
  "Reading Material",
  "Recording",
  "External Link",
  "Assignment",
];

const RESOURCE_ICONS = {
  Presentation,
  "Speaker Notes": FileText,
  "Reading Material": BookOpen,
  Recording: PlayCircle,
  "External Link": Link2,
  Assignment: FileText,
};

const EventSessionResourceAssociation = ({
  initialSessions = DEFAULT_SESSIONS,
}) => {
  const [sessions, setSessions] =
    useState(initialSessions);

  const [selectedSessionId, setSelectedSessionId] =
    useState(initialSessions[0]?.id);

  const [showAddResource, setShowAddResource] =
    useState(false);

  const [resourceType, setResourceType] =
    useState("Presentation");

  const [resourceName, setResourceName] =
    useState("");

  const [resourceUrl, setResourceUrl] =
    useState("");

  const selectedSession = sessions.find(
    (session) => session.id === selectedSessionId
  );

  const addResource = (event) => {
    event.preventDefault();

    if (!resourceName.trim()) return;

    const newResource = {
      id: Date.now(),
      type: resourceType,
      name: resourceName.trim(),
      url: resourceUrl.trim() || "#",
    };

    setSessions((current) =>
      current.map((session) =>
        session.id === selectedSessionId
          ? {
              ...session,
              resources: [
                ...session.resources,
                newResource,
              ],
            }
          : session
      )
    );

    setResourceName("");
    setResourceUrl("");
    setResourceType("Presentation");
    setShowAddResource(false);
  };

  const removeResource = (resourceId) => {
    setSessions((current) =>
      current.map((session) =>
        session.id === selectedSessionId
          ? {
              ...session,
              resources: session.resources.filter(
                (resource) =>
                  resource.id !== resourceId
              ),
            }
          : session
      )
    );
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Presentation size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Tools
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Session Resources
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Associate presentations, recordings, reading
              material, links, and assignments with individual
              sessions.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddResource(true)}
          disabled={!selectedSession}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[7px] font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload size={13} />
          Add Resource
        </button>
      </div>

      {/* Session Selector */}
      <div className="mt-6">
        <div className="flex items-center gap-2">
          <Presentation
            size={14}
            className="text-indigo-500"
          />

          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Select Session
          </h3>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {sessions.map((session) => {
            const selected =
              session.id === selectedSessionId;

            return (
              <button
                key={session.id}
                type="button"
                onClick={() =>
                  setSelectedSessionId(session.id)
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20"
                    : "border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
                      {session.title}
                    </h4>

                    <div className="mt-2 flex items-center gap-1.5">
                      <UserRound
                        size={10}
                        className="text-slate-400"
                      />

                      <span className="text-[6px] text-slate-400">
                        {session.speaker}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[5px] font-bold ${
                      selected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {session.resources.length} resources
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Session */}
      {selectedSession && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[6px] font-bold uppercase tracking-wide text-indigo-500">
                Selected Session
              </p>

              <h3 className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
                {selectedSession.title}
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Speaker: {selectedSession.speaker}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 px-3 py-2 text-center dark:bg-slate-800">
              <p className="text-[6px] text-slate-400">
                Resources
              </p>

              <p className="text-lg font-black text-slate-800 dark:text-white">
                {selectedSession.resources.length}
              </p>
            </div>
          </div>

          {/* Resource List */}
          <div className="mt-5 space-y-3">
            {selectedSession.resources.map((resource) => {
              const Icon =
                RESOURCE_ICONS[resource.type] ||
                FileText;

              return (
                <div
                  key={resource.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-950"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[6px] font-bold uppercase tracking-wide text-indigo-500">
                        {resource.type}
                      </p>

                      <h4 className="mt-1 truncate text-[8px] font-bold text-slate-700 dark:text-slate-300">
                        {resource.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-[6px] font-bold text-white hover:bg-indigo-700"
                    >
                      <ExternalLink size={11} />
                      Open
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        removeResource(resource.id)
                      }
                      className="flex items-center justify-center rounded-xl border border-red-200 px-3 py-2 text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10"
                      aria-label={`Remove ${resource.name}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              );
            })}

            {selectedSession.resources.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <FileText
                  size={24}
                  className="mx-auto text-slate-400"
                />

                <p className="mt-3 text-[8px] font-bold text-slate-600 dark:text-slate-300">
                  No resources associated
                </p>

                <p className="mt-1 text-[6px] text-slate-400">
                  Add presentations, recordings, links, or
                  other resources to this session.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resource Type Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RESOURCE_TYPES.map((type) => {
          const Icon =
            RESOURCE_ICONS[type] || FileText;

          const count = sessions.reduce(
            (total, session) =>
              total +
              session.resources.filter(
                (resource) => resource.type === type
              ).length,
            0
          );

          return (
            <div
              key={type}
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <Icon size={15} />
                </div>

                <div>
                  <p className="text-[6px] font-bold text-slate-400">
                    {type}
                  </p>

                  <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
                    {count}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Resource Modal */}
      {showAddResource && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[7px] font-bold uppercase tracking-wide text-indigo-500">
                  Add Session Resource
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
                  {selectedSession.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowAddResource(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={addResource}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
                  Resource Type
                </label>

                <select
                  value={resourceType}
                  onChange={(event) =>
                    setResourceType(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[7px] text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                >
                  {RESOURCE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
                  Resource Name
                </label>

                <input
                  type="text"
                  value={resourceName}
                  onChange={(event) =>
                    setResourceName(event.target.value)
                  }
                  placeholder="e.g. AI Workshop Slides"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[7px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                />
              </div>

              <div>
                <label className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
                  Resource URL
                </label>

                <input
                  type="url"
                  value={resourceUrl}
                  onChange={(event) =>
                    setResourceUrl(event.target.value)
                  }
                  placeholder="https://example.com/resource"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[7px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowAddResource(false)
                  }
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-[7px] font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-[7px] font-bold text-white hover:bg-indigo-700"
                >
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventSessionResourceAssociation;