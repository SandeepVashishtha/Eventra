import { safeParseJson } from "../utils/jsonUtils";

const STORAGE_TYPES = {
  LOCAL: "localStorage",
  SESSION: "sessionStorage",
};

function getStorage(type) {
  try {
    return type === STORAGE_TYPES.SESSION ? sessionStorage : localStorage;
  } catch {
    return null;
  }
}

export const storage = {
  get(key, fallback = null, type = STORAGE_TYPES.LOCAL) {
    try {
      const store = getStorage(type);
      if (!store) return fallback;
      const raw = store.getItem(key);
      return raw !== null ? safeParseJson(raw, raw) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value, type = STORAGE_TYPES.LOCAL) {
    try {
      const store = getStorage(type);
      if (!store) return;
      const raw = typeof value === "string" ? value : JSON.stringify(value);
      store.setItem(key, raw);
    } catch {}
  },

  remove(key, type = STORAGE_TYPES.LOCAL) {
    try {
      const store = getStorage(type);
      if (!store) return;
      store.removeItem(key);
    } catch {}
  },

  clear(type = STORAGE_TYPES.LOCAL) {
    try {
      const store = getStorage(type);
      if (!store) return;
      store.clear();
    } catch {}
  },

  keys(type = STORAGE_TYPES.LOCAL) {
    try {
      const store = getStorage(type);
      if (!store) return [];
      return Object.keys(store);
    } catch {
      return [];
    }
  },

  getItem(key, fallback = null) {
    return this.get(key, fallback, STORAGE_TYPES.LOCAL);
  },

  setItem(key, value) {
    return this.set(key, value, STORAGE_TYPES.LOCAL);
  },

  removeItem(key) {
    return this.remove(key, STORAGE_TYPES.LOCAL);
  },
};

export const sessionStorage = {
  get(key, fallback = null) {
    return storage.get(key, fallback, STORAGE_TYPES.SESSION);
  },
  set(key, value) {
    return storage.set(key, value, STORAGE_TYPES.SESSION);
  },
  remove(key) {
    return storage.remove(key, STORAGE_TYPES.SESSION);
  },
  clear() {
    return storage.clear(STORAGE_TYPES.SESSION);
  },
};

export default storage;
