import {
  BookOpen,
  Lock,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import {
  deleteEventNote,
  getEventNotes,
} from "../../utils/eventNotesUtils";

import EventNoteEditor from "./EventNoteEditor";

const EventNotes = ({
  event = {},
  user = {},
  notes = [],
  onChange,
}) => {
  const [isEditorOpen, setIsEditorOpen] =
    useState(false);

  const [editingNote, setEditingNote] =
    useState(null);

  const eventId =
    event.id ??
    event.eventId ??
    event.event_id;

  const userId =
    user.id ??
    user.userId ??
    user.user_id;

  const eventNotes =
    getEventNotes({
      notes,
      eventId,
      userId,
    });

  const handleAddNote = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleDeleteNote = (noteId) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this note?"
      );

    if (!confirmed) {
      return;
    }

    const updatedNotes =
      deleteEventNote(
        notes,
        noteId
      );

    onChange?.(updatedNotes);
  };

  const handleSave = (updatedNotes) => {
    onChange?.(updatedNotes);
    setIsEditorOpen(false);
    setEditingNote(null);
  };

  const handleCancel = () => {
    setIsEditorOpen(false);
    setEditingNote(null);
  };

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <BookOpen
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                My Event Notes
              </h2>

              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <Lock size={11} />
                Private
              </span>
            </div>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Save personal preparation tasks, questions,
              links, and reminders for this event.
            </p>
          </div>
        </div>

        {!isEditorOpen && (
          <button
            type="button"
            onClick={handleAddNote}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus size={16} />
            Add Note
          </button>
        )}
      </div>

      {/* Editor */}
      {isEditorOpen && (
        <div className="border-b border-slate-200 p-5 dark:border-slate-700">
          <EventNoteEditor
            event={event}
            user={user}
            notes={notes}
            note={editingNote}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Notes */}
      <div className="p-5">
        {eventNotes.length > 0 ? (
          <div className="space-y-3">
            {eventNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() =>
                  handleEditNote(note)
                }
                onDelete={() =>
                  handleDeleteNote(note.id)
                }
              />
            ))}
          </div>
        ) : (
          <EmptyNotesState
            onAddNote={handleAddNote}
          />
        )}
      </div>
    </section>
  );
};

/**
 * Individual note card.
 */
const NoteCard = ({
  note,
  onEdit,
  onDelete,
}) => {
  return (
    <article className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-800">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {note.title && (
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                {note.title}
              </h3>
            )}

            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-400 dark:bg-slate-900">
              <Lock size={10} />
              Private
            </span>
          </div>

          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
            {note.content}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            {note.createdAt && (
              <span>
                Created{" "}
                {formatNoteDate(
                  note.createdAt
                )}
              </span>
            )}

            {note.updatedAt &&
              note.updatedAt !==
                note.createdAt && (
                <span>
                  Updated{" "}
                  {formatNoteDate(
                    note.updatedAt
                  )}
                </span>
              )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit note"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-indigo-600 dark:hover:bg-slate-900 dark:hover:text-indigo-400"
          >
            <Pencil size={15} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete note"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
};

/**
 * Empty state.
 */
const EmptyNotesState = ({
  onAddNote,
}) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <BookOpen
          size={22}
          className="text-slate-400"
        />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
        No personal notes yet
      </h3>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-400">
        Add preparation tasks, questions, important links,
        things to bring, or personal reminders.
      </p>

      <button
        type="button"
        onClick={onAddNote}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
      >
        <Plus size={14} />
        Add Your First Note
      </button>
    </div>
  );
};

/**
 * Format note dates safely.
 */
const formatNoteDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

export default EventNotes;