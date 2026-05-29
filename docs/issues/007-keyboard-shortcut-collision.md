# Issue #007: Keyboard shortcut collision between CommandPalette and KeyboardShortcutsModal

**Tags:** `bug`, `a11y`, `advanced`  
**Category:** Quality Exceptional  
**Files:**
- `src/components/common/CommandPalette.jsx`
- `src/components/common/KeyboardShortcutsModal.jsx`

---

## Description

Both `CommandPalette` and `KeyboardShortcutsModal` independently register global `window` keydown event listeners without any coordination mechanism. When both components are open simultaneously, keyboard events fire both handlers, causing:

1. **Escape key double-close**: Pressing Escape closes both modals even if only one was intended
2. **Arrow key interference**: ArrowDown/ArrowUp in CommandPalette also triggers the KeyboardShortcutsModal's pressed-keys tracking
3. **No modal stacking**: There's no concept of a "topmost" modal — both receive all events
4. **Focus trap competition**: If focus traps were added in the future, they'd conflict

### Root Cause

**CommandPalette** (`src/components/common/CommandPalette.jsx:155-178`):
```javascript
useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[activeIndex]) {
        handleSelect(filteredItems[activeIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [isOpen, filteredItems, activeIndex, handleSelect, onClose]);
```

**KeyboardShortcutsModal** (`src/components/common/KeyboardShortcutsModal.jsx:100-148`):
```javascript
useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    const key = e.key.toLowerCase();
    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      if (e.shiftKey) next.add("shift");
      // ... modifiers
      return next;
    });
  };

  // Also handleKeyUp, handleBlur

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", handleBlur);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("blur", handleBlur);
  };
}, [isOpen]);
```

### Reproduction

1. Open CommandPalette (Ctrl+K or `/`)
2. Open KeyboardShortcutsModal (Shift+?) — note: these may be the same shortcut context
3. Press Escape → both close instead of just the topmost one
4. Press ArrowDown → CommandPalette changes selection AND KeyboardShortcutsModal tracks the key press

## Proposed Fix

### Option A: Coordinated Modal Stack (Recommended)

Create a shared modal registry that tracks open modals by z-index priority. Each modal registers itself on open and unregisters on close. Only the topmost modal receives keyboard events.

Create a new file `src/hooks/useModalStack.js`:

```javascript
import { useEffect, useRef } from 'react';

// Simple modal stack — no external dependencies
const modalStack = [];

export const useModalStack = (isOpen, id = Math.random().toString(36)) => {
  const idRef = useRef(id);

  useEffect(() => {
    if (isOpen) {
      if (!modalStack.includes(idRef.current)) {
        modalStack.push(idRef.current);
      }
    }
    return () => {
      const idx = modalStack.indexOf(idRef.current);
      if (idx !== -1) modalStack.splice(idx, 1);
    };
  }, [isOpen]);

  const isTopmost = () => {
    return modalStack.length > 0 && modalStack[modalStack.length - 1] === idRef.current;
  };

  return { isTopmost };
};
```

Then in both `CommandPalette` and `KeyboardShortcutsModal`:

```javascript
const { isTopmost } = useModalStack(isOpen);

// In the keyboard effect:
useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (e) => {
    if (!isTopmost()) return; // ← Skip if not the topmost modal
    // ... existing handler
  };
  // ...
}, [isOpen, isTopmost, /* ... */]);
```

### Option B: Stop Propagation (Simpler but Fragile)

Instead of `window.addEventListener`, use event delegation on the modal container with `stopPropagation`. However, this doesn't work for events that target elements outside the modal.

### Option C: Focus-Within Check (Simpler, Partial Fix)

Each modal can check `document.activeElement` is within its own container:

```javascript
const containerRef = useRef(null);

const handleKeyDown = (e) => {
  if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
    return; // Not our turn
  }
  // ... handle keys
};
```

## Acceptance Criteria

- [ ] When both CommandPalette and KeyboardShortcutsModal are open, Escape only closes the topmost modal
- [ ] Arrow keys in CommandPalette don't interfere with KeyboardShortcutsModal
- [ ] When only one modal is open, all keyboard shortcuts work as before
- [ ] When the topmost modal closes, the next modal in the stack regains keyboard control
- [ ] No breaking changes to existing keyboard shortcut behavior
- [ ] No third-party dependencies added
