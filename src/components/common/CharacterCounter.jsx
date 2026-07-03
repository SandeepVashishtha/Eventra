

const CharacterCounter = ({
  id,
  current,
  max,
  value,
  maxLength,
  warningThreshold = 0.9,
}) => {
  // Support both old API (current/max) and new API (value/maxLength)
  const textValue = value !== undefined ? (value || "") : "";
  const currentLength = value !== undefined ? textValue.length : (current || 0);
  const maxLimit = maxLength !== undefined ? maxLength : (max || 0);
  const ratio = maxLimit > 0 ? currentLength / maxLimit : 0;

  const getCounterColor = () => {
    if (currentLength >= maxLimit) {
      return "text-red-500 font-semibold";
    }
    if (ratio >= warningThreshold) {
      return "text-amber-500 font-medium"; // Amber/yellow warning state
    }
    return "text-gray-500 dark:text-gray-400"; // Neutral default state
  };

  const getAriaStatus = () => {
    if (currentLength >= maxLimit) return "Character limit reached";
    if (ratio >= warningThreshold) return "Approaching character limit";
    return "";
  };

  return (
    <div
      id={id}
      className={`text-xs ${getCounterColor()} select-none`}
      aria-live="polite"
    >
      <span>
        {currentLength} / {maxLimit} characters
      </span>
      {getAriaStatus() && <span className="sr-only"> - {getAriaStatus()}</span>}
    </div>
  );
};

export default CharacterCounter;