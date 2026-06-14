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
