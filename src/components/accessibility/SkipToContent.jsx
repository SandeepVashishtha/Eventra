import "./SkipToContent.css";

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
    // Defer execution to the next macro-task.
    // This allows the browser's native anchor jump to process BEFORE we programmatically force focus.
    setTimeout(() => {
      const target = document.getElementById(targetId);
      if (target) {
        // Enforce focusability on non-interactive elements (like <main>)
        target.setAttribute("tabindex", "-1");
        target.focus();

        // We only remove the tabindex AFTER the element natively loses focus.
        // Removing it synchronously prevents the A11y tree from registering the shift.
        const cleanup = () => {
          target.removeAttribute("tabindex");
          target.removeEventListener("blur", cleanup);
        };
        target.addEventListener("blur", cleanup);
      }
    }, 0);
  };

  return (
    <a href={`#${targetId}`} className="skip-to-content" onClick={handleClick}>
      Skip to main content
    </a>
  );
}
