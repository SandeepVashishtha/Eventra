export const saveToStorage = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Storage save failed:", error);
  }
};

export const loadFromStorage = (key, fallbackValue) => {
  if (typeof window === "undefined") return fallbackValue;
  try {
    const stored = localStorage.getItem(key);

    if (!stored) return fallbackValue;

    return JSON.parse(stored);
  } catch (error) {
    console.error("Storage load failed:", error);
    return fallbackValue;
  }
};