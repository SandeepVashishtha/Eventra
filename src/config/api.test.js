import { API_ENDPOINTS } from "./api";

describe("API_ENDPOINTS.EVENTS.SCHEDULE", () => {
  it("is a function that builds the schedule URL for an event id (#12075)", () => {
    expect(typeof API_ENDPOINTS.EVENTS.SCHEDULE).toBe("function");
    const url = API_ENDPOINTS.EVENTS.SCHEDULE(123);
    expect(url).toMatch(/\/events\/123\/schedule$/);
  });

  it("produces distinct URLs for distinct events", () => {
    const urlA = API_ENDPOINTS.EVENTS.SCHEDULE(1);
    const urlB = API_ENDPOINTS.EVENTS.SCHEDULE(2);
    expect(urlA).not.toBe(urlB);
  });
});
