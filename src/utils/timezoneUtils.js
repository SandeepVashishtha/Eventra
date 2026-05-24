export const formatEventDateTime = (
  dateString
) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZoneName: "short",
    }
  ).format(date);
};

export const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions()
    .timeZone;
};