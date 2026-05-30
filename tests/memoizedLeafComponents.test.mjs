import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const readSource = (path) => readFileSync(path, "utf8");

const memoizedComponents = [
  {
    path: "src/components/Button.jsx",
    name: "Button",
    exportPattern: /export const Button = memo\(function Button\(/,
  },
  {
    path: "src/components/forms/ValidationMessage.jsx",
    name: "ValidationMessage",
    exportPattern: /export default ValidationMessage/,
  },
  {
    path: "src/components/forms/ValidationStatusIcon.jsx",
    name: "ValidationStatusIcon",
    exportPattern: /export default ValidationStatusIcon/,
  },
  {
    path: "src/components/common/StatusBadge.jsx",
    name: "StatusBadge",
    exportPattern: /export default StatusBadge/,
  },
  {
    path: "src/components/common/SectionHeader.jsx",
    name: "SectionHeader",
    exportPattern: /export default SectionHeader/,
  },
  {
    path: "src/components/common/Loading.jsx",
    name: "Loading",
    exportPattern: /export default Loading/,
  },
  {
    path: "src/components/common/FieldError.jsx",
    name: "FieldError",
    exportPattern: /export default FieldError/,
  },
  {
    path: "src/components/navbar/AuthButtons.jsx",
    name: "AuthButtons",
    exportPattern: /export default AuthButtons/,
  },
];

for (const component of memoizedComponents) {
  const source = readSource(component.path);
  const memoPattern = new RegExp(
    `const ${component.name} = memo\\(function ${component.name}\\(`
  );
  const namedMemoPattern = new RegExp(
    `export const ${component.name} = memo\\(function ${component.name}\\(`
  );

  assert.match(
    source,
    /import \{ memo \} from ['"]react['"]/,
    `${component.name} must import memo from React`
  );

  assert.ok(
    memoPattern.test(source) || namedMemoPattern.test(source),
    `${component.name} must be wrapped in React.memo with a named function`
  );

  assert.doesNotMatch(
    source,
    /memo\(function[\s\S]*?\)\s*=>/,
    `${component.name} must use valid function syntax inside React.memo`
  );

  assert.match(
    source,
    component.exportPattern,
    `${component.name} must preserve its existing export contract`
  );
}

console.log("memoized leaf component tests passed");
