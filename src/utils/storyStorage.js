import { safeJsonParse } from "./safeJsonParse.js";

const STORIES_KEY = "eventra_stories";
export const STORY_TTL_MS = 24 * 60 * 60 * 1000;

const readStories = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORIES_KEY);
    const parsed = safeJsonParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStories = (stories) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
  } catch {
    // Storage may be unavailable
  }
};

export const saveStory = (story) => {
  if (!story?.id) return [];
  const stories = readStories();
  const entry = {
    ...story,
    createdAt: story.createdAt || new Date().toISOString(),
  };
  const updated = [entry, ...stories.filter((s) => s.id !== story.id)];
  writeStories(updated);
  return updated;
};

export const getStories = () => {
  const stories = readStories();
  const now = Date.now();
  return stories.filter((s) => {
    const age = now - new Date(s.createdAt).getTime();
    return age < STORY_TTL_MS;
  });
};

export const getStoryById = (id) => {
  return getStories().find((s) => s.id === id) || null;
};

export const removeStory = (id) => {
  const stories = readStories().filter((s) => s.id !== id);
  writeStories(stories);
  return stories;
};

export const clearStories = () => {
  writeStories([]);
  return [];
};


