import assert from "node:assert/strict";

import {
  COLOR_TOKENS,
  DEFAULT_THEME_VARIABLES,
  createThemeVariables,
} from "../src/components/styles/colorTokens.js";
import { THEMES } from "../src/components/styles/theme.js";

const requiredTokenGroups = [
  "brandPrimary",
  "brandSecondary",
  "surfacePage",
  "borderDefault",
  "textPrimary",
  "success",
  "warning",
  "danger",
];

for (const mode of ["light", "dark"]) {
  for (const tokenName of requiredTokenGroups) {
    assert.ok(COLOR_TOKENS[mode][tokenName], `missing ${mode} color token: ${tokenName}`);
  }
}

for (const mode of ["light", "dark"]) {
  const variables = DEFAULT_THEME_VARIABLES[mode];

  assert.equal(variables["--primary-color"], COLOR_TOKENS[mode].brandPrimary);
  assert.equal(variables["--secondary-color"], COLOR_TOKENS[mode].brandSecondary);
  assert.equal(variables["--bg-color"], COLOR_TOKENS[mode].surfacePage);
  assert.equal(variables["--border-color"], COLOR_TOKENS[mode].borderDefault);
  assert.equal(variables["--success-bg"], COLOR_TOKENS[mode].successSoft);
  assert.equal(variables["--warning-bg"], COLOR_TOKENS[mode].warningSoft);
  assert.equal(variables["--danger-bg"], COLOR_TOKENS[mode].dangerSoft);
}

for (const theme of Object.values(THEMES)) {
  for (const mode of ["light", "dark"]) {
    const variables = theme.colors[mode];

    assert.ok(variables["--bg-secondary"], `${theme.id} ${mode} missing secondary surface`);
    assert.ok(variables["--card-border"], `${theme.id} ${mode} missing card border`);
    assert.ok(variables["--card-shadow"], `${theme.id} ${mode} missing card shadow`);
    assert.ok(variables["--input-border"], `${theme.id} ${mode} missing input border`);
    assert.ok(
      variables["--color-primary-hover"],
      `${theme.id} ${mode} missing primary hover alias`
    );
  }
}

const legacyTheme = createThemeVariables({
  "--bg-color": "#101010",
  "--card-bg-color": "#202020",
  "--text-color": "#f7f7f7",
  "--text-color-light": "#d4d4d4",
  "--border-color": "#333333",
  "--primary-color": "#00aaff",
  "--secondary-color": "#006688",
  "--glow-color": "rgba(0, 170, 255, 0.3)",
});

assert.equal(legacyTheme["--bg-color"], "#101010");
assert.equal(legacyTheme["--bg-secondary"], "#202020");
assert.equal(legacyTheme["--color-primary-hover"], "#00aaff");

console.log("color tokens verified");
