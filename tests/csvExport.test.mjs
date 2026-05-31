import assert from "node:assert/strict";

const store = {};
globalThis.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};

globalThis.window = {
  location: { href: "http://localhost/test" },
  dispatchEvent: () => {},
  URL: {},
};

let createdBlob = null;
let clickedLink = null;

globalThis.URL = {
  createObjectURL: (blob) => {
    createdBlob = blob;
    return "blob:test-url";
  },
  revokeObjectURL: (url) => {},
};

globalThis.document = {
  createElement: (tag) => {
    if (tag === "a") {
      return {
        setAttribute: () => {},
        style: {},
        click: () => { clickedLink = true; },
        remove: () => {},
      };
    }
    return {};
  },
  body: { appendChild: () => {}, removeChild: () => {} },
};

import { escapeCSVValue, toCSV, downloadCSV, exportEventsToCSV } from "../src/utils/csvExport.js";

assert.strictEqual(escapeCSVValue("plain text"), "plain text", "Plain text should not be escaped");
assert.strictEqual(escapeCSVValue("hello,world"), '"hello,world"', "String with comma should be quoted");
assert.strictEqual(escapeCSVValue("say \"hello\""), '"say ""hello"""', "String with quotes should be escaped");
assert.strictEqual(escapeCSVValue("line1\nline2"), '"line1\nline2"', "String with newline should be quoted");
assert.strictEqual(escapeCSVValue("field1\rfield2"), '"field1\rfield2"', "String with CR should be quoted");
assert.strictEqual(escapeCSVValue(null), "", "null should return empty string");
assert.strictEqual(escapeCSVValue(undefined), "", "undefined should return empty string");
assert.strictEqual(escapeCSVValue(123), "123", "Numbers should be converted to string");

const data1 = [];
assert.strictEqual(toCSV(data1), "", "Empty array returns empty string");

const data2 = [{ name: "Alice", age: 30 }];
assert.ok(toCSV(data2).includes("Alice"), "Single row should be included");

const data3 = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
];
const csv3 = toCSV(data3);
assert.ok(csv3.includes("Alice") && csv3.includes("Bob"), "Multiple rows should be included");

const cols = ["name", "age"];
const csvWithCols = toCSV(data3, cols);
assert.strictEqual(csvWithCols.split("\n").length, 3, "Should have header and 2 data rows");

const headers = { name: "Full Name", age: "Age" };
const csvWithHeaders = toCSV(data3, cols, { headers });
assert.ok(csvWithHeaders.includes("Full Name"), "Custom headers should be used");

const data4 = [
  { name: "Alice, Jr.", age: 5 },
];
const csv4 = toCSV(data4, ["name"]);
assert.ok(csv4.includes('"Alice, Jr."'), "Comma in data should be escaped");

createdBlob = null;
clickedLink = false;
downloadCSV("a,b\n1,2", "test.csv");
assert.strictEqual(clickedLink, true, "downloadCSV should click the link");

exportEventsToCSV([{ title: "Event A", date: "2025-01-01", location: "Hall 1", category: "tech", status: "active", attendees: 10 }], "events.csv");
assert.strictEqual(clickedLink, true, "exportEventsToCSV should trigger download");

console.log("All csvExport tests passed");