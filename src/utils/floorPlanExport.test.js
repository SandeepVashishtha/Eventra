import {
  getCleanExportSvgString,
  exportAsSVG,
  exportAsPNG,
  downloadLayoutJSON,
  importLayoutJSON,
} from "./floorPlanExport";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeSvgRef = (content = "<svg></svg>") => ({
  current: {
    cloneNode: jest.fn(() => {
      const clone = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      clone.setAttribute("width", "500");
      clone.setAttribute("height", "400");
      return clone;
    }),
    style: {},
    getAttribute: jest.fn(),
    setAttribute: jest.fn(),
    querySelector: jest.fn(() => null),
  },
});

const makeEmptyRef = () => ({ current: null });

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});

  // Stub URL methods
  jest.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
  jest.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

  // Stub document methods
  jest.spyOn(document, "createElement").mockImplementation((tag) => {
    const el = {
      tag,
      style: {},
      href: "",
      download: "",
      click: jest.fn(),
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      getContext: jest.fn(() => ({
        fillStyle: "",
        fillRect: jest.fn(),
        drawImage: jest.fn(),
      })),
      toBlob: jest.fn((cb) => cb(new Blob(["png"], { type: "image/png" }))),
      set src(_v) {
        // immediately fire onload when src is set
        setTimeout(() => this.onload && this.onload(), 0);
      },
      onload: null,
      onerror: null,
      width: 0,
      height: 0,
    };
    return el;
  });

  jest.spyOn(document.body, "appendChild").mockImplementation(() => {});
  jest.spyOn(document.body, "removeChild").mockImplementation(() => {});
  jest.spyOn(window, "getComputedStyle").mockReturnValue({ backgroundColor: "#0b0b14" });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// getCleanExportSvgString
// ---------------------------------------------------------------------------

describe("getCleanExportSvgString", () => {
  it("returns empty string when ref.current is null", () => {
    expect(getCleanExportSvgString(makeEmptyRef())).toBe("");
  });
});

// ---------------------------------------------------------------------------
// exportAsSVG
// ---------------------------------------------------------------------------

describe("exportAsSVG", () => {
  it("revokes the blob URL after clicking the download link", () => {
    const ref = makeSvgRef();
    exportAsSVG(ref, "evt-1");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("does not throw when ref.current is null", () => {
    expect(() => exportAsSVG(makeEmptyRef(), "evt-1")).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// exportAsPNG — canvas.getContext null guard (issue #7033)
// ---------------------------------------------------------------------------

describe("exportAsPNG — canvas context null guard", () => {
  it("revokes the blob URL and logs an error when getContext returns null", () => {
    const ref = makeSvgRef();

    // Override createElement so canvas.getContext returns null
    jest.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: jest.fn(() => null),
          toBlob: jest.fn(),
          style: {},
        };
      }
      // img element — fire onload immediately
      const img = {
        tag,
        style: {},
        onload: null,
        onerror: null,
        set src(_v) {
          setTimeout(() => this.onload && this.onload(), 0);
        },
      };
      return img;
    });

    exportAsPNG(ref, "evt-1");
    jest.runAllTimers();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("2D canvas context unavailable")
    );
  });
});

// ---------------------------------------------------------------------------
// exportAsPNG — blob URL timeout cleanup (issue #7034)
// ---------------------------------------------------------------------------

describe("exportAsPNG — blob URL timeout cleanup", () => {
  it("revokes the blob URL after 10 s when onload never fires", () => {
    const ref = makeSvgRef();

    // Override createElement so img.src setter never fires onload
    jest.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: jest.fn(() => ({
            fillStyle: "",
            fillRect: jest.fn(),
            drawImage: jest.fn(),
          })),
          toBlob: jest.fn(),
          style: {},
        };
      }
      // img — src setter is a no-op; neither onload nor onerror fires
      return { tag, style: {}, onload: null, onerror: null, set src(_v) {} };
    });

    exportAsPNG(ref, "evt-1");

    // Before 10 s: URL should NOT be revoked yet
    jest.advanceTimersByTime(9_999);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();

    // At 10 s: cleanup fires
    jest.advanceTimersByTime(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("timed out"));
  });

  it("clears the timeout when onload fires before 10 s", () => {
    const ref = makeSvgRef();
    exportAsPNG(ref, "evt-1");
    jest.runAllTimers();
    // warn should NOT have been called (load fired before timeout)
    expect(console.warn).not.toHaveBeenCalledWith(expect.stringContaining("timed out"));
  });

  it("revokes the blob URL immediately when onerror fires", () => {
    const ref = makeSvgRef();

    jest.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "canvas") {
        return {
          width: 0,
          height: 0,
          getContext: jest.fn(() => null),
          toBlob: jest.fn(),
          style: {},
        };
      }
      // img — fire onerror instead of onload
      const img = {
        tag,
        style: {},
        onload: null,
        onerror: null,
        set src(_v) {
          setTimeout(() => this.onerror && this.onerror(), 0);
        },
      };
      return img;
    });

    exportAsPNG(ref, "evt-1");
    jest.runAllTimers();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("SVG image failed to load"));
  });
});

// ---------------------------------------------------------------------------
// importLayoutJSON
// ---------------------------------------------------------------------------

describe("importLayoutJSON", () => {
  it("calls onImport with parsed data for a valid JSON array", () => {
    const onImport = jest.fn();
    const data = [{ id: "1", type: "circle", x: 0, y: 0 }];
    const file = new File([JSON.stringify(data)], "layout.json");
    const event = { target: { files: [file], value: "" } };

    importLayoutJSON(event, onImport);
    // FileReader is synchronous in jsdom
    expect(onImport).toHaveBeenCalledWith(data);
  });

  it("does not call onImport for invalid JSON", () => {
    const onImport = jest.fn();
    const file = new File(["not-json"], "layout.json");
    const event = { target: { files: [file], value: "" } };
    importLayoutJSON(event, onImport);
    expect(onImport).not.toHaveBeenCalled();
  });

  it("does not call onImport when required properties are missing", () => {
    const onImport = jest.fn();
    const data = [{ id: "1" }]; // missing type, x, y
    const file = new File([JSON.stringify(data)], "layout.json");
    const event = { target: { files: [file], value: "" } };
    importLayoutJSON(event, onImport);
    expect(onImport).not.toHaveBeenCalled();
  });
});
