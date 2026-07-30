import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  exportEventsResultFile,
  generateEventsCsv,
  generateEventsJson,
  getEventExportFilename,
} from "../src/utils/eventResultsExport.js";

const now = new Date("2026-06-05T10:00:00.000Z");
const filters = {
  searchQuery: "react",
  filterType: "upcoming",
  categoryFilter: "web-development",
  sortType: "Upcoming",
  viewMode: "grid",
  advancedFilters: {
    location: "Online",
    priceRange: { min: 0, max: 0 },
  },
};

const events = [
  {
    id: "event-1",
    title: 'React, "Advanced" Workshop',
    category: "Technology",
    date: "2026-06-05",
    location: { name: "Virtual Hall", city: "Online" },
    organizer: "Eventra",
    status: "upcoming",
    registrationLink: "https://eventra.test/register/react",
  },
  {
    id: "event-2",
    title: '=HYPERLINK("https://bad.test","open")',
    category: "Security",
    startDate: "2026-06-06",
    location: "Online",
    organizerName: "GSSoC",
    status: "live",
  },
];

describe("eventResultsExport", () => {
  it("uses meaningful dated filenames", () => {
    assert.equal(getEventExportFilename("csv", now), "events-export-2026-06-05.csv");
    assert.equal(getEventExportFilename("json", now), "events-export-2026-06-05.json");
  });

  it("generates CSV with metadata, headers, escaped commas, and formula protection", () => {
    const csv = generateEventsCsv(events, filters, now);

    assert.ok(csv.includes('"Exported At","2026-06-05T10:00:00.000Z"'));
    assert.ok(csv.includes('"Active Filters"'));
    assert.ok(csv.includes('"Event Count","2"'));
    assert.ok(
      csv.includes(
        '"Event Name","Category","Date","Location","Organizer","Status","Registration Link"',
      ),
    );
    assert.ok(csv.includes('"React, ""Advanced"" Workshop"'));
    assert.ok(csv.includes(`"'=HYPERLINK(""https://bad.test"",""open"")"`));
  });

  it("generates JSON with timestamp, filters, count, and event data", () => {
    const payload = JSON.parse(generateEventsJson(events, filters, now));

    assert.equal(payload.exportedAt, "2026-06-05T10:00:00.000Z");
    assert.equal(payload.count, 2);
    assert.equal(payload.filters.categoryFilter, "web-development");
    assert.equal(payload.filters.advancedFilters.location, "Online");
    assert.deepEqual(payload.events, events);
  });

  it("prevents empty result exports", () => {
    const result = exportEventsResultFile({
      events: [],
      filters,
      format: "csv",
      now,
    });

    assert.equal(result.ok, false);
    assert.equal(result.error, "No events are available to export.");
  });

  it("downloads only the visible events passed to the export function", () => {
    let blobContent = "";
    let downloadName = "";
    let clicked = false;
    let revokedUrl = "";

    globalThis.Blob = class {
      constructor(parts) {
        blobContent = parts.join("");
      }
    };
    globalThis.window = {
      URL: {
        createObjectURL() {
          return "blob:events";
        },
        revokeObjectURL(url) {
          revokedUrl = url;
        },
      },
    };
    globalThis.document = {
      body: {
        appendChild() {},
        removeChild() {},
      },
      createElement() {
        return {
          href: "",
          style: {},
          setAttribute(key, value) {
            if (key === "download") downloadName = value;
            this[key] = value;
          },
          click() {
            clicked = true;
          },
        };
      },
    };

    const result = exportEventsResultFile({
      events: [events[0]],
      filters,
      format: "json",
      now,
    });
    const payload = JSON.parse(blobContent);

    assert.equal(result.ok, true);
    assert.equal(result.count, 1);
    assert.equal(downloadName, "events-export-2026-06-05.json");
    assert.equal(clicked, true);
    assert.equal(revokedUrl, "blob:events");
    assert.equal(payload.count, 1);
    assert.deepEqual(payload.events, [events[0]]);
  });
});

console.log("eventResultsExport tests passed");
