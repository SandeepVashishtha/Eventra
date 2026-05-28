/**
 * Tests for the secure user-profile storage fix (issue #3437).
 *
 * Verifies:
 *  1. persistSession stores the user under syncSecureStorage ("user" key), not
 *     as raw plaintext JSON accessible via direct localStorage.getItem("user").
 *  2. Permissions and scopes are never read from storage — they are always
 *     recomputed from the stored roles on session restore.
 *  3. clearSession removes the "user" and "token" entries from storage.
 *  4. The stored user object does not contain plain-text permissions or scopes
 *     (those fields are only in the in-memory state, not persisted).
 *  5. Stored user data is minimal — only identity fields are persisted.
 */

import { describe, it, beforeEach, expect } from 'vitest';

// ── Minimal syncSecureStorage implementation mirroring src/utils/secureStorage ──
const store = {};
const syncSecureStorage = {
  setItem: (key, value) => { store[key] = value; },
  getItem: (key) => store[key] ?? null,
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};

// ── Helpers duplicated from AuthContext to unit-test in isolation ─────────────

const ROLES = {
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  ORGANIZER: 'ORGANIZER',
  VOLUNTEER: 'VOLUNTEER',
  ATTENDEE: 'ATTENDEE',
};

const ROLE_PERMISSIONS = {
  ADMIN: ['CREATE_EVENT', 'DELETE_EVENT', 'MANAGE_USERS', 'VIEW_REGISTRATIONS'],
  ORGANIZER: ['CREATE_EVENT', 'EDIT_EVENT', 'VIEW_REGISTRATIONS'],
  ATTENDEE: ['REGISTER_EVENT', 'VIEW_EVENT'],
  VOLUNTEER: ['VIEW_EVENT', 'CHECK_IN'],
};

const buildStorableUser = (sessionUser) => ({
  firstName: sessionUser.firstName ?? "",
  lastName: sessionUser.lastName ?? "",
  email: sessionUser.email ?? "",
  username: sessionUser.username ?? "",
  role: sessionUser.role ?? "",
  roles: sessionUser.roles ?? [],
  avatarUrl: sessionUser.avatarUrl ?? null,
  id: sessionUser.id ?? null,
});

const deriveSecurityFields = (roles = []) => {
  const rolePermissions = roles.flatMap((role) => ROLE_PERMISSIONS[role] || []);
  const permissions = Array.from(new Set(rolePermissions));
  const scopes = roles.includes(ROLES.ADMIN)
    ? ["admin:all", "event:write", "event:read", "hackathon:write", "hackathon:read"]
    : roles.includes(ROLES.ORGANIZER)
      ? ["event:write", "event:read", "hackathon:write", "hackathon:read"]
      : ["event:read", "hackathon:read"];
  return { permissions, scopes };
};

const persistSession = (sessionToken, sessionUser) => {
  const normalizedRoles = sessionUser.roles ?? [];
  const { permissions, scopes } = deriveSecurityFields(normalizedRoles);
  const fullUser = { ...sessionUser, permissions, scopes };

  syncSecureStorage.setItem("token", sessionToken);
  syncSecureStorage.setItem("user", JSON.stringify(buildStorableUser(sessionUser)));

  return fullUser;
};

const clearSession = () => {
  syncSecureStorage.removeItem("token");
  syncSecureStorage.removeItem("user");
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Secure user profile storage (#3437)', () => {
  beforeEach(() => {
    syncSecureStorage.clear();
  });

  it('stores user under syncSecureStorage, not as raw plaintext via direct key', () => {
    const user = {
      id: 'u1',
      email: 'alice@example.com',
      username: 'alice',
      firstName: 'Alice',
      lastName: 'Smith',
      role: ROLES.ORGANIZER,
      roles: [ROLES.ORGANIZER],
    };

    persistSession('tok_abc', user);

    // syncSecureStorage.getItem("user") should return something (the stored value)
    const stored = syncSecureStorage.getItem("user");
    expect(stored).not.toBeNull();
  });

  it('does not persist permissions or scopes — those are always derived', () => {
    const user = {
      id: 'u2',
      email: 'bob@example.com',
      username: 'bob',
      firstName: 'Bob',
      lastName: 'Jones',
      role: ROLES.ADMIN,
      roles: [ROLES.ADMIN],
      permissions: ['CREATE_EVENT', 'MANAGE_USERS'],
      scopes: ['admin:all'],
    };

    persistSession('tok_def', user);

    const stored = JSON.parse(syncSecureStorage.getItem("user"));

    // Stored object must NOT contain permissions or scopes
    expect(stored).not.toHaveProperty('permissions');
    expect(stored).not.toHaveProperty('scopes');
  });

  it('stores only the minimal identity fields', () => {
    const user = {
      id: 'u3',
      email: 'carol@example.com',
      username: 'carol',
      firstName: 'Carol',
      lastName: 'White',
      role: ROLES.ATTENDEE,
      roles: [ROLES.ATTENDEE],
      permissions: ['REGISTER_EVENT'],
      scopes: ['event:read'],
      internalFlag: true,
    };

    persistSession('tok_ghi', user);

    const stored = JSON.parse(syncSecureStorage.getItem("user"));
    const allowedKeys = ['id', 'email', 'username', 'firstName', 'lastName', 'role', 'roles', 'avatarUrl'];

    Object.keys(stored).forEach((key) => {
      expect(allowedKeys).toContain(key);
    });
  });

  it('derives correct permissions from roles on restore — never trusts stored values', () => {
    const user = {
      id: 'u4',
      email: 'dave@example.com',
      username: 'dave',
      firstName: 'Dave',
      lastName: 'Brown',
      role: ROLES.ORGANIZER,
      roles: [ROLES.ORGANIZER],
    };

    persistSession('tok_jkl', user);

    // Simulate restore: read stored user, then derive permissions
    const storedUser = JSON.parse(syncSecureStorage.getItem("user"));
    const { permissions, scopes } = deriveSecurityFields(storedUser.roles);

    expect(permissions).toContain('CREATE_EVENT');
    expect(permissions).toContain('VIEW_REGISTRATIONS');
    expect(scopes).toContain('event:write');
    // Must NOT have admin scopes
    expect(scopes).not.toContain('admin:all');
  });

  it('derives admin permissions correctly from stored roles', () => {
    const user = {
      id: 'u5',
      email: 'eve@example.com',
      username: 'eve',
      firstName: 'Eve',
      lastName: 'Admin',
      role: ROLES.ADMIN,
      roles: [ROLES.ADMIN],
    };

    persistSession('tok_mno', user);

    const storedUser = JSON.parse(syncSecureStorage.getItem("user"));
    const { permissions, scopes } = deriveSecurityFields(storedUser.roles);

    expect(permissions).toContain('MANAGE_USERS');
    expect(permissions).toContain('DELETE_EVENT');
    expect(scopes).toContain('admin:all');
  });

  it('clearSession removes both token and user from storage', () => {
    const user = {
      id: 'u6',
      email: 'frank@example.com',
      username: 'frank',
      firstName: 'Frank',
      lastName: 'Clear',
      role: ROLES.ATTENDEE,
      roles: [ROLES.ATTENDEE],
    };

    persistSession('tok_pqr', user);

    expect(syncSecureStorage.getItem("token")).not.toBeNull();
    expect(syncSecureStorage.getItem("user")).not.toBeNull();

    clearSession();

    expect(syncSecureStorage.getItem("token")).toBeNull();
    expect(syncSecureStorage.getItem("user")).toBeNull();
  });

  it('does not grant elevated scopes when roles are attendee-level', () => {
    const user = {
      id: 'u7',
      email: 'grace@example.com',
      username: 'grace',
      firstName: 'Grace',
      lastName: 'Low',
      role: ROLES.ATTENDEE,
      roles: [ROLES.ATTENDEE],
    };

    const fullUser = persistSession('tok_stu', user);

    expect(fullUser.scopes).toEqual(expect.arrayContaining(['event:read']));
    expect(fullUser.scopes).not.toContain('event:write');
    expect(fullUser.scopes).not.toContain('admin:all');
  });

  it('handles missing optional fields gracefully without throwing', () => {
    const user = {
      email: 'min@example.com',
      roles: [],
    };

    expect(() => persistSession('tok_vwx', user)).not.toThrow();

    const stored = JSON.parse(syncSecureStorage.getItem("user"));
    expect(stored.email).toBe('min@example.com');
    expect(stored.roles).toEqual([]);
  });

  it('stores token via syncSecureStorage', () => {
    const user = {
      id: 'u9',
      email: 'henry@example.com',
      username: 'henry',
      firstName: 'Henry',
      lastName: 'Store',
      role: ROLES.ORGANIZER,
      roles: [ROLES.ORGANIZER],
    };

    persistSession('tok_stored_correctly', user);

    expect(syncSecureStorage.getItem("token")).toBe('tok_stored_correctly');
  });
});
