import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const indexCss = readFileSync("src/index.css", "utf8");

assert.match(indexCss, /--evt-surface-page-alt:\s*#111827;/);
assert.match(indexCss, /--evt-border-input:\s*#475569;/);
assert.match(indexCss, /\.dark\s*{[\s\S]*--input-bg:\s*var\(--evt-surface-page-alt\);/);
assert.match(indexCss, /\.dark\s*{[\s\S]*--input-border:\s*var\(--evt-border-input\);/);
assert.match(indexCss, /--bg-secondary:\s*var\(--evt-surface-muted\);/);
assert.match(indexCss, /--card-border:\s*1px solid var\(--evt-border-default\);/);
assert.match(indexCss, /input:focus,\s*textarea:focus,\s*select:focus/);
assert.match(indexCss, /select option\s*{[\s\S]*background-color:\s*var\(--input-bg\);/);

console.log("theme consistency styles verified");
