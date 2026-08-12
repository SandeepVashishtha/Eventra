export const formatLocalDateTime = (dateValue) => {
  if (!dateValue) {
    return {
      date: "Date TBD",
      time: "",
      timezone: "",
    };
  }

  const date = new Date(dateValue);

  const timezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    date: new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeZone: timezone,
    }).format(date),

    time: new Intl.DateTimeFormat(undefined, {
      timeStyle: "short",
      timeZone: timezone,
    }).format(date),

    timezone,
  };
};