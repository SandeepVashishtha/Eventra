import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/components/common/FormInput.jsx", import.meta.url), "utf8");

assert.match(source, /htmlFor=\{inputId\}/, "label should be programmatically associated with the input");
assert.match(source, /id=\{inputId\}/, "input should receive a stable id");
assert.match(source, /aria-describedby=\{describedBy\}/, "input should reference helper/error descriptions");
assert.match(source, /aria-invalid=\{error \? "true" : undefined\}/, "errored inputs should expose aria-invalid");
assert.match(source, /id=\{errorId\}/, "error message should have an id for aria-describedby");
assert.match(source, /role="alert"/, "error message should be announced to assistive technology");
assert.match(source, /joinIds\(ariaDescribedBy, errorId\)/, "existing aria-describedby values should be preserved");

console.log("FormInput accessibility contract passed");
