const CharacterCounter = ({ current, max }) => {
  const getCounterColor = () => {
    if (current > max) {
      return "text-red-500";
    }

    if (current > max * 0.8) {
      return "text-yellow-500";
    }

    return "text-green-500";
  };

  return (
    <span className={`text-xs font-medium ${getCounterColor()}`}>
      {current} / {max} characters
    </span>
  );
};

export default CharacterCounter;
