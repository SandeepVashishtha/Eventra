import { useEffect, useState } from "react";
import {
  Check,
  FileText,
  Link as LinkIcon,
  X,
} from "lucide-react";

import {
  createEventNote,
  updateEventNote,
  validateEventNote,
  getEventNotes,
} from "../../utils/eventNotesUtils";

const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 2000;

const EventNoteEditor = ({
  event = {},
  user = {},
  notes = [],
  note = null,
  onSave,
  onCancel,
}) => {
  const isEditing = Boolean(note);

  const [title, setTitle] = useState(
    note?.title || ""
  );

  const [content, setContent] = useState(
    note?.content || ""
  );

  const [error, setError] = useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  useEffect(() => {
    setTitle(note?.title || "");
    setContent(note?.content || "");
    setError("");
  }, [note]);

  const eventId =
    event.id ??
    event.eventId ??
    event.event_id;

  const userId =
    user.id ??
    user.userId ??
    user.user_id;

  const handleSubmit = (eventObject) => {
    eventObject.preventDefault();

    if (isSaving) {
      return;
    }

    setError("");

    const validation =
      validateEventNote({
        title,
        content,
      });

    if (!validation.valid) {
      setError(
        validation.errors.join(" ")
      );
      return;
    }

    if (!eventId || !userId) {
      setError(
        "Unable to identify the event or user."
      );
      return;
    }

    setIsSaving(true);

    try {
      let updatedNotes;

      if (isEditing) {
        updatedNotes =
          updateEventNote(
            notes,
            note.id,
            {
              title: title.trim(),
              content: content.trim(),
            }
          );
      } else {
        const newNote =
          createEventNote({
            eventId,
            userId,
            title: title.trim(),
            content: content.trim(),
          });

        updatedNotes = [
          ...getEventNotes({
            notes,
            eventId: null,
            userId: null,
            includeAll: true,
          }),
          newNote,
        ];
      }

      onSave?.(updatedNotes);
    } catch (saveError) {
      setError(
        saveError?.message ||
          "Unable to save your note."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const remainingTitle =
    MAX_TITLE_LENGTH -
    title.length;

  const remainingContent =
    MAX_CONTENT_LENGTH -
    content.length;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Editor header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <FileText
            size={18}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            {isEditing
              ? "Edit Personal Note"
              : "Add Personal Note"}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            This note is private and visible only to
            you.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="event-note-title"
            className="text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Note title
          </label>

          <span
            className={`text-[11px] ${
              remainingTitle < 0
                ? "text-red-500"
                : "text-slate-400"
            }`}
          >
            {title.length}/
            {MAX_TITLE_LENGTH}
          </span>
        </div>

        <input
          id="event-note-title"
          type="text"
          value={title}
          onChange={(eventObject) =>
            setTitle(
              eventObject.target.value
            )
          }
          maxLength={MAX_TITLE_LENGTH}
          placeholder="e.g. Things to bring"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-900/30"
        />
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="event-note-content"
            className="text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Note
          </label>

          <span
            className={`text-[11px] ${
              remainingContent < 0
                ? "text-red-500"
                : "text-slate-400"
            }`}
          >
            {content.length}/
            {MAX_CONTENT_LENGTH}
          </span>
        </div>

        <textarea
          id="event-note-content"
          value={content}
          onChange={(eventObject) =>
            setContent(
              eventObject.target.value
            )
          }
          maxLength={MAX_CONTENT_LENGTH}
          rows={7}
          placeholder={
            "Write your preparation tasks, questions, important links, things to bring, or personal reminders..."
          }
          className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-900/30"
        />

        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
          <LinkIcon size={12} />
          You can include important links directly in your
          note.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <X size={16} />
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            isSaving ||
            !content.trim()
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <Check size={16} />

          {isSaving
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Save Note"}
        </button>
      </div>
    </form>
  );
};

export default EventNoteEditor;