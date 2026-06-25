export function generateEventStructuredData(event) {
  if (!event) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title || "Event",
    startDate: event.startDate || new Date().toISOString(),
    endDate: event.endDate || event.startDate,
    description: event.description || "",
    location: {
      "@type": "Place",
      name: event.locationName || "Virtual Venue",
      address: event.address || "Online",
    },
  };
}
