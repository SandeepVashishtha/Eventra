
import { render, act } from "@testing-library/react";
import TicketScanner from "./TicketScanner";

// Mock toast to avoid errors during render
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    warning: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

// We will track the stop promise to resolve it manually
let resolveStop;
const mockStop = jest.fn().mockReturnValue(
  new Promise((resolve) => {
    resolveStop = resolve;
  })
);

// Mock Html5Qrcode
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

describe("TicketScanner Component", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    console.error.mockRestore();
  });

  it("should not update scannerStatus if component unmounts while camera is stopping", async () => {
    // 1. Render the component
    const { unmount } = render(<TicketScanner />);

    // Wait for the initial getCameras promise to resolve
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // 2. Unmount the component.
    // This triggers the useEffect cleanup, which calls stopScanner().
    unmount();

    // The mockStop should have been called
    expect(mockStop).toHaveBeenCalled();

    // 3. Resolve the stop promise while the component is unmounted
    await act(async () => {
      if (resolveStop) resolveStop();
      // Allow event loop to process the resolution
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    // If the fix is successful, we won't see the "Can't perform a React state update on an unmounted component"
    // warning in the console because isMountedRef prevents setScannerStatus from being called.
    // We expect the console.error NOT to have been called with the React state update warning.
    const consoleCalls = console.error.mock.calls.map(call => call[0]);
    const hasUnmountedWarning = consoleCalls.some(msg => 
      typeof msg === "string" && msg.includes("unmounted component")
    );
    
    expect(hasUnmountedWarning).toBe(false);
  });
});
