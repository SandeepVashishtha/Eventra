import { safeJsonParse } from "./safeJsonParse.js";

const normalizeEventId = (eventId) => String(eventId);

const buildStorageKey = (eventId, userId) => {
  const normalizedUser = userId ? String(userId) : "guest";
  return `eventra_session_notes_${normalizedUser}_${normalizeEventId(eventId)}`;
};

const readSessionNotes = (eventId, userId) => {
  if (typeof window === "undefined") return [];

  try {
    const rawNotes = window.localStorage.getItem(buildStorageKey(eventId, userId));
    const parsed = safeJsonParse(rawNotes, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("[sessionNotesUtils] Read operation failed:", err);
    return [];
  }
};

const writeSessionNotes = (eventId, userId, notes) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(buildStorageKey(eventId, userId), JSON.stringify(notes));
  } catch (err) {
    console.warn("[sessionNotesUtils] Write operation failed:", err);
  }
};

export const getSessionNotes = (eventId, userId) => readSessionNotes(eventId, userId);

export const saveSessionNote = (eventId, userId, note) => {
  if (!note?.id) return readSessionNotes(eventId, userId);

  const notes = readSessionNotes(eventId, userId);
  const existingIndex = notes.findIndex((item) => item.id === note.id);

  let nextNotes;
  if (existingIndex >= 0) {
    nextNotes = notes.map((item) => (item.id === note.id ? note : item));
  } else {
    nextNotes = [note, ...notes];
  }

  writeSessionNotes(eventId, userId, nextNotes);
  return nextNotes;
};

export const deleteSessionNote = (eventId, userId, noteId) => {
  const nextNotes = readSessionNotes(eventId, userId).filter((item) => item.id !== noteId);
  writeSessionNotes(eventId, userId, nextNotes);
  return nextNotes;
};
