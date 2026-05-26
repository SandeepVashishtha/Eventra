const sanitizeCSVField = (field) => {
  const value = String(field ?? "");
  const safeValue = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;

  return `"${safeValue.replace(/"/g, '""')}"`;
};

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

  const sanitizeCsvCell = (value) => {
    const str = String(value ?? "");
    if (/^[=+\-@\t\r]/.test(str)) {
      return "'" + str;
    }
    return str;
  };

  const rows = attendees.map((attendee) => [
    sanitizeCsvCell(attendee.name || ""),
    sanitizeCsvCell(attendee.email || ""),
    sanitizeCsvCell(attendee.registrationDate || ""),
    sanitizeCsvCell(attendee.ticketType || "General"),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map(sanitizeCSVField).join(",")
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
