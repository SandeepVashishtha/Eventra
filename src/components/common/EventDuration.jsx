const EventDuration = ({ duration }) => {
  if (!duration) return null;

  return (
    <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
      Duration: {duration}
    </span>
  );
};

export default EventDuration;