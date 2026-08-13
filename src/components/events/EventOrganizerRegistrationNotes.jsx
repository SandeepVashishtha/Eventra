import {
  Bell,
  CheckCircle2,
  FileText,
  MessageSquare,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useState } from "react";

const DEFAULT_NOTES = [
  {
    id: 1,
    type: "Follow-up",
    text: "Participant needs to confirm their team details.",
    status: "Pending",
    author: "Organizer",
    date: "August 14, 2026",
  },
  {
    id: 2,
    type: "Verification",
    text: "Eligibility documents verified successfully.",
    status: "Completed",
    author: "Organizer",
    date: "August 13, 2026",
  },
];

const NOTE_TYPES = [
  "Follow-up",
  "Verification",
  "Administrative",
  "Reminder",
];

const EventOrganizerRegistrationNotes = ({
  notes: initialNotes = DEFAULT_NOTES,
  registrationId = "REG-10482",
  participantName = "Participant",
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("Follow-up");
  const [reviewStatus, setReviewStatus] = useState("Pending");

  const addNote = () => {
    if (!noteText.trim()) return;

    const newNote = {
      id: Date.now(),
      type: noteType,
      text: noteText.trim(),
      status:
        noteType === "Reminder" ? "Pending" : "Completed",
      author: "Organizer",
      date: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };

    setNotes((current) => [newNote, ...current]);
    setNoteText("");
  };

  const deleteNote = (id) => {
    setNotes((current) =>
      current.filter((note) => note.id !== id)
    );
  };

  const toggleNoteStatus = (id) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === id
          ? {
              ...note,
              status:
                note.status === "Completed"
                  ? "Pending"
                  : "Completed",
            }
          : note
      )
    );
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <FileText size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Only
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration Notes
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Add private administrative notes and follow-up
              information to this registration.
            </p>
          </div>
        </div>

        <PrivacyBadge />
      </div>

      {/* Registration Info */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <InfoCard
          label="Registration ID"
          value={registrationId}
        />

        <InfoCard
          label="Participant"
          value={participantName}
        />
      </div>

      {/* Review Status */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <ShieldCheck
            size={16}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Registration Review Status
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Track the internal review state of this registration.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["Pending", "In Review", "Verified"].map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => setReviewStatus(status)}
                className={`rounded-xl px-3 py-2 text-[6px] font-bold transition ${
                  reviewStatus === status
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Add Note */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Plus size={15} />
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Add Internal Note
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              This note is visible only to authorized organizers.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <select
            value={noteType}
            onChange={(event) =>
              setNoteType(event.target.value)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[7px] outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {NOTE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <textarea
            value={noteText}
            onChange={(event) =>
              setNoteText(event.target.value)
            }
            rows={4}
            placeholder="Write an internal note..."
            className="resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-[7px] outline-none transition placeholder:text-slate-400 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={addNote}
              disabled={!noteText.trim()}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-[7px] font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add Note
            </button>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare
              size={16}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <div>
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                Internal Notes
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                {notes.length} note
                {notes.length === 1 ? "" : "s"} recorded.
              </p>
            </div>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[6px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Private
          </span>
        </div>

        {notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={() => deleteNote(note.id)}
                onToggleStatus={() =>
                  toggleNoteStatus(note.id)
                }
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <MessageSquare
              size={22}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <p className="mt-3 text-[8px] font-bold text-slate-500 dark:text-slate-400">
              No internal notes yet
            </p>

            <p className="mt-1 text-[6px] text-slate-400">
              Add a note to keep registration context organized.
            </p>
          </div>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <ShieldCheck
          size={15}
          className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
        />

        <div>
          <h3 className="text-[8px] font-bold text-indigo-800 dark:text-indigo-300">
            Private Organizer Information
          </h3>

          <p className="mt-1 text-[7px] leading-relaxed text-indigo-700 dark:text-indigo-400">
            Registration notes should be protected by organizer
            authorization and must not be displayed to participants.
          </p>
        </div>
      </div>
    </section>
  );
};

const NoteCard = ({
  note,
  onDelete,
  onToggleStatus,
}) => {
  const isCompleted = note.status === "Completed";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              isCompleted
                ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 size={15} />
            ) : (
              <Bell size={15} />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[5px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                {note.type}
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-[5px] font-bold ${
                  isCompleted
                    ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                }`}
              >
                {note.status}
              </span>
            </div>

            <p className="mt-3 text-[8px] leading-relaxed text-slate-700 dark:text-slate-300">
              {note.text}
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-[6px] text-slate-400">
              <span>Added by {note.author}</span>
              <span>•</span>
              <span>{note.date}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onToggleStatus}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-[6px] font-bold text-slate-600 transition hover:bg-green-50 hover:text-green-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-green-900/20 dark:hover:text-green-400"
          >
            {isCompleted ? "Mark Pending" : "Complete"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg bg-slate-100 p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            aria-label="Delete note"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </article>
  );
};

const InfoCard = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-2 text-[9px] font-black text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

const PrivacyBadge = () => (
  <span className="flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
    <ShieldCheck size={11} />
    Private
  </span>
);

export default EventOrganizerRegistrationNotes;