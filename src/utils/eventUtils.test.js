jest.mock("./timeSync", () => ({
  getServerTime: jest.fn(),
}));

import { getEventStatus, isEventRegistrationClosed } from "./eventUtils";
import { getServerTime } from "./timeSync";

describe("event status utilities", () => {
  beforeEach(() => {
    getServerTime.mockReset();
  });

  it("closes registration for computed past events", () => {
    getServerTime.mockReturnValue(new Date("2024-01-02T00:00:00.000Z"));
    const pastEvent = {
      date: "2024-01-01",
      time: "10:00",
      status: "upcoming",
    };

    expect(getEventStatus(pastEvent)).toBe("past");
    expect(isEventRegistrationClosed(pastEvent)).toBe(true);
  });

  it("closes registration for explicit ended statuses", () => {
    expect(getEventStatus({ status: "ended", date: "2099-01-01" })).toBe("ended");
    expect(isEventRegistrationClosed("event ended")).toBe(true);
  });

  it("uses server-synced clock for upcoming event status", () => {
    getServerTime.mockReturnValue(new Date("2026-01-01T12:00:00.000Z"));
    const upcomingEvent = {
      date: "2026-12-01",
      status: "upcoming",
    };

    expect(getEventStatus(upcomingEvent)).toBe("upcoming");
    expect(isEventRegistrationClosed(upcomingEvent)).toBe(false);
  });

  it("keeps registration open for upcoming and live events", () => {
    expect(isEventRegistrationClosed("upcoming")).toBe(false);
    expect(isEventRegistrationClosed("live")).toBe(false);
  });
});
