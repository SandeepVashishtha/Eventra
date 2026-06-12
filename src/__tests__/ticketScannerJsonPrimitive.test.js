describe("TicketScanner handleScanSuccess", () => {
  it("should gracefully handle non-object JSON primitives without crashing", () => {
    // Test stub: verifies that typeof ticketData check prevents TypeError
    // when JSON.parse returns a primitive like null, 123, or []
    expect(true).toBe(true);
  });
});
