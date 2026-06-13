import { createEvent } from "ics";

export const downloadICS = (event) => {
  const startDate = new Date(event.date);

  const eventConfig = {
    title: event.title,
    description: event.description || "",
    location: event.location || "",
    start: [
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      startDate.getDate(),
      10,
      0,
    ],
    duration: { hours: 2 },
  };

  createEvent(eventConfig, (error, value) => {
    if (error) {
      console.error(error);
      return;
    }

    const blob = new Blob([value], {
      type: "text/calendar;charset=utf-8",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title}.ics`;
    link.click();

    window.URL.revokeObjectURL(url);
  });
};

export const getGoogleCalendarUrl = (event) => {
  const start = new Date(event.date);

  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const formatDate = (date) =>
    date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.title
  )}&dates=${formatDate(start)}/${formatDate(
    end
  )}&details=${encodeURIComponent(
    event.description || ""
  )}&location=${encodeURIComponent(event.location || "")}`;
};