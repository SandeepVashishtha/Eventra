import {
  CalendarDays,
  Edit3,
  Lock,
  Plus,
  Save,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";

const DEFAULT_NOTES = [
  {
    id: 1,
    text: "Participant requested additional information about the workshop schedule.",
    createdAt: "August 12, 2026",
    updatedAt: "August 12, 2026",
    organizer: "Jainiksha",
  },
  {
    id: 2,
    text: "Follow up regarding team formation before the registration deadline.",
    createdAt: "August 10, 2026",
    updatedAt: "August 11, 2026",
    organizer: "Jainiksha",
  },
];

const EventOrganizerParticipantNotes = ({
  participant = {
    name: "Alex Johnson",
    email: "alex@example.com",
    registrationId: "EVT-2026-1042",
  },
  initialNotes = DEFAULT_NOTES,
  currentOrganizer = "Jainiksha",
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const addNote = () => {
    const text = newNote.trim();

    if (!text) return;

    const today = new Date().toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );

    const note = {
      id: Date.now(),
      text,
      createdAt: today,
      updatedAt: today,
      organizer: currentOrganizer,
    };

    setNotes((current) => [note, ...current]);
    setNewNote("");
  };

  const startEditing = (note) => {
    setEditingId(note.id);
    setEditingText(note.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = (id) => {
    const text = editingText.trim();

    if (!text) return;

    const today = new Date().toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );

    setNotes((current) =>
      current.map((note) =>
        note.id === id
          ? {
              ...note,
              text,
              updatedAt: today,
            }
          : note
      )
    );

    cancelEditing();
  };

  const deleteNote = (id) => {
    setNotes((current) =>
      current.filter((note) => note.id !== id)
    );

    if (editingId === id) {
      cancelEditing();
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Lock size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Only
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Participant Notes
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Maintain private administrative notes about this
              participant. Notes are visible only to authorized
              organizers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 dark:border-green-900/30 dark:bg-green-900/10">
          <Lock
            size={12}
            className="text-green-600 dark:text-green-400"
          />

          <span className="text-[6px] font-bold text-green-600 dark:text-green-400">
            Private & Secure
          </span>
        </div>
      </div>

      {/* Participant Information */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <UserRound size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
              Participant
            </p>

            <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
              {participant.name}
            </h3>

            <div className="mt-1 flex flex-wrap gap-3 text-[6px] text-slate-400">
              <span>{participant.email}</span>
              <span>•</span>
              <span>{participant.registrationId}</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
            <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
              Total Notes
            </p>

            <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
              {notes.length}
            </p>
          </div>
        </div>
      </div>

      {/* Add Note */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Plus
            size={15}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
            Add Private Note
          </h3>
        </div>

        <textarea
          value={newNote}
          onChange={(event) =>
            setNewNote(event.target.value)
          }
          placeholder="Write an internal note about this participant..."
          rows={4}
          className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-indigo-900/30"
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-[6px] text-slate-400">
            <Lock size={10} />
            Only authorized organizers can view this note.
          </div>

          <button
            type="button"
            onClick={addNote}
            disabled={!newNote.trim()}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[7px] font-bold transition ${
              newNote.trim()
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
            }`}
          >
            <Plus size={13} />
            Add Note
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-6">
        <div className="mb-4">
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Note History
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Internal participant notes and administrative
            follow-ups.
          </p>
        </div>

        {notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                editing={editingId === note.id}
                editingText={editingText}
                setEditingText={setEditingText}
                onEdit={() => startEditing(note)}
                onSave={() => saveEdit(note.id)}
                onCancel={cancelEditing}
                onDelete={() => deleteNote(note.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyNotes />
        )}
      </div>
    </section>
  );
};

/* --------------------------------
   Note Card
--------------------------------- */

const NoteCard = ({
  note,
  editing,
  editingText,
  setEditingText,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Lock size={15} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[7px] font-bold text-slate-700 dark:text-slate-300">
                Added by {note.organizer}
              </p>

              <p className="mt-1 flex items-center gap-1 text-[6px] text-slate-400">
                <CalendarDays size={9} />
                Created {note.createdAt}
              </p>
            </div>

            {!editing && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onEdit}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                  aria-label="Edit note"
                >
                  <Edit3 size={13} />
                </button>

                <button
                  type="button"
                  onClick={onDelete}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  aria-label="Delete note"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="mt-4">
              <textarea
                value={editingText}
                onChange={(event) =>
                  setEditingText(event.target.value)
                }
                rows={4}
                className="w-full resize-none rounded-xl border border-indigo-300 bg-slate-50 p-3 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 dark:border-indigo-700 dark:bg-slate-950 dark:text-slate-200"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={!editingText.trim()}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[7px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Save size={12} />
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-[7px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <X size={12} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-4 whitespace-pre-wrap text-[8px] leading-5 text-slate-600 dark:text-slate-300">
              {note.text}
            </p>
          )}

          {!editing && note.updatedAt !== note.createdAt && (
            <p className="mt-3 text-[6px] text-slate-400">
              Last updated {note.updatedAt}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyNotes = () => (
  <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center dark:border-slate-700">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
      <Lock size={20} />
    </div>

    <h4 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
      No private notes yet
    </h4>

    <p className="mt-1 max-w-sm text-[7px] leading-4 text-slate-400">
      Add an internal note to keep track of participant
      interactions and administrative follow-ups.
    </p>
  </div>
);

export default EventOrganizerParticipantNotes;