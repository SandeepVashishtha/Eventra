import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const indexCss = readFileSync("src/index.css", "utf8");
const analyticsJs = readFileSync("src/Pages/Events/EventAnalyticsDashboard.js", "utf8");
const analyticsCss = readFileSync("src/Pages/Events/EventAnalyticsDashboard.css", "utf8");

assert.match(indexCss, /--evt-surface-page-alt:\s*#111827;/);
assert.match(indexCss, /--evt-border-input:\s*#475569;/);
assert.match(indexCss, /\.dark\s*{[\s\S]*--input-bg:\s*var\(--evt-surface-page-alt\);/);
assert.match(indexCss, /\.dark\s*{[\s\S]*--input-border:\s*var\(--evt-border-input\);/);
assert.match(indexCss, /--bg-secondary:\s*var\(--evt-surface-muted\);/);
assert.match(indexCss, /--card-border:\s*1px solid var\(--evt-border-default\);/);
assert.match(indexCss, /input:focus,\s*textarea:focus,\s*select:focus/);
assert.match(indexCss, /select option\s*{[\s\S]*background-color:\s*var\(--input-bg\);/);

assert.match(analyticsJs, /const getChartTheme = \(isDarkMode\) =>/);
assert.match(analyticsJs, /stroke={chartTheme\.grid}/);
assert.match(analyticsJs, /<Tooltip \{\.\.\.chartTooltipProps\(chartTheme\)\} \/>/);
assert.match(analyticsJs, /const \{ isDarkMode \} = useTheme\(\);/);

assert.match(analyticsCss, /\.dark \.ead-card \.recharts-cartesian-axis-tick-value/);
assert.match(analyticsCss, /\.dark \.ead-sentiment--positive/);
assert.match(analyticsCss, /\.dark \.ead-tab--active/);

console.log("theme consistency styles verified");
