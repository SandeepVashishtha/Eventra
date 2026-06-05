import assert from "node:assert/strict";
import { getUserFullName } from "../src/utils/userNameUtils.mjs";

assert.equal(getUserFullName(null), "", "missing user returns a blank name");

assert.equal(
  getUserFullName({}),
  "",
  "missing first and last names return a blank name"
);

assert.equal(
  getUserFullName({ firstName: "Ada" }),
  "Ada",
  "first name can be used on its own"
);

assert.equal(
  getUserFullName({ lastName: "Lovelace" }),
  "Lovelace",
  "last name can be used on its own"
);

assert.equal(
  getUserFullName({ firstName: " Ada ", lastName: " Lovelace " }),
  "Ada Lovelace",
  "complete names are trimmed and joined"
);

// Format with special characters (hyphenated, apostrophes)
assert.equal(
  getUserFullName({ firstName: "Jean-Luc", lastName: "Picard" }),
  "Jean-Luc Picard",
  "names with hyphens are preserved correctly"
);

assert.equal(
  getUserFullName({ firstName: "O'Connor" }),
  "O'Connor",
  "names with apostrophes are preserved correctly"
);

// Handling boolean/non-string properties
assert.equal(
  getUserFullName({ firstName: true, lastName: false }),
  "",
  "boolean inputs map to blank name"
);
