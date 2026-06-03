import { eventOwnership } from "../db/store.js";

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    "events:view",
    "events:create",
    "events:edit",
    "events:delete",
    "events:register",
    "hackathons:view",
    "hackathons:host",
    "hackathons:participate",
    "projects:view",
    "projects:submit",
    "projects:upvote",
    "users:view",
    "users:edit",
    "users:delete",
    "analytics:view",
    "content:moderate",
    "profile:edit",
    "profile:view",
    "notifications:manage",
    "admin:access",
  ],
  ADMIN: [
    "events:view",
    "events:create",
    "events:edit",
    "events:delete",
    "events:register",
    "hackathons:view",
    "hackathons:host",
    "hackathons:participate",
    "projects:view",
    "projects:submit",
    "projects:upvote",
    "users:view",
    "analytics:view",
    "content:moderate",
    "profile:edit",
    "profile:view",
    "notifications:manage",
    "admin:access",
  ],
  ORGANIZER: [
    "events:view",
    "events:create",
    "events:edit",
    "events:register",
    "hackathons:view",
    "hackathons:host",
    "hackathons:participate",
    "projects:view",
    "projects:submit",
    "projects:upvote",
    "analytics:view",
    "profile:edit",
    "profile:view",
  ],
  VOLUNTEER: [
    "events:view",
    "events:register",
    "hackathons:view",
    "hackathons:participate",
    "projects:view",
    "projects:submit",
    "projects:upvote",
    "content:moderate",
    "profile:edit",
    "profile:view",
  ],
  ATTENDEE: [
    "events:view",
    "events:register",
    "hackathons:view",
    "hackathons:participate",
    "projects:view",
    "projects:submit",
    "projects:upvote",
    "profile:edit",
    "profile:view",
  ],
  USER: [
    "events:view",
    "events:register",
    "projects:view",
    "projects:submit",
    "hackathons:view",
    "hackathons:participate",
    "profile:edit",
    "profile:view",
  ],
};

const getPermissionsForRoles = (roles) => {
  const permissionsSet = new Set();
  roles.forEach((role) => {
    const normalizedRole = role.toUpperCase();
    const perms = ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS.USER;
    perms.forEach((perm) => permissionsSet.add(perm));
  });
  return Array.from(permissionsSet);
};

const isAuthorizedForEvent = (user, eventId) => {
  if (!user || !user.roles) return false;
  
  const roles = user.roles.map((r) => r.toUpperCase());
  if (roles.includes("SUPER_ADMIN") || roles.includes("ADMIN")) return true;

  if (roles.includes("ORGANIZER") || roles.includes("EVENT_MANAGER")) {
    const eventIdStr = String(eventId);
    const ownerId = eventOwnership.get(eventIdStr);

    if (!ownerId) {
      // Lazy initialization for mocks: first organizer to access claims ownership
      eventOwnership.set(eventIdStr, user.id);
      return true;
    }

    return ownerId === user.id;
  }

  return false;
};

export { ROLE_PERMISSIONS, getPermissionsForRoles, isAuthorizedForEvent };
