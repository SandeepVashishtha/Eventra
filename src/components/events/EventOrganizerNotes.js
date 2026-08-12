import {
  Check,
  Edit3,
  FileText,
  Pin,
  Plus,
  Search,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "eventra-organizer-notes";

const EventOrganizerNotes = ({
  eventId = "default-event",
  initialNotes = [],
  storageKey = STORAGE_KEY,
  onNotesChange,
  className = "",
}) => {
  const getStorageKey = () =>
    `${storageKey}-${eventId}`;

  const [notes, setNotes] = useState(() => {
    const saved = loadNotes(
      getStorageKey()
    );

    return saved.length > 0
      ? saved
      : initialNotes.map(normalizeNote);
  });

  const [search, setSearch] =
    useState("");

  const [isEditorOpen, setIsEditorOpen] =
    useState(false);

  const [editingNote, setEditingNote] =
    useState(null);

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    saveNotes(
      getStorageKey(),
      notes
    );

    onNotesChange?.(notes);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return sortNotes(notes);
    }

    return sortNotes(
      notes.filter((note) => {
        return (
          note.title
            .toLowerCase()
            .includes(query) ||
          note.content
            .toLowerCase()
            .includes(query)
        );
      })
    );
  }, [notes, search]);

  const pinnedCount = notes.filter(
    (note) => note.pinned
  ).length;

  const openCreateEditor = () => {
    setEditingNote(null);
    setTitle("");
    setContent("");
    setError("");
    setIsEditorOpen(true);
  };

  const openEditEditor = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setError("");
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingNote(null);
    setTitle("");
    setContent("");
    setError("");
  };

  const saveNote = () => {
    const trimmedTitle =
      title.trim();

    const trimmedContent =
      content.trim();

    if (!trimmedTitle) {
      setError(
        "Please enter a note title."
      );
      return;
    }

    if (!trimmedContent) {
      setError(
        "Please enter some note content."
      );
      return;
    }

    if (editingNote) {
      setNotes((current) =>
        current.map((note) =>
          note.id ===
          editingNote.id
            ? {
                ...note,
                title:
                  trimmedTitle,
                content:
                  trimmedContent,
                updatedAt:
                  new Date().toISOString(),
              }
            : note
        )
      );
    } else {
      const newNote = {
        id: createId(),
        title:
          trimmedTitle,
        content:
          trimmedContent,
        pinned: false,
        createdAt:
          new Date().toISOString(),
        updatedAt:
          new Date().toISOString(),
      };

      setNotes((current) => [
        newNote,
        ...current,
      ]);
    }

    closeEditor();
  };

  const deleteNote = (noteId) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this note?"
      );

    if (!confirmed) {
      return;
    }

    setNotes((current) =>
      current.filter(
        (note) =>
          note.id !== noteId
      )
    );
  };

  const togglePin = (noteId) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === noteId
          ? {
              ...note,
              pinned:
                !note.pinned,
              updatedAt:
                new Date().toISOString(),
            }
          : note
      )
    );
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <FileText
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Workspace
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Event Organizer Notes
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Keep private reminders, tasks, and internal
              event-management information in one place.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start">
          <div className="rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-slate-900">
            <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
              Notes
            </p>

            <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-white">
              {notes.length}
            </p>
          </div>

          <div className="rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-slate-900">
            <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
              Pinned
            </p>

            <p className="mt-0.5 text-sm font-bold text-amber-500">
              {pinnedCount}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
        <Shield
          size={17}
          className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
        />

        <div>
          <p className="text-xs font-bold text-green-800 dark:text-green-300">
            Private organizer notes
          </p>

          <p className="mt-1 text-[10px] leading-4 text-green-700 dark:text-green-400">
            These notes are intended for event organizers and
            are not displayed to event participants.
          </p>
        </div>
      </div>

      {/* Search and create */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
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
            placeholder="Search notes..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>

        <button
          type="button"
          onClick={openCreateEditor}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-indigo-700"
        >
          <Plus size={15} />
          New Note
        </button>
      </div>

      {/* Search result count */}
      {search.trim() && (
        <p className="mt-3 text-[10px] text-slate-400">
          Showing{" "}
          <span className="font-bold text-slate-600 dark:text-slate-300">
            {filteredNotes.length}
          </span>{" "}
          matching note
          {filteredNotes.length === 1
            ? ""
            : "s"}
        </p>
      )}

      {/* Notes */}
      <div className="mt-5">
        {filteredNotes.length === 0 ? (
          <EmptyNotesState
            searching={
              Boolean(search.trim())
            }
            onCreate={
              openCreateEditor
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filteredNotes.map(
              (note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={() =>
                    openEditEditor(
                      note
                    )
                  }
                  onDelete={() =>
                    deleteNote(
                      note.id
                    )
                  }
                  onTogglePin={() =>
                    togglePin(
                      note.id
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Editor */}
      {isEditorOpen && (
        <NoteEditor
          editing={Boolean(
            editingNote
          )}
          title={title}
          content={content}
          error={error}
          onTitleChange={setTitle}
          onContentChange={
            setContent
          }
          onSave={saveNote}
          onClose={closeEditor}
        />
      )}
    </section>
  );
};

/* ----------------------------------
   Note card
----------------------------------- */

const NoteCard = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
}) => {
  return (
    <article
      className={`group relative rounded-2xl border bg-white p-4 transition hover:shadow-sm dark:bg-slate-900 ${
        note.pinned
          ? "border-amber-200 dark:border-amber-800"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      {/* Pin indicator */}
      {note.pinned && (
        <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          <Pin
            size={13}
            fill="currentColor"
          />
        </div>
      )}

      <div className="pr-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <FileText size={14} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-800 dark:text-white">
              {note.title}
            </h3>

            <p className="text-[8px] text-slate-400">
              {formatRelativeDate(
                note.updatedAt ||
                  note.createdAt
              )}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-[11px] leading-5 text-slate-600 dark:text-slate-300">
        {note.content}
      </p>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        <button
          type="button"
          onClick={onTogglePin}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[9px] font-semibold transition ${
            note.pinned
              ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Pin
            size={12}
            fill={
              note.pinned
                ? "currentColor"
                : "none"
            }
          />

          {note.pinned
            ? "Unpin"
            : "Pin"}
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit note"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
          >
            <Edit3 size={13} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete note"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </article>
  );
};

/* ----------------------------------
   Empty state
----------------------------------- */

const EmptyNotesState = ({
  searching,
  onCreate,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <FileText
          size={21}
          className="text-slate-400"
        />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">
        {searching
          ? "No matching notes"
          : "No organizer notes yet"}
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-[10px] leading-4 text-slate-400">
        {searching
          ? "Try another search term to find a note."
          : "Create a private note to keep track of event tasks, reminders, and internal information."}
      </p>

      {!searching && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[10px] font-bold text-white hover:bg-indigo-700"
        >
          <Plus size={13} />
          Create First Note
        </button>
      )}
    </div>
  );
};

/* ----------------------------------
   Note editor
----------------------------------- */

const NoteEditor = ({
  editing,
  title,
  content,
  error,
  onTitleChange,
  onContentChange,
  onSave,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="organizer-note-editor-title"
        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-6"
      >
        {/* Modal header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <FileText size={18} />
            </div>

            <div>
              <h3
                id="organizer-note-editor-title"
                className="text-base font-bold text-slate-900 dark:text-white"
              >
                {editing
                  ? "Edit Note"
                  : "Create Organizer Note"}
              </h3>

              <p className="mt-1 text-[10px] text-slate-400">
                This note is private to organizers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close note editor"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Title */}
        <div className="mt-6">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Note Title
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <input
            type="text"
            value={title}
            maxLength={100}
            onChange={(event) =>
              onTitleChange(
                event.target.value
              )
            }
            placeholder="e.g. Contact speaker before Friday"
            autoFocus
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          />

          <p className="mt-1 text-right text-[8px] text-slate-400">
            {title.length}/100
          </p>
        </div>

        {/* Content */}
        <div className="mt-4">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Note
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <textarea
            value={content}
            maxLength={2000}
            rows={7}
            onChange={(event) =>
              onContentChange(
                event.target.value
              )
            }
            placeholder="Write your private organizer note..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          />

          <p className="mt-1 text-right text-[8px] text-slate-400">
            {content.length}/2000
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700"
          >
            <Check size={14} />
            {editing
              ? "Update Note"
              : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------
   Helpers
----------------------------------- */

const normalizeNote = (
  note = {}
) => {
  return {
    id:
      note.id ||
      createId(),

    title:
      note.title ||
      "Untitled Note",

    content:
      note.content ||
      "",

    pinned:
      Boolean(note.pinned),

    createdAt:
      note.createdAt ||
      new Date().toISOString(),

    updatedAt:
      note.updatedAt ||
      note.createdAt ||
      new Date().toISOString(),
  };
};

const sortNotes = (
  notes
) => {
  return [...notes].sort(
    (a, b) => {
      if (
        a.pinned !==
        b.pinned
      ) {
        return a.pinned ? -1 : 1;
      }

      return (
        new Date(
          b.updatedAt ||
            b.createdAt
        ).getTime() -
        new Date(
          a.updatedAt ||
            a.createdAt
        ).getTime()
      );
    }
  );
};

const createId = () => {
  if (
    typeof crypto !==
      "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `note-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
};

const formatRelativeDate = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const difference =
    Date.now() -
    date.getTime();

  const minutes = Math.floor(
    difference / 60000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
    }
  ).format(date);
};

const loadNotes = (
  storageKey
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const stored =
      window.localStorage.getItem(
        storageKey
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(
      normalizeNote
    );
  } catch {
    return [];
  }
};

const saveNotes = (
  storageKey,
  notes
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(notes)
    );
  } catch {
    // Ignore localStorage failures.
  }
};

export default EventOrganizerNotes;