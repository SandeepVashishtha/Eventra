jest.mock("./timeSync", () => ({
  getServerTime: jest.fn(),
}));

import { getEventStatus, isEventRegistrationClosed, getFomoStatus } from "./eventUtils";
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

describe("getFomoStatus", () => {
  describe("low inventory detection", () => {
    it("returns false for null capacity", () => {
      const result = getFomoStatus(null, 10);
      expect(result.isLowInventory).toBe(false);
      expect(result.message).toBeNull();
    });

    it("returns false for zero capacity", () => {
      const result = getFomoStatus(0, 0);
      expect(result.isLowInventory).toBe(false);
      expect(result.message).toBeNull();
    });

    it("returns false when event is full", () => {
      const result = getFomoStatus(50, 50);
      expect(result.isLowInventory).toBe(false);
      expect(result.message).toBeNull();
    });

    it("returns false when more than 10% capacity remains and more than 20 tickets", () => {
      const result = getFomoStatus(100, 50); // 50 remaining
      expect(result.isLowInventory).toBe(false);
      expect(result.message).toBeNull();
    });

    it("returns true with 'Selling Fast!' when at 10% threshold for large events", () => {
      const result = getFomoStatus(200, 180); // 20 remaining (exactly 10%)
      expect(result.isLowInventory).toBe(true);
      expect(result.message).toBe("Selling Fast!");
    });

    it("returns true with 'Selling Fast!' when below 20 tickets threshold", () => {
      const result = getFomoStatus(1000, 985); // 15 remaining (< 20)
      expect(result.isLowInventory).toBe(true);
      expect(result.message).toBe("Selling Fast!");
    });

    it("returns true with 'Only X Tickets Left!' when 5 or fewer tickets remain", () => {
      const result = getFomoStatus(50, 47); // 3 remaining
      expect(result.isLowInventory).toBe(true);
      expect(result.message).toBe("Only 3 Tickets Left!");
    });

    it("returns true with 'Only 1 Tickets Left!' when 1 ticket remains", () => {
      const result = getFomoStatus(25, 24); // 1 remaining
      expect(result.isLowInventory).toBe(true);
      expect(result.message).toBe("Only 1 Tickets Left!");
    });

    it("handles small events with < 20 capacity correctly", () => {
      const result = getFomoStatus(15, 10); // 5 remaining
      expect(result.isLowInventory).toBe(true);
      expect(result.message).toBe("Only 5 Tickets Left!");
    });

    it("uses 20 tickets as minimum threshold for larger events", () => {
      // For 300 capacity, 10% would be 30, but we use max(20, 30) = 30
      const result1 = getFomoStatus(300, 275); // 25 remaining (< 30)
      expect(result1.isLowInventory).toBe(true);
      expect(result1.message).toBe("Selling Fast!");

      // For 150 capacity, 10% would be 15, but we use max(20, 15) = 20
      const result2 = getFomoStatus(150, 135); // 15 remaining (< 20)
      expect(result2.isLowInventory).toBe(true);
      expect(result2.message).toBe("Selling Fast!");
    });
  });
});
