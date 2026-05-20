import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { getRouteSearchResults } from "../src/utils/searchUtils.js";

const require = createRequire(import.meta.url);
const events = require("../src/Pages/Events/eventsMockData.json");
const hackathons = require("../src/Pages/Hackathons/hackathonMockData.json");

const eventKeys = ["title", "description", "location", "tags", "type", "date", "status"];
const hackathonKeys = [
  "title",
  "description",
  "location",
  "techStack",
  "organizer",
  "difficulty",
  "status",
  "startDate",
  "endDate",
];

assert.deepEqual(
  getRouteSearchResults(events, "Cloud Native Conference", eventKeys, {
    threshold: 0.35,
  }).map((event) => event.title),
  ["Cloud Native Conference"],
  "event route search finds the selected homepage suggestion"
);

assert.ok(
  getRouteSearchResults(hackathons, "Hackathon 2025", hackathonKeys).some(
    (hackathon) => hackathon.title === "Blockchain Hackathon"
  ),
  "hackathon route search handles title plus year query params"
);

assert.deepEqual(
  getRouteSearchResults(events, "", eventKeys).map((event) => event.id),
  events.map((event) => event.id),
  "empty route search returns the full listing"
);

console.log("route search query matching passed");
