export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Storage save failed:", error);
  }
};

export const loadFromStorage = (key, fallbackValue) => {
  try {
    const stored = localStorage.getItem(key);

    if (!stored) return fallbackValue;

    return JSON.parse(stored);
  } catch (error) {
    console.error("Storage load failed:", error);
    return fallbackValue;
  }
};