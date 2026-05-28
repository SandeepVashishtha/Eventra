/**
 * Shared user store for auth handlers.
 *
 * Both signup.js and login.js import from this module so they read and write
 * the same Map when running in a single Node.js process (local dev, tests).
 *
 * PRODUCTION LIMITATION: Vercel and other serverless platforms execute each
 * API route file in an isolated process. Importing this module from signup.js
 * and login.js gives each handler its own copy of the Map -- they are not
 * shared. User records written by signup never appear in the login handler.
 *
 * To fix this in production, set SUPABASE_URL and SUPABASE_SERVICE_KEY.
 * When both variables are present, getUser() and saveUser() use Supabase
 * instead of the in-memory Map. The in-memory Map is still used as a
 * write-through cache within a single process so that synchronous callers
 * (e.g., test helpers that call `users.has()`) continue to work.
 *
 * Supabase setup (run once in the Supabase SQL editor):
 *
 *   CREATE TABLE IF NOT EXISTS users (
 *     email       TEXT PRIMARY KEY,
 *     data        JSONB NOT NULL,
 *     created_at  TIMESTAMPTZ DEFAULT now()
 *   );
 */

export const users = new Map();

let _supabase = null;

async function _client() {
  if (_supabase) return _supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    _supabase = createClient(url, key);
    return _supabase;
  } catch {
    return null;
  }
}

/**
 * Retrieve a user by email.
 * Returns the user object or null if not found.
 */
export async function getUser(email) {
  const sb = await _client();
  if (sb) {
    const { data, error } = await sb
      .from("users")
      .select("data")
      .eq("email", email)
      .maybeSingle();
    if (error) {
      console.error("[userStore] Supabase getUser error:", error.message);
      return users.get(email) ?? null;
    }
    if (data) {
      users.set(email, data.data);
      return data.data;
    }
    return null;
  }
  return users.get(email) ?? null;
}

/**
 * Persist a user record keyed by email.
 */
export async function saveUser(email, userObject) {
  users.set(email, userObject);
  const sb = await _client();
  if (sb) {
    const { error } = await sb.from("users").upsert(
      { email, data: userObject },
      { onConflict: "email" }
    );
    if (error) {
      console.error("[userStore] Supabase saveUser error:", error.message);
    }
  }
}

/**
 * Check whether an email is already registered.
 */
export async function hasUser(email) {
  const user = await getUser(email);
  return user !== null;
}
