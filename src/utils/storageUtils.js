import { storageManager } from "./storage/storageManager";

export const saveToStorage = (key, value) => {
  storageManager.set(key, value);
};

export const loadFromStorage = (key, fallbackValue) => {
  const stored = storageManager.get(key);
  if (stored === null || stored === undefined) {
    return fallbackValue;
  }
  return stored;
};