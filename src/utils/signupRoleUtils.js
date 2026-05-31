import { ROLES } from "../config/roles.js";

const VALID_APP_ROLES = new Set(Object.values(ROLES));
const LEGACY_ROLE_ALIASES = {
  USER: ROLES.ATTENDEE,
};

const normalizeRole = (role) => {
  if (typeof role !== "string") return null;

  const normalized = role.trim().toUpperCase();
  return LEGACY_ROLE_ALIASES[normalized] ?? normalized;
};

export const resolveSignupRoles = (data = {}) => {
  const roleCandidates =
    Array.isArray(data.roles) && data.roles.length > 0 ? data.roles : [data.role];

  const roles = roleCandidates.reduce((resolvedRoles, role) => {
    const normalizedRole = normalizeRole(role);

    if (
      normalizedRole &&
      VALID_APP_ROLES.has(normalizedRole) &&
      !resolvedRoles.includes(normalizedRole)
    ) {
      resolvedRoles.push(normalizedRole);
    }

    return resolvedRoles;
  }, []);

  return roles.length > 0 ? roles : [ROLES.ATTENDEE];
};
