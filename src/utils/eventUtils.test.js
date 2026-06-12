import { getEventStatus, isEventRegistrationClosed } from "./eventUtils";

describe("event status utilities", () => {
  it("closes registration for computed past events", () => {
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

  it("keeps registration open for upcoming and live events", () => {
    expect(isEventRegistrationClosed("upcoming")).toBe(false);
    expect(isEventRegistrationClosed("live")).toBe(false);
  });
});
