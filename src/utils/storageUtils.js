export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save "${key}" to storage:`, error);
  }
};

export const loadFromStorage = (key, fallbackValue) => {
  try {
    const storedValue = localStorage.getItem(key);

    if (storedValue === null || storedValue === undefined) {
      return fallbackValue;
    }

    return JSON.parse(storedValue);
  } catch (error) {
    console.error(`Failed to load "${key}" from storage:`, error);
    return fallbackValue;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove "${key}" from storage:`, error);
  }
};