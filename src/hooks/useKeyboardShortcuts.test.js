import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import useKeyboardShortcuts from "./useKeyboardShortcuts";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Fires a keydown event on document with the given key and optional modifiers. */
const fireKey = (key, { shiftKey = false, ctrlKey = false, altKey = false, metaKey = false } = {}) => {
  const event = new KeyboardEvent("keydown", {
    key,
    shiftKey,
    ctrlKey,
    altKey,
    metaKey,
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
  return event;
};

/** Wraps hooks that need react-router context. */
const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

// ─── Mocks ───────────────────────────────────────────────────────────────────

// react-router-dom's navigate is mocked so we can assert route changes
// without a real browser history.
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("useKeyboardShortcuts", () => {
  const onOpenHelp = jest.fn();
  const onCloseHelp = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ─── Modal shortcuts ───────────────────────────────────────────────────────

  it("opens the help modal when Shift+? is pressed", () => {
    renderHook(
      () => useKeyboardShortcuts({ onOpenHelp, onCloseHelp, isOpen: false }),
      { wrapper }
    );

    fireKey("?", { shiftKey: true });
    expect(onOpenHelp).toHaveBeenCalledTimes(1);
  });

  it("opens the help modal when Shift+/ is pressed (same logical key)", () => {
    renderHook(
      () => useKeyboardShortcuts({ onOpenHelp, onCloseHelp, isOpen: false }),
      { wrapper }
    );

    fireKey("/", { shiftKey: true });
    expect(onOpenHelp).toHaveBeenCalledTimes(1);
  });

  it("closes the help modal when Escape is pressed", () => {
    renderHook(
      () => useKeyboardShortcuts({ onOpenHelp, onCloseHelp, isOpen: true }),
      { wrapper }
    );

    fireKey("Escape");
    expect(onCloseHelp).toHaveBeenCalledTimes(1);
  });

  // ─── Navigation shortcuts ──────────────────────────────────────────────────

  const navCases = [
    ["g", "h", "/"],
    ["g", "l", "/login"],
    ["g", "s", "/signup"],
    ["g", "e", "/events"],
    ["g", "c", "/calendar"],
    ["g", "b", "/bookmarks"],
    ["g", "r", "/reminders"],
    ["g", "k", "/hackathons"],
    ["g", "p", "/projects"],
    ["g", "a", "/leaderBoard"],
    ["g", "f", "/faq"],
    ["g", "d", "/dashboard"],
  ];

  test.each(navCases)(
    "navigates to %s when '%s%s' sequence is pressed",
    (first, second, expectedRoute) => {
      renderHook(
        () => useKeyboardShortcuts({ onOpenHelp, onCloseHelp, isOpen: false }),
        { wrapper }
      );

      fireKey(first);
      fireKey(second);

      expect(mockNavigate).toHaveBeenCalledWith(expectedRoute);
    }
  );

  it("does NOT navigate when the help modal is open", () => {
    renderHook(
      () => useKeyboardShortcuts({ onOpenHelp, onCloseHelp, isOpen: true }),
      { wrapper }
    );

    fireKey("g");
    fireKey("h");

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("ignores modifier-key combos for navigation (Ctrl, Alt, Meta)", () => {
    renderHook(
      () => useKeyboardShortcuts({ onOpenHelp, onCloseHelp, isOpen: false }),
      { wrapper }
    );

    fireKey("g");
    fireKey("h", { ctrlKey: true });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("clears the key buffer after 1 second of inactivity", () => {
    renderHook(
      () => useKeyboardShortcuts({ onOpenHelp, onCloseHelp, isOpen: false }),
      { wrapper }
    );

    fireKey("g");
    jest.advanceTimersByTime(1001); // buffer should have been cleared
    fireKey("h");

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("does not fire navigation when keys are typed inside an input field", () => {
    renderHook(
      () => useKeyboardShortcuts({ onOpenHelp, onCloseHelp, isOpen: false }),
      { wrapper }
    );

    // Simulate focus inside an <input>
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    fireKey("g");
    fireKey("h");

    expect(mockNavigate).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it("does not fire navigation when keys are typed inside a textarea", () => {
    renderHook(
      () => useKeyboardShortcuts({ onOpenHelp, onCloseHelp, isOpen: false }),
      { wrapper }
    );

    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.focus();

    fireKey("g");
    fireKey("h");

    expect(mockNavigate).not.toHaveBeenCalled();
    document.body.removeChild(textarea);
  });

  // ─── Cleanup ───────────────────────────────────────────────────────────────

  it("removes keydown listener from document on unmount", () => {
    const removeSpy = jest.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(
      () => useKeyboardShortcuts({ onOpenHelp, onCloseHelp, isOpen: false }),
      { wrapper }
    );

    unmount();

    const keydownRemovals = removeSpy.mock.calls.filter(
      (call) => call[0] === "keydown"
    );
    expect(keydownRemovals.length).toBeGreaterThanOrEqual(1);
    removeSpy.mockRestore();
  });

  it("clears any pending key-buffer timeout on unmount to prevent memory leaks", () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

    const { unmount } = renderHook(
      () => useKeyboardShortcuts({ onOpenHelp, onCloseHelp, isOpen: false }),
      { wrapper }
    );

    // Trigger a pending timeout
    fireKey("g");

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
