import { normalizeDateString } from "./timezoneUtils";

describe("normalizeDateString", () => {
  it("keeps YYYY-MM-DD intact", () => {
    expect(normalizeDateString("2026-05-25")).toBe("2026-05-25");
  });

  it("strips time part from ISO with T", () => {
    expect(normalizeDateString("2026-05-25T10:00:00Z")).toBe("2026-05-25");
    expect(normalizeDateString("2026-05-25T15:30:00+05:30")).toBe("2026-05-25");
  });

  it("parses long form date correctly", () => {
    expect(normalizeDateString("May 25, 2026")).toBe("2026-05-25");
  });

  it("returns null for invalid inputs", () => {
    expect(normalizeDateString("")).toBeNull();
    expect(normalizeDateString(null)).toBeNull();
    expect(normalizeDateString("not-a-date")).toBeNull();
  });
});
