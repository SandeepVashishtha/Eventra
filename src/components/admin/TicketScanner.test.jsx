import React from "react";
import { render, act } from "@testing-library/react";
import TicketScanner from "./TicketScanner";

// Mock toast to avoid errors during render
jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    warning: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

describe("TicketScanner Component", () => {
  // 🔥 FIX 1: Moved mutable variables INSIDE the describe block.
  // This ensures strict isolation so multiple tests won't corrupt each other.
  let resolveStop;
  let mockStop;

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Initialize clean mock state for every individual test
    mockStop = jest.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveStop = resolve;
      })
    );

    // Dynamic mock implementation injected before each test
    jest.mock("html5-qrcode", () => {
      class MockHtml5Qrcode {
        constructor() {
          this.isScanning = true;
        }
        start = jest.fn().mockResolvedValue();
        stop = mockStop;

        static getCameras = jest.fn().mockResolvedValue([
          { id: "cam1", label: "Back Camera" },
        ]);
      }
      return { Html5Qrcode: MockHtml5Qrcode };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    console.error.mockRestore();
    // Clear out the module cache to reset the dynamic mock
    jest.resetModules();
  });

  it("should gracefully handle component unmounting while camera is stopping", async () => {
    // 1. Render the component
    const { unmount } = render(<TicketScanner />);

    // 🔥 FIX 2: Replaced brittle setTimeout with deterministic promise flushing.
    // This allows the event loop to process the initial getCameras promise instantly.
    await act(async () => {
      await Promise.resolve();
    });

    // 2. Unmount the component.
    // This triggers the useEffect cleanup, which calls stopScanner().
    unmount();

    // The mockStop should have been called
    expect(mockStop).toHaveBeenCalled();

    // 3. Resolve the stop promise while the component is unmounted
    await act(async () => {
      if (resolveStop) resolveStop();
      await Promise.resolve(); 
    });

    // 🔥 FIX 3: Addressed the React 18 False Positive.
    // The "state update on unmounted component" warning was removed in React 18.
    // Instead of looking for a ghost warning, we simply assert that the cleanup 
    // lifecycle completed without throwing any actual unhandled exceptions.
    expect(console.error).not.toHaveBeenCalled();
  });
});