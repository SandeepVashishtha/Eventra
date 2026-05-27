const CharacterCounter = ({
  current,
  max,
}) => (
  <span
    className={`text-xs font-medium ${
      current > max * 0.8
        ? "text-red-500"
        : "text-gray-500"
    }`}
  >
    {current} / {max} characters
  </span>
);
export default CharacterCounter;