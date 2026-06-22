/**
 * EventStructuredData
 *
 * Injects a JSON-LD <script> block conforming to the Google/Schema.org
 * `Event` type into the document <head> for the duration the component
 * is mounted. Greatly improves SEO and enables Google's rich Event cards
 * in search results.
 *
 * Schema reference:
 *   https://schema.org/Event
 *   https://developers.google.com/search/docs/appearance/structured-data/event
 *
 * Props:
 *   event {Object} — The Eventra event object from EventDetails
 */

import { useEffect } from "react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Maps Eventra event status to Schema.org EventStatusType.
 */
function mapEventStatus(status) {
  switch (status) {
    case "live":
      return "https://schema.org/EventScheduled";
    case "cancelled":
      return "https://schema.org/EventCancelled";
    case "postponed":
      return "https://schema.org/EventPostponed";
    case "past":
    case "ended":
      return "https://schema.org/EventScheduled"; // past but was scheduled
    default:
      return "https://schema.org/EventScheduled";
  }
}

/**
 * Maps Eventra virtual/in-person flag to Schema.org EventAttendanceModeEnumeration.
 */
function mapAttendanceMode(event) {
  if (event.isVirtual) {
    return "https://schema.org/OnlineEventAttendanceMode";
  }
  if (event.isHybrid) {
    return "https://schema.org/MixedEventAttendanceMode";
  }
  return "https://schema.org/OfflineEventAttendanceMode";
}

/**
 * Builds the JSON-LD object for the event.
 * @param {Object} event
 * @param {string} url   - Current canonical URL
 * @returns {Object}
 */
function buildEventJsonLd(event, url) {
  const locationData = event.location || {};
  const isLocationObject = typeof locationData === "object";

  const location = event.isVirtual
    ? {
        "@type": "VirtualLocation",
        url: event.virtualLink || url,
      }
    : {
        "@type": "Place",
        name: isLocationObject ? locationData.name || "TBA" : String(locationData),
        address: isLocationObject
          ? {
              "@type": "PostalAddress",
              streetAddress: locationData.address || "",
              addressLocality: locationData.city || "",
              addressCountry: locationData.country || "",
            }
          : { "@type": "PostalAddress", name: String(locationData) },
      };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description
      ? event.description.replace(/[#*_`[\]()>~<>]/g, "").slice(0, 500)
      : "",
    startDate: event.startDate || event.date,
    endDate: event.endDate || event.date,
    eventStatus: mapEventStatus(event.status),
    eventAttendanceMode: mapAttendanceMode(event),
    location,
    url,
    image: event.image ? [event.image] : [],
    organizer: event.organizer
      ? {
          "@type": "Organization",
          name: event.organizer.name || "Eventra",
          url: event.organizer.website || "https://eventra.app",
        }
      : { "@type": "Organization", name: "Eventra" },
  };

  // Optional: offers (ticket tiers)
  if (Array.isArray(event.ticketTiers) && event.ticketTiers.length > 0) {
    jsonLd.offers = event.ticketTiers.map((tier) => ({
      "@type": "Offer",
      name: tier.name || "General Admission",
      price: tier.price ?? 0,
      priceCurrency: "USD",
      availability:
        event.status === "past"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      url,
    }));
  }

  // Optional: performer
  if (event.speakers?.length > 0) {
    jsonLd.performer = event.speakers.map((s) => ({
      "@type": "Person",
      name: s.name,
    }));
  }

  return jsonLd;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * @param {Object} props
 * @param {Object} props.event  - Eventra event object
 */
export default function EventStructuredData({ event }) {
  useEffect(() => {
    if (!event?.title) return;

    const url =
      typeof window !== "undefined" ? window.location.href : "";

    const jsonLd = buildEventJsonLd(event, url);
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = `event-jsonld-${event.id}`;
    script.textContent = JSON.stringify(jsonLd, null, 2);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById(`event-jsonld-${event.id}`);
      if (existing) existing.remove();
    };
  }, [event]);

  // Renders nothing — it only injects into <head>
  return null;
}

// Export helpers for testing
export { buildEventJsonLd, mapEventStatus, mapAttendanceMode };
