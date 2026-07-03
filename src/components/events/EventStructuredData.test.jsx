/**
 * EventStructuredData tests
 */
import { buildEventJsonLd, mapEventStatus, mapAttendanceMode } from "../EventStructuredData";

const BASE_EVENT = {
  id: 1,
  title: "React Summit 2026",
  description: "## The biggest **React** conference.\n\nJoin us!",
  date: "2026-09-01T10:00:00Z",
  startDate: "2026-09-01T10:00:00Z",
  endDate: "2026-09-02T18:00:00Z",
  status: "upcoming",
  image: "https://example.com/banner.jpg",
  isVirtual: false,
  location: { name: "RAI Amsterdam", address: "Europaplein 24", city: "Amsterdam", country: "NL" },
};

describe("buildEventJsonLd", () => {
  it("sets @type to Event", () => {
    const ld = buildEventJsonLd(BASE_EVENT, "https://eventra.app/events/1");
    expect(ld["@type"]).toBe("Event");
  });

  it("sets the correct event name", () => {
    const ld = buildEventJsonLd(BASE_EVENT, "");
    expect(ld.name).toBe("React Summit 2026");
  });

  it("strips Markdown from description", () => {
    const ld = buildEventJsonLd(BASE_EVENT, "");
    expect(ld.description).not.toContain("#");
    expect(ld.description).not.toContain("**");
  });

  it("maps offline event to OfflineEventAttendanceMode", () => {
    const ld = buildEventJsonLd(BASE_EVENT, "");
    expect(ld.eventAttendanceMode).toBe(
      "https://schema.org/OfflineEventAttendanceMode"
    );
  });

  it("maps virtual event to OnlineEventAttendanceMode", () => {
    const ld = buildEventJsonLd({ ...BASE_EVENT, isVirtual: true }, "");
    expect(ld.eventAttendanceMode).toBe(
      "https://schema.org/OnlineEventAttendanceMode"
    );
  });

  it("includes offers when ticketTiers are provided", () => {
    const event = {
      ...BASE_EVENT,
      ticketTiers: [{ name: "VIP", price: 99 }],
    };
    const ld = buildEventJsonLd(event, "https://eventra.app/events/1");
    expect(Array.isArray(ld.offers)).toBe(true);
    expect(ld.offers[0].name).toBe("VIP");
    expect(ld.offers[0].price).toBe(99);
  });

  it("includes performers when speakers are provided", () => {
    const event = {
      ...BASE_EVENT,
      speakers: [{ name: "Dan Abramov" }],
    };
    const ld = buildEventJsonLd(event, "");
    expect(Array.isArray(ld.performer)).toBe(true);
    expect(ld.performer[0].name).toBe("Dan Abramov");
  });
});

describe("mapEventStatus", () => {
  it("maps live to EventScheduled", () => {
    expect(mapEventStatus("live")).toBe("https://schema.org/EventScheduled");
  });
  it("maps cancelled to EventCancelled", () => {
    expect(mapEventStatus("cancelled")).toBe("https://schema.org/EventCancelled");
  });
});

describe("mapAttendanceMode", () => {
  it("returns online for virtual events", () => {
    expect(mapAttendanceMode({ isVirtual: true })).toBe(
      "https://schema.org/OnlineEventAttendanceMode"
    );
  });
  it("returns mixed for hybrid events", () => {
    expect(mapAttendanceMode({ isHybrid: true })).toBe(
      "https://schema.org/MixedEventAttendanceMode"
    );
  });
  it("returns offline by default", () => {
    expect(mapAttendanceMode({})).toBe(
      "https://schema.org/OfflineEventAttendanceMode"
    );
  });
});
