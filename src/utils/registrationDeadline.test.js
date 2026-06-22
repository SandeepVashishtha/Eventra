import {
  getRegistrationClosingInfo,
  REGISTRATION_CLOSING_WINDOW_HOURS,
} from "./registrationDeadline";

const NOW = new Date("2026-06-22T12:00:00Z").getTime();
const HOUR = 60 * 60 * 1000;

const eventClosingIn = (ms) => ({
  registrationEnd: new Date(NOW + ms).toISOString(),
});

describe("getRegistrationClosingInfo", () => {
  describe("when there is no usable deadline", () => {
    it("returns not-closing when registrationEnd is absent", () => {
      expect(getRegistrationClosingInfo({}, NOW).isClosingSoon).toBe(false);
    });

    it("returns not-closing for an invalid date", () => {
      const info = getRegistrationClosingInfo({ registrationEnd: "not-a-date" }, NOW);
      expect(info.isClosingSoon).toBe(false);
      expect(info.label).toBeNull();
    });

    it("returns not-closing for an empty string", () => {
      expect(getRegistrationClosingInfo({ registrationEnd: "" }, NOW).isClosingSoon).toBe(false);
    });
  });

  describe("window boundaries", () => {
    it("hides the badge once registration has closed", () => {
      const info = getRegistrationClosingInfo(eventClosingIn(-HOUR), NOW);
      expect(info.isClosingSoon).toBe(false);
      expect(info.label).toBeNull();
    });

    it("hides the badge when the deadline is beyond the 48h window", () => {
      const info = getRegistrationClosingInfo(eventClosingIn(49 * HOUR), NOW);
      expect(info.isClosingSoon).toBe(false);
    });

    it("shows the badge when the deadline is just inside the window", () => {
      const info = getRegistrationClosingInfo(
        eventClosingIn(REGISTRATION_CLOSING_WINDOW_HOURS * HOUR - HOUR),
        NOW
      );
      expect(info.isClosingSoon).toBe(true);
    });
  });

  describe("label formatting", () => {
    it("renders minutes when under an hour remains", () => {
      const info = getRegistrationClosingInfo(eventClosingIn(30 * 60 * 1000), NOW);
      expect(info.label).toBe("Registration closes in 30 minutes");
    });

    it("renders hours when under a day remains", () => {
      const info = getRegistrationClosingInfo(eventClosingIn(12 * HOUR), NOW);
      expect(info.label).toBe("Registration closes in 12 hours");
    });

    it("renders 'tomorrow' when roughly a day remains", () => {
      const info = getRegistrationClosingInfo(eventClosingIn(24 * HOUR), NOW);
      expect(info.label).toBe("Registration closes tomorrow");
    });

    it("renders days when more than a day remains", () => {
      const info = getRegistrationClosingInfo(eventClosingIn(47 * HOUR), NOW);
      expect(info.label).toBe("Registration closes in 2 days");
    });

    it("uses singular units correctly", () => {
      const info = getRegistrationClosingInfo(eventClosingIn(60 * 1000), NOW);
      expect(info.label).toBe("Registration closes in 1 minute");
    });
  });

  it("reads alternative deadline field names", () => {
    const info = getRegistrationClosingInfo(
      { registrationDeadline: new Date(NOW + 12 * HOUR).toISOString() },
      NOW
    );
    expect(info.isClosingSoon).toBe(true);
    expect(info.label).toBe("Registration closes in 12 hours");
  });
});
