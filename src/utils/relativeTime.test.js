import { getRelativeTime, getSmartDateLabel } from "./relativeTime";

describe("relativeTime utilities", () => {
  describe("getRelativeTime", () => {
    it("returns fallback for null, undefined, or empty inputs", () => {
      expect(getRelativeTime("")).toBe("—");
      expect(getRelativeTime(null)).toBe("—");
      expect(getRelativeTime(undefined)).toBe("—");
    });

    it("returns fallback for invalid and malformed date strings", () => {
      expect(getRelativeTime("invalid-date")).toBe("—");
      expect(getRelativeTime("2026-02-30T99:99:99")).toBe("—");
    });

    it("returns relative time descriptions for valid past and future dates", () => {
      const now = new Date();

      const pastSecDate = new Date(now.getTime() - 30 * 1000);
      expect(getRelativeTime(pastSecDate.toISOString())).toBe("Just ended");

      const futureMinDate = new Date(now.getTime() + 10 * 60 * 1000);
      expect(getRelativeTime(futureMinDate.toISOString())).toBe("In 10 minutes");
    });
  });

  describe("getSmartDateLabel", () => {
    it('returns "TBD" for falsy, null, or undefined date inputs', () => {
      expect(getSmartDateLabel("")).toBe("TBD");
      expect(getSmartDateLabel(null)).toBe("TBD");
      expect(getSmartDateLabel(undefined)).toBe("TBD");
    });

    it('returns "TBD" for invalid date inputs', () => {
      expect(getSmartDateLabel("invalid-date")).toBe("TBD");
    });

    it("returns relative description if available", () => {
      const futureMinDate = new Date(Date.now() + 10 * 60 * 1000);
      expect(getSmartDateLabel(futureMinDate.toISOString())).toBe("In 10 minutes");
    });

    it("returns formatted local date string if no relative description", () => {
      // 50 days in future (more than 30 days, so getRelativeTime returns null)
      const dateStr = "2026-07-15";
      const formatted = getSmartDateLabel(dateStr);
      // Expected output formats depending on local timezone, but should contain Month, Day, and Year
      expect(formatted).toContain("Jul");
      expect(formatted).toContain("15");
      expect(formatted).toContain("2026");
    });
  });
});
