const MODIFIER_KEYS = new Set([
  "alt",
  "altgraph",
  "control",
  "ctrl",
  "meta",
  "os",
  "shift",
]);

const PRIMARY_RESERVED_KEYS = new Set([
  "f",
  "l",
  "n",
  "o",
  "p",
  "r",
  "s",
  "t",
  "w",
]);

const RESERVED_SIGNATURES = new Set([
  "f5",
  "primary+shift+r",
  "primary+shift+t",
  "primary+shift+w",
  "alt+arrowleft",
  "alt+arrowright",
  "primary+tab",
  "primary+shift+tab",
]);

const normalizeKey = (key) => {
  const value = String(key || "").toLowerCase();

  if (value === "?") return "/";
  if (value === " ") return "space";
  if (value === "esc") return "escape";
  if (value === "cmd" || value === "command") return "meta";
  if (value === "control") return "ctrl";

  return value;
};

const normalizeShortcutPart = (part) => {
  const tokens = String(part)
    .toLowerCase()
    .split("+")
    .map((token) => normalizeKey(token.trim()))
    .filter(Boolean);

  const key = tokens.find((token) => !["primary", "ctrl", "meta", "alt", "shift"].includes(token));
  const modifiers = [];

  if (tokens.includes("primary") || tokens.includes("mod")) modifiers.push("primary");
  if (tokens.includes("ctrl") && !modifiers.includes("primary")) modifiers.push("ctrl");
  if (tokens.includes("meta") && !modifiers.includes("primary")) modifiers.push("meta");
  if (tokens.includes("alt")) modifiers.push("alt");
  if (tokens.includes("shift")) modifiers.push("shift");

  return [...modifiers, key].filter(Boolean).join("+");
};

export const normalizeShortcut = (shortcut) =>
  String(shortcut || "")
    .trim()
    .replace(/\s*\+\s*/g, "+")
    .split(/\s+/)
    .map(normalizeShortcutPart)
    .filter(Boolean)
    .join(" ");

export const isEditableTarget = (target) => {
  if (!target) return false;

  const tagName = target.tagName?.toUpperCase();
  if (["INPUT", "TEXTAREA", "SELECT"].includes(tagName)) return true;
  if (target.isContentEditable) return true;
  if (typeof target.closest === "function" && target.closest("[contenteditable='true']")) {
    return true;
  }

  return false;
};

export const getEventShortcut = (event) => {
  const key = normalizeKey(event?.key);
  if (!key || MODIFIER_KEYS.has(key)) return "";

  const modifiers = [];
  if (event.ctrlKey || event.metaKey) modifiers.push("primary");
  if (event.altKey) modifiers.push("alt");
  if (event.shiftKey) modifiers.push("shift");

  return [...modifiers, key].join("+");
};

export const isReservedShortcut = (shortcut) => {
  const normalized = normalizeShortcut(shortcut);
  if (!normalized || normalized.includes(" ")) return false;

  if (RESERVED_SIGNATURES.has(normalized)) return true;

  const tokens = normalized.split("+");
  const key = tokens[tokens.length - 1];

  return tokens.includes("primary") && PRIMARY_RESERVED_KEYS.has(key);
};

export const createShortcutManager = ({
  target,
  sequenceTimeout = 1000,
  onConflict = console.warn,
  onReserved = console.warn,
} = {}) => {
  const registrations = new Map();
  let listening = false;
  let keyBuffer = [];
  let clearTimer = null;

  const getTarget = () =>
    target || (typeof document !== "undefined" ? document : undefined);

  const clearBuffer = () => {
    keyBuffer = [];
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }
  };

  const scheduleClear = () => {
    if (clearTimer) clearTimeout(clearTimer);
    clearTimer = setTimeout(clearBuffer, sequenceTimeout);
  };

  const dispatch = (event) => {
    const eventShortcut = getEventShortcut(event);
    if (!eventShortcut || isReservedShortcut(eventShortcut)) return;

    const targetIsEditable =
      isEditableTarget(event.target) ||
      (typeof document !== "undefined" && isEditableTarget(document.activeElement));

    const isModifiedShortcut = eventShortcut.includes("+");
    const key = normalizeKey(event.key);

    if (!isModifiedShortcut) {
      keyBuffer.push(key);
      if (keyBuffer.length > 3) keyBuffer.shift();
      scheduleClear();
    } else {
      clearBuffer();
    }

    const candidates = isModifiedShortcut
      ? [eventShortcut]
      : [eventShortcut, keyBuffer.slice(-2).join(" "), keyBuffer.slice(-3).join(" ")];

    for (const signature of candidates) {
      const registration = registrations.get(signature);
      if (!registration) continue;
      if (targetIsEditable && !registration.allowInEditable) continue;

      event.preventDefault?.();
      registration.handler(event);
      clearBuffer();
      return;
    }
  };

  const ensureListening = () => {
    const listenerTarget = getTarget();
    if (!listening && listenerTarget?.addEventListener) {
      listenerTarget.addEventListener("keydown", dispatch);
      listening = true;
    }
  };

  const stopListeningIfIdle = () => {
    const listenerTarget = getTarget();
    if (listening && registrations.size === 0 && listenerTarget?.removeEventListener) {
      listenerTarget.removeEventListener("keydown", dispatch);
      listening = false;
      clearBuffer();
    }
  };

  const register = ({
    id,
    shortcut,
    handler,
    allowInEditable = false,
    allowReserved = false,
  }) => {
    const signature = normalizeShortcut(shortcut);

    if (!id || !signature || typeof handler !== "function") {
      throw new Error("Shortcut registration requires id, shortcut, and handler.");
    }

    if (!allowReserved && isReservedShortcut(signature)) {
      onReserved?.(`Shortcut "${shortcut}" for "${id}" is browser-reserved and was not registered.`);
      return () => {};
    }

    const existing = registrations.get(signature);
    if (existing) {
      onConflict?.(
        `Shortcut "${signature}" for "${id}" conflicts with existing shortcut "${existing.id}".`
      );
      return () => {};
    }

    registrations.set(signature, {
      id,
      handler,
      allowInEditable,
    });
    ensureListening();

    return () => {
      const current = registrations.get(signature);
      if (current?.id === id) {
        registrations.delete(signature);
      }
      stopListeningIfIdle();
    };
  };

  return {
    register,
    handleKeyDown: dispatch,
    clearBuffer,
    getRegisteredShortcuts: () => Array.from(registrations.keys()),
  };
};

export const globalShortcutManager = createShortcutManager();
