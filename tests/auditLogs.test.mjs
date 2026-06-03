import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const componentPath = path.resolve(__dirname, "../src/Pages/Admin/AuditLogs.jsx");
const componentSrc = readFileSync(componentPath, "utf8");

describe("AuditLogs Component Structure", () => {
  it("exports AuditLogs as default export", () => {
    assert.ok(
      componentSrc.includes("export default AuditLogs"),
      "Component must export AuditLogs as default export"
    );
  });

  it("renders a Shield icon in the page header", () => {
    assert.ok(
      componentSrc.includes("Shield"),
      "Component must include Shield icon from lucide-react"
    );
  });

  it("renders the page title Security Audit Logs", () => {
    assert.ok(
      componentSrc.includes("Security Audit Logs"),
      "Component must display 'Security Audit Logs' header"
    );
  });

  it("defines mock security logs data", () => {
    assert.ok(
      componentSrc.includes("Login Success") && componentSrc.includes("MFA Enabled"),
      "Component must define mock log data containing security events"
    );
  });

  it("renders a table with appropriate table headers", () => {
    assert.ok(
      componentSrc.includes("<th>Event</th>") || componentSrc.includes("Event</th>"),
      "Component must render table header for Event column"
    );
    assert.ok(
      componentSrc.includes("<th>User</th>") || componentSrc.includes("User</th>"),
      "Component must render table header for User column"
    );
    assert.ok(
      componentSrc.includes("<th>IP Address</th>") || componentSrc.includes("IP Address</th>"),
      "Component must render table header for IP Address column"
    );
    assert.ok(
      componentSrc.includes("<th>Device</th>") || componentSrc.includes("Device</th>"),
      "Component must render table header for Device column"
    );
    assert.ok(
      componentSrc.includes("<th>Timestamp</th>") || componentSrc.includes("Timestamp</th>"),
      "Component must render table header for Timestamp column"
    );
  });

  it("iterates over the security logs list to render log entries", () => {
    assert.ok(
      componentSrc.includes("logs.map"),
      "Component must map over logs array to render rows"
    );
  });
});
