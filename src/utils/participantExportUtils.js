/**
 * Convert participant data into a consistent format.
 */
export const formatParticipantData = (participants = []) => {
  return participants.map((participant) => ({
    Name: participant.name || participant.fullName || "",
    Email: participant.email || "",
    "Registration Date":
      participant.registrationDate ||
      participant.registeredAt ||
      "",
    "Registration Status":
      participant.registrationStatus ||
      participant.status ||
      "",
    Team:
      participant.team ||
      participant.teamName ||
      "Not Assigned",
  }));
};

/**
 * Escape CSV values safely.
 */
const escapeCSVValue = (value) => {
  const stringValue = String(value ?? "");

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

/**
 * Export participants as CSV.
 */
export const exportParticipantsToCSV = (
  participants = []
) => {
  if (!participants.length) return;

  const data = formatParticipantData(participants);
  const headers = Object.keys(data[0]);

  const rows = data.map((participant) =>
    headers
      .map((header) =>
        escapeCSVValue(participant[header])
      )
      .join(",")
  );

  const csv = [
    headers.join(","),
    ...rows,
  ].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  downloadFile(blob, "event-participants.csv");
};

/**
 * Export participants as Excel-compatible spreadsheet.
 *
 * This creates an .xls file using an HTML table,
 * so no additional Excel package is required.
 */
export const exportParticipantsToExcel = async (
  participants = []
) => {
  if (!participants.length) return;

  const data = formatParticipantData(participants);
  const headers = Object.keys(data[0]);

  const tableRows = data
    .map(
      (participant) => `
        <tr>
          ${headers
            .map(
              (header) =>
                `<td>${escapeHTML(
                  participant[header]
                )}</td>`
            )
            .join("")}
        </tr>
      `
    )
    .join("");

  const table = `
    <table border="1">
      <thead>
        <tr>
          ${headers
            .map(
              (header) => `<th>${escapeHTML(header)}</th>`
            )
            .join("")}
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

  const blob = new Blob(
    [
      `
      <html>
        <head>
          <meta charset="UTF-8" />
        </head>
        <body>
          ${table}
        </body>
      </html>
      `,
    ],
    {
      type: "application/vnd.ms-excel",
    }
  );

  downloadFile(blob, "event-participants.xls");
};

/**
 * Export participants as a printable PDF.
 *
 * Uses the browser print dialog so the user can
 * choose "Save as PDF" without requiring a PDF package.
 */
export const exportParticipantsToPDF = async (
  participants = []
) => {
  if (!participants.length) return;

  const data = formatParticipantData(participants);
  const headers = Object.keys(data[0]);

  const rows = data
    .map(
      (participant) => `
        <tr>
          ${headers
            .map(
              (header) =>
                `<td>${escapeHTML(
                  participant[header]
                )}</td>`
            )
            .join("")}
        </tr>
      `
    )
    .join("");

  const printWindow = window.open(
    "",
    "_blank",
    "width=1000,height=700"
  );

  if (!printWindow) {
    throw new Error(
      "Unable to open print window. Please allow pop-ups."
    );
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Event Participants</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #1e293b;
          }

          h1 {
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          th,
          td {
            border: 1px solid #cbd5e1;
            padding: 10px;
            text-align: left;
          }

          th {
            background: #f1f5f9;
            font-weight: 600;
          }

          tr:nth-child(even) {
            background: #f8fafc;
          }

          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>

      <body>
        <h1>Event Participants</h1>

        <p>
          Total Participants:
          <strong>${data.length}</strong>
        </p>

        <table>
          <thead>
            <tr>
              ${headers
                .map(
                  (header) =>
                    `<th>${escapeHTML(header)}</th>`
                )
                .join("")}
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
};

/**
 * Escape HTML values before inserting them into
 * generated Excel/print markup.
 */
const escapeHTML = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Download a generated Blob.
 */
export const downloadFile = (
  blob,
  fileName
) => {
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};