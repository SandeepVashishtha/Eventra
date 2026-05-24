export const exportAttendeesToCSV = (
  attendees,
  filename = "event-attendees.csv"
) => {
  if (!attendees || attendees.length === 0) {
    return;
  }

  const headers = [
    "Name",
    "Email",
    "Registration Date",
    "Ticket Type",
  ];

  const rows = attendees.map((attendee) => [
    attendee.name || "",
    attendee.email || "",
    attendee.registrationDate || "",
    attendee.ticketType || "General",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((field) => `"${field}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.setAttribute(
    "download",
    filename
  );

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
};