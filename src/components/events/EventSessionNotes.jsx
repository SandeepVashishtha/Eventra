import {
  Edit3,
  FileText,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const EventSessionNotes = ({
  sessions = [],
  initialNotes = [],
  onSave,
  onDelete,
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [search, setSearch] = useState("");
  const [selectedSession, setSelectedSession] =
    useState(null);
  const [editingNote, setEditingNote] =
    useState(null);
  const [noteText, setNoteText] = useState("");

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return notes;

    return notes.filter(
      (note) =>
        note.title?.toLowerCase().includes(query) ||
        note.content?.toLowerCase().includes(query) ||
        note.sessionName
          ?.toLowerCase()
          .includes(query)
    );
  }, [notes, search]);

  const openCreateNote = (session) => {
    setSelectedSession(session);
    setEditingNote(null);
    setNoteText("");
  };

  const openEditNote = (note) => {
    setSelectedSession({
      id: note.sessionId,
      name: note.sessionName,
    });

    setEditingNote(note);
    setNoteText(note.content || "");
  };

  const closeEditor = () => {
    setSelectedSession(null);
    setEditingNote(null);
    setNoteText("");
  };

  const handleSave = async () => {
    if (!noteText.trim() || !selectedSession) {
      return;
    }

    const now = new Date().toISOString();

    if (editingNote) {
      const updatedNote = {
        ...editingNote,
        content: noteText.trim(),
        updatedAt: now,
      };

      setNotes((current) =>
        current.map((note) =>
          note.id === editingNote.id
            ? updatedNote
            : note
        )
      );

      await onSave?.(updatedNote);
    } else {
      const newNote = {
        id: `note-${Date.now()}`,
        sessionId: selectedSession.id,
        sessionName: selectedSession.name,
        title: selectedSession.name,
        content: noteText.trim(),
        createdAt: now,
        updatedAt: now,
        private: true,
      };

      setNotes((current) => [
        newNote,
        ...current,
      ]);

      await onSave?.(newNote);
    }

    closeEditor();
  };

  const handleDelete = async (note) => {
    const confirmed = window.confirm(
      "Delete this private session note?"
    );

    if (!confirmed) return;

    setNotes((current) =>
      current.filter(
        (item) => item.id !== note.id
      )
    );

    await onDelete?.(note);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <FileText size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Personal Workspace
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              My Session Notes
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Create private notes for the sessions you
              attend.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white px-5 py-3 text-center shadow-sm dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wider text-slate-400">
            Total Notes
          </p>

          <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
            {notes.length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mt-6">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search your session notes..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </div>

      {/* Session List */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[9px] font-bold text-slate-700 dark:text-slate-300">
            Event Sessions
          </h3>

          <span className="text-[7px] text-slate-400">
            {sessions.length} sessions
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => {
            const sessionNotes = notes.filter(
              (note) =>
                note.sessionId === session.id
            );

            return (
              <div
                key={session.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
                      {session.name}
                    </h4>

                    {session.speaker && (
                      <p className="mt-1 text-[7px] text-slate-400">
                        {session.speaker}
                      </p>
                    )}

                    {session.time && (
                      <p className="mt-1 text-[7px] text-slate-400">
                        {session.time}
                      </p>
                    )}
                  </div>

                  {sessionNotes.length > 0 && (
                    <span className="rounded-full bg-indigo-50 px-2 py-1 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                      {sessionNotes.length} note
                      {sessionNotes.length !== 1
                        ? "s"
                        : ""}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openCreateNote(session)
                  }
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[7px] font-bold text-white hover:bg-indigo-700"
                >
                  <Plus size={12} />
                  Add Private Note
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[9px] font-bold text-slate-700 dark:text-slate-300">
            Saved Notes
          </h3>

          <span className="text-[7px] text-slate-400">
            Private to you
          </span>
        </div>

        {filteredNotes.length === 0 ? (
          <EmptyState
            hasSearch={Boolean(search)}
          />
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() =>
                  openEditNote(note)
                }
                onDelete={() =>
                  handleDelete(note)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Editor */}
      {selectedSession && (
        <NoteEditor
          session={selectedSession}
          editingNote={editingNote}
          value={noteText}
          onChange={setNoteText}
          onSave={handleSave}
          onClose={closeEditor}
        />
      )}
    </section>
  );
};

/* --------------------------------
   Note Card
--------------------------------- */

const NoteCard = ({
  note,
  onEdit,
  onDelete,
}) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
              {note.title ||
                note.sessionName}
            </h4>

            <span className="rounded-full bg-green-50 px-2 py-1 text-[6px] font-bold text-green-600 dark:bg-green-900/10 dark:text-green-400">
              Private
            </span>
          </div>

          <p className="mt-1 text-[7px] text-indigo-500 dark:text-indigo-400">
            {note.sessionName}
          </p>
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit note"
            className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20"
          >
            <Edit3 size={13} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete note"
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
        <p className="whitespace-pre-wrap text-[8px] leading-5 text-slate-600 dark:text-slate-300">
          {note.content}
        </p>
      </div>

      <p className="mt-3 text-[6px] text-slate-400">
        Updated{" "}
        {formatDate(note.updatedAt)}
      </p>
    </article>
  );
};

/* --------------------------------
   Note Editor
--------------------------------- */

const NoteEditor = ({
  session,
  editingNote,
  value,
  onChange,
  onSave,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Private Note
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              {editingNote
                ? "Edit Session Note"
                : "Create Session Note"}
            </h3>

            <p className="mt-1 text-[8px] text-slate-400">
              {session.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <textarea
          autoFocus
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder="Write down important points, ideas, questions, or takeaways..."
          rows={10}
          maxLength={5000}
          className="mt-6 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />

        <div className="mt-2 flex justify-between">
          <span className="text-[7px] text-green-600 dark:text-green-400">
            🔒 Only you can see this note
          </span>

          <span className="text-[7px] text-slate-400">
            {value.length}/5000
          </span>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-3 text-[8px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!value.trim()}
            onClick={onSave}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={13} />
            {editingNote
              ? "Update Note"
              : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = ({
  hasSearch,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <FileText
        size={30}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-300">
        {hasSearch
          ? "No notes found"
          : "No session notes yet"}
      </p>

      <p className="mt-1 text-[7px] text-slate-400">
        {hasSearch
          ? "Try a different search term."
          : "Create a private note from any session above."}
      </p>
    </div>
  );
};

/* --------------------------------
   Date Helper
--------------------------------- */

const formatDate = (value) => {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

export default EventSessionNotes;