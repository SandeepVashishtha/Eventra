import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const languageContextSrc = readFileSync("src/context/LanguageContext.jsx", "utf8");
const i18nSrc = readFileSync("src/i18n/i18n.js", "utf8");
const indexCss = readFileSync("src/index.css", "utf8");
const arLocale = JSON.parse(readFileSync("src/i18n/locales/ar.json", "utf8"));

test("Arabic is registered as a supported, RTL-flagged language", () => {
  assert.match(languageContextSrc, /code:\s*"ar"[\s\S]*?rtl:\s*true/);
});

test("isRTL is derived from the active language, not hardcoded", () => {
  assert.doesNotMatch(languageContextSrc, /isRTL:\s*false,?\s*\n/);
  assert.match(languageContextSrc, /isRTL:\s*isLanguageRTL\(language\)/);
});

test("document direction is applied on language change and initial load", () => {
  assert.match(languageContextSrc, /document\.documentElement\.dir\s*=/);
  assert.match(languageContextSrc, /applyDocumentDirection/);
});

test("Arabic locale resource is registered in i18next config", () => {
  assert.match(i18nSrc, /import ar from "\.\/locales\/ar\.json"/);
  assert.match(i18nSrc, /ar:\s*{\s*translation:\s*ar\s*}/);
  assert.match(i18nSrc, /supportedLngs:\s*\[[^\]]*"ar"[^\]]*\]/);
});

test("global rtl: Tailwind variant is available for direction-aware overrides", () => {
  assert.match(indexCss, /@custom-variant rtl \(&:where\(\[dir="rtl"\], \[dir="rtl"\] \*\)\);/);
});

test("Arabic locale file has valid structure covering core UI namespaces", () => {
  for (const namespace of ["app", "nav", "auth", "common", "footer", "event"]) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(arLocale, namespace),
      `ar.json is missing the "${namespace}" namespace`
    );
  }
  assert.equal(arLocale.nav.home, "الرئيسية");
});

console.log("RTL language support wiring verified");
