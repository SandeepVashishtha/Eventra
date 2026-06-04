import "./styles/SkipToContent.css";

/**
 * SkipToContent - Accessibility skip navigation link.
 * Appears on Tab focus, allowing keyboard users to bypass navigation.
 *
 * Usage: Place at the very top of your App component.
 * Ensure the main content area has id="main-content".
 *
 * @param {Object} props
 * @param {string} [props.targetId] - ID of the main content element (default: "main-content")
 */
export default function SkipToContent({ targetId = "main-content" }) {
  const handleClick = () => {
    // 🔥 FIX: Removed e.preventDefault()
    // We MUST allow the browser to natively update the URL hash so history tracking
    // and CSS :target selectors function correctly.

    // 🔥 FIX: Defer execution to the next macro-task.
    // This allows the browser's native anchor jump to process BEFORE we programmatically force focus.
    setTimeout(() => {
      const target = document.getElementById(targetId);
      if (target) {
        // Enforce focusability on non-interactive elements (like <main>)
        target.setAttribute("tabindex", "-1");
        target.focus();

        // 🔥 FIX: Eliminated the synchronous race condition.
        // We only remove the tabindex AFTER the element natively loses focus.
        // Removing it synchronously prevents the A11y tree from registering the shift.
        target.addEventListener("blur", function cleanup() {
          target.removeAttribute("tabindex");
        }, { once: true }); // Automatically cleans up the listener
      }
    }, 0);
  };

  return (
    <a
      href={`#${targetId}`}
      className="skip-to-content"
      onClick={handleClick}
    >
      Skip to main content
    </a>
  );
}