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
  const handleClick = (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.removeAttribute("tabindex");
    }
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
