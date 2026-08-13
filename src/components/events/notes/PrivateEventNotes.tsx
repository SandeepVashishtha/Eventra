import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

interface EventNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface PrivateEventNotesProps {
  eventId: string | number;
  eventName?: string;
  authenticated?: boolean;
  initialNotes?: EventNote[];
  onNotesChange?: (notes: EventNote[]) => void;
}

const PrivateEventNotes: React.FC<
  PrivateEventNotesProps
> = ({
  eventId,
  eventName = "Event",
  authenticated = true,
  initialNotes = [],
  onNotesChange,
}) => {
  const storageKey = `eventra-private-notes-${eventId}`;

  const [notes, setNotes] =
    useState<EventNote[]>(initialNotes);

  const [noteText, setNoteText] =
    useState("");

  const [editingNoteId, setEditingNoteId] =
    useState<string | null>(null);

  const [isEditorOpen, setIsEditorOpen] =
    useState(false);

  const [deleteNoteId, setDeleteNoteId] =
    useState<string | null>(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [message, setMessage] =
    useState("");

  /*
   * Load notes saved for this event.
   */
  useEffect(() => {
    try {
      const savedNotes =
        localStorage.getItem(storageKey);

      if (savedNotes) {
        const parsed =
          JSON.parse(savedNotes);

        if (Array.isArray(parsed)) {
          setNotes(parsed);
        }
      }
    } catch {
      /*
       * Ignore invalid local storage data.
       */
    }
  }, [storageKey]);

  /*
   * Persist notes whenever they change.
   */
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(notes)
      );
    } catch {
      /*
       * Ignore storage errors.
       */
    }

    onNotesChange?.(notes);
  }, [
    notes,
    storageKey,
    onNotesChange,
  ]);

  const filteredNotes = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    if (!query) {
      return notes;
    }

    return notes.filter((note) =>
      note.content
        .toLowerCase()
        .includes(query)
    );
  }, [notes, searchQuery]);

  const showMessage = (
    text: string
  ) => {
    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  const openCreateEditor = () => {
    setEditingNoteId(null);
    setNoteText("");
    setIsEditorOpen(true);
  };

  const openEditEditor = (
    note: EventNote
  ) => {
    setEditingNoteId(note.id);
    setNoteText(note.content);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setEditingNoteId(null);
    setNoteText("");
    setIsEditorOpen(false);
  };

  const saveNote = () => {
    const content =
      noteText.trim();

    if (!content) {
      showMessage(
        "Please enter something in your note."
      );
      return;
    }

    const now =
      new Date().toISOString();

    if (editingNoteId) {
      setNotes((previous) =>
        previous.map((note) =>
          note.id === editingNoteId
            ? {
                ...note,
                content,
                updatedAt: now,
              }
            : note
        )
      );

      showMessage("Note updated successfully.");
    } else {
      const newNote: EventNote = {
        id: `${eventId}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        content,
        createdAt: now,
        updatedAt: now,
      };

      setNotes((previous) => [
        newNote,
        ...previous,
      ]);

      showMessage("Private note added.");
    }

    closeEditor();
  };

  const confirmDelete = (
    noteId: string
  ) => {
    setDeleteNoteId(noteId);
  };

  const deleteNote = () => {
    if (!deleteNoteId) {
      return;
    }

    setNotes((previous) =>
      previous.filter(
        (note) =>
          note.id !== deleteNoteId
      )
    );

    setDeleteNoteId(null);

    showMessage("Note deleted.");
  };

  const formatDate = (
    dateString: string
  ) => {
    const date =
      new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString(
      "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  if (!authenticated) {
    return (
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-2xl dark:bg-gray-800">
            🔒
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Private Event Notes
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Sign in to create and manage your
              private notes for this event.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-5 dark:border-gray-700 dark:from-yellow-950/30 dark:via-gray-900 dark:to-orange-950/30 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-2xl dark:bg-yellow-950">
              📝
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                Personal Notes
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                My Notes for {eventName}
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Keep private reminders, questions,
                preparation tasks, or anything else you
                want to remember about this event.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateEditor}
            className="shrink-0 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            + Add Note
          </button>
        </div>

        {/* Privacy notice */}
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-100/70 p-4 dark:border-yellow-900 dark:bg-yellow-950/40">
          <span className="text-lg">
            🔐
          </span>

          <div>
            <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-300">
              Your notes are private
            </p>

            <p className="mt-1 text-xs leading-5 text-yellow-800 dark:text-yellow-400">
              These notes are associated with your
              account and this event. Other participants
              and organizers cannot see your personal
              notes.
            </p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="border-b border-gray-200 px-5 py-3 dark:border-gray-700">
          <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
            ✓ {message}
          </div>
        </div>
      )}

      {/* Search */}
      {notes.length > 0 && (
        <div className="border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
          <label
            htmlFor="event-note-search"
            className="sr-only"
          >
            Search notes
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔎
            </span>

            <input
              id="event-note-search"
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search your notes..."
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-orange-950"
            />
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="p-5 sm:p-6">
        {notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100 text-3xl dark:bg-yellow-950">
              📝
            </div>

            <h3 className="mt-5 text-base font-bold text-gray-900 dark:text-white">
              No private notes yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
              Add a personal note to remember something
              important about {eventName}.
            </p>

            <button
              type="button"
              onClick={openCreateEditor}
              className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Create Your First Note
            </button>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="text-3xl">
              🔎
            </div>

            <h3 className="mt-3 text-base font-bold text-gray-900 dark:text-white">
              No notes found
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try a different search term.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Your Notes
                </h3>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {filteredNotes.length} note
                  {filteredNotes.length !== 1
                    ? "s"
                    : ""}
                </p>
              </div>
            </div>

            {filteredNotes.map(
              (note) => (
                <article
                  key={note.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-orange-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-orange-800"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-xl dark:bg-yellow-950">
                      📝
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700 dark:text-gray-300">
                        {note.content}
                      </p>

                      <p className="mt-4 text-xs text-gray-400">
                        Updated{" "}
                        {formatDate(
                          note.updatedAt
                        )}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          openEditEditor(
                            note
                          )
                        }
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-orange-600 dark:hover:bg-gray-800 dark:hover:text-orange-400"
                        aria-label="Edit note"
                      >
                        ✏️
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          confirmDelete(
                            note.id
                          )
                        }
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                        aria-label="Delete note"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>

      {/* Editor modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
            role="dialog"
            aria-modal="true"
            aria-labelledby="private-note-title"
          >
            <div className="border-b border-gray-200 p-5 dark:border-gray-700">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="private-note-title"
                    className="text-lg font-bold text-gray-900 dark:text-white"
                  >
                    {editingNoteId
                      ? "Edit Private Note"
                      : "Add Private Note"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Only you can see this note.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  aria-label="Close note editor"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5">
              <label
                htmlFor="private-event-note"
                className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Your note
              </label>

              <textarea
                id="private-event-note"
                value={noteText}
                onChange={(event) =>
                  setNoteText(
                    event.target.value
                  )
                }
                placeholder="Write something you want to remember..."
                rows={7}
                maxLength={2000}
                autoFocus
                className="w-full resize-none rounded-xl border border-gray-300 bg-white p-4 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-orange-950"
              />

              <div className="mt-2 flex justify-end">
                <span className="text-xs text-gray-400">
                  {noteText.length}/2000
                </span>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveNote}
                  className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  {editingNoteId
                    ? "Save Changes"
                    : "Save Note"}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>🔐</span>
                <span>
                  This note is private and associated
                  only with your Eventra account and
                  this event.
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteNoteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-2xl dark:bg-red-950">
              🗑️
            </div>

            <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
              Delete this note?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              This action cannot be undone. Your
              private note will be permanently removed.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setDeleteNoteId(null)
                }
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Keep Note
              </button>

              <button
                type="button"
                onClick={deleteNote}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <span className="text-lg">
            🔒
          </span>

          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Your notes are private
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
              Notes are stored separately for this event
              and are not displayed to other participants
              or organizers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivateEventNotes;