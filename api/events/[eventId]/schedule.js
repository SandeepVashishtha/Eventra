const isValidDate = (value) => {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime());
};

export default async function handler(req, res) {
  if (req.method !== "PATCH" && req.method !== "PUT") {
    res.setHeader("Allow", "PATCH, PUT");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { eventId } = req.query || {};
  const { startDate, endDate, overrideConflicts = false } = req.body || {};

  if (!eventId) {
    return res.status(400).json({ message: "Event ID is required." });
  }

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return res.status(400).json({ message: "Valid startDate and endDate are required." });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    return res.status(400).json({ message: "Start date must be before end date." });
  }

  return res.status(200).json({
    eventId,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    overrideConflicts,
    updatedAt: new Date().toISOString(),
  });
}
