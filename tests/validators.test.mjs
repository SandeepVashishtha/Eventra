import assert from "node:assert/strict";
import { validators } from "../src/utils/validators.js";

// ─── email ───────────────────────────────────────────────────────────────────

// happy path
assert.equal(validators.email("user@example.com"), "");
assert.equal(validators.email("a+b@sub.domain.org"), "");
assert.equal(validators.email("x@y.co"), "");

// empty / falsy → required message
assert.equal(validators.email(""), "Email is required.");
assert.equal(validators.email(null), "Email is required.");
assert.equal(validators.email(undefined), "Email is required.");
assert.equal(validators.email(0), "Email is required.");

// invalid format → format message
assert.equal(validators.email("notanemail"), "Please enter a valid email address.");
assert.equal(validators.email("missing@"), "Please enter a valid email address.");
assert.equal(validators.email("@nodomain.com"), "Please enter a valid email address.");
assert.equal(validators.email("no dot after at@domain"), "Please enter a valid email address.");
assert.equal(validators.email("spaces in@email.com"), "Please enter a valid email address.");
assert.equal(validators.email("double@@domain.com"), "Please enter a valid email address.");

// ─── password ────────────────────────────────────────────────────────────────

// happy path
assert.equal(validators.password("12345678"), "");          // exactly 8
assert.equal(validators.password("a very long password"), "");

// empty / falsy → required message
assert.equal(validators.password(""), "Password is required.");
assert.equal(validators.password(null), "Password is required.");
assert.equal(validators.password(undefined), "Password is required.");

// too short (< 8 chars) → length message
assert.equal(validators.password("1234567"), "Password must be at least 8 characters.");
assert.equal(validators.password("abc"), "Password must be at least 8 characters.");
assert.equal(validators.password("x"), "Password must be at least 8 characters.");

// ─── confirmPassword ─────────────────────────────────────────────────────────

// happy path
assert.equal(validators.confirmPassword("mypassword", "mypassword"), "");
assert.equal(validators.confirmPassword("Abc!1234", "Abc!1234"), "");

// empty / falsy → required message (checked before match)
assert.equal(validators.confirmPassword("", "mypassword"), "Please confirm your password.");
assert.equal(validators.confirmPassword(null, "mypassword"), "Please confirm your password.");
assert.equal(validators.confirmPassword(undefined, "mypassword"), "Please confirm your password.");

// mismatch
assert.equal(validators.confirmPassword("other", "mypassword"), "Passwords do not match.");
assert.equal(validators.confirmPassword("MyPassword", "mypassword"), "Passwords do not match."); // case-sensitive

// ─── name ────────────────────────────────────────────────────────────────────

// happy path
assert.equal(validators.name("Alice"), "");
assert.equal(validators.name("John Doe"), "");

// empty, whitespace-only, or absent → required message
assert.equal(validators.name(""), "Full name is required.");
assert.equal(validators.name("   "), "Full name is required.");
assert.equal(validators.name("\t"), "Full name is required.");
assert.equal(validators.name(null), "Full name is required.");
assert.equal(validators.name(undefined), "Full name is required.");

console.log("validators tests passed ✓");
