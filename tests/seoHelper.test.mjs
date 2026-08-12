import assert from "node:assert/strict";
import { generateEventStructuredData } from "../src/utils/seoHelper.js";

const data = generateEventStructuredData({ title: "Hackathon" });
assert.strictEqual(data["@type"], "Event");
assert.strictEqual(data.name, "Hackathon");
console.log("seoHelper tests passed ✓");
