/**
 * Event Co-Organizer utilities.
 *
 * Supports:
 * - Inviting co-organizers
 * - Assigning permissions
 * - Removing co-organizers
 * - Invitation status management
 * - Permission checks
 * - Activity tracking
 */

export const CO_ORGANIZER_PERMISSIONS = {
  MANAGE_PARTICIPANTS:
    "manageParticipants",
  PUBLISH_ANNOUNCEMENTS:
    "publishAnnouncements",
  EDIT_EVENT_DETAILS:
    "editEventDetails",
  MANAGE_FEEDBACK:
    "manageFeedback",
};

export const CO_ORGANIZER_PERMISSION_CONFIG = [
  {
    id: CO_ORGANIZER_PERMISSIONS.MANAGE_PARTICIPANTS,
    label: "Manage Participants",
    description:
      "View, manage, and remove event participants.",
  },
  {
    id: CO_ORGANIZER_PERMISSIONS.PUBLISH_ANNOUNCEMENTS,
    label: "Publish Announcements",
    description:
      "Create and publish announcements for the event.",
  },
  {
    id: CO_ORGANIZER_PERMISSIONS.EDIT_EVENT_DETAILS,
    label: "Edit Event Details",
    description:
      "Update event information, schedule, and venue details.",
  },
  {
    id: CO_ORGANIZER_PERMISSIONS.MANAGE_FEEDBACK,
    label: "Manage Feedback",
    description:
      "Review and manage participant feedback.",
  },
];

export const CO_ORGANIZER_STATUSES = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  REMOVED: "removed",
};

/**
 * Normalize an ID.
 */
export const normalizeOrganizerId = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};

/**
 * Extract a user ID from a user object.
 */
export const getOrganizerUserId = (
  user = {}
) => {
  if (
    typeof user !== "object" ||
    user === null
  ) {
    return normalizeOrganizerId(
      user
    );
  }

  return normalizeOrganizerId(
    user.id ??
      user.userId ??
      user.user_id ??
      user.organizerId
  );
};

/**
 * Extract an event ID.
 */
export const getOrganizerEventId = (
  event = {}
) => {
  if (
    typeof event !== "object" ||
    event === null
  ) {
    return normalizeOrganizerId(
      event
    );
  }

  return normalizeOrganizerId(
    event.id ??
      event.eventId ??
      event.event_id
  );
};

/**
 * Generate a unique co-organizer ID.
 */
export const generateCoOrganizerId = () => {
  return `co-organizer-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
};

/**
 * Generate a unique activity ID.
 */
export const generateCoOrganizerActivityId =
  () => {
    return `co-organizer-activity-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
  };

/**
 * Normalize an email address.
 */
export const normalizeOrganizerEmail = (
  email
) => {
  if (
    email === null ||
    email === undefined
  ) {
    return "";
  }

  return String(email)
    .trim()
    .toLowerCase();
};

/**
 * Validate an email address.
 */
export const isValidOrganizerEmail = (
  email
) => {
  const normalized =
    normalizeOrganizerEmail(
      email
    );

  if (!normalized) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    normalized
  );
};

/**
 * Normalize a permission list.
 */
export const normalizePermissions = (
  permissions = []
) => {
  if (!Array.isArray(permissions)) {
    return [];
  }

  const validPermissions =
    new Set(
      Object.values(
        CO_ORGANIZER_PERMISSIONS
      )
    );

  return [
    ...new Set(
      permissions.filter(
        (permission) =>
          validPermissions.has(
            permission
          )
      )
    ),
  ];
};

/**
 * Get permission metadata.
 */
export const getPermissionConfig = (
  permissionId
) => {
  return (
    CO_ORGANIZER_PERMISSION_CONFIG.find(
      (permission) =>
        permission.id ===
        permissionId
    ) || null
  );
};

/**
 * Get all available permissions.
 */
export const getAvailablePermissions = () => {
  return CO_ORGANIZER_PERMISSION_CONFIG.map(
    (permission) => ({
      ...permission,
    })
  );
};

/**
 * Check whether a permission exists.
 */
export const isValidPermission = (
  permissionId
) => {
  return Object.values(
    CO_ORGANIZER_PERMISSIONS
  ).includes(permissionId);
};

/**
 * Check whether a co-organizer has
 * a specific permission.
 */
export const hasCoOrganizerPermission = (
  coOrganizer,
  permission
) => {
  if (!coOrganizer) {
    return false;
  }

  const permissions =
    normalizePermissions(
      coOrganizer.permissions
    );

  return permissions.includes(
    permission
  );
};

/**
 * Check whether a co-organizer has
 * at least one permission.
 */
export const hasAnyCoOrganizerPermission = (
  coOrganizer,
  permissions = []
) => {
  if (!coOrganizer) {
    return false;
  }

  return normalizePermissions(
    permissions
  ).some((permission) =>
    hasCoOrganizerPermission(
      coOrganizer,
      permission
    )
  );
};

/**
 * Check whether a co-organizer has
 * every requested permission.
 */
export const hasAllCoOrganizerPermissions = (
  coOrganizer,
  permissions = []
) => {
  if (!coOrganizer) {
    return false;
  }

  return normalizePermissions(
    permissions
  ).every((permission) =>
    hasCoOrganizerPermission(
      coOrganizer,
      permission
    )
  );
};

/**
 * Create a new co-organizer invitation.
 */
export const createCoOrganizerInvitation = ({
  eventId,
  organizerId,
  userId = "",
  email = "",
  name = "",
  permissions = [],
  message = "",
} = {}) => {
  const normalizedEventId =
    normalizeOrganizerId(
      eventId
    );

  const normalizedOrganizerId =
    normalizeOrganizerId(
      organizerId
    );

  const normalizedUserId =
    normalizeOrganizerId(
      userId
    );

  const normalizedEmail =
    normalizeOrganizerEmail(
      email
    );

  const normalizedPermissions =
    normalizePermissions(
      permissions
    );

  const now =
    new Date().toISOString();

  return {
    id: generateCoOrganizerId(),
    eventId:
      normalizedEventId,
    organizerId:
      normalizedOrganizerId,
    userId:
      normalizedUserId,
    email:
      normalizedEmail,
    name:
      String(name || "").trim(),
    permissions:
      normalizedPermissions,
    status:
      CO_ORGANIZER_STATUSES.PENDING,
    message:
      String(message || "").trim(),
    invitedAt: now,
    acceptedAt: null,
    declinedAt: null,
    removedAt: null,
  };
};

/**
 * Validate a co-organizer invitation.
 */
export const validateCoOrganizerInvitation =
  ({
    eventId,
    organizerId,
    userId = "",
    email = "",
    permissions = [],
  } = {}) => {
    const errors = [];

    if (
      !normalizeOrganizerId(
        eventId
      )
    ) {
      errors.push(
        "Event ID is required."
      );
    }

    if (
      !normalizeOrganizerId(
        organizerId
      )
    ) {
      errors.push(
        "Primary organizer ID is required."
      );
    }

    if (
      !normalizeOrganizerId(
        userId
      ) &&
      !normalizeOrganizerEmail(
        email
      )
    ) {
      errors.push(
        "A participant user ID or email is required."
      );
    }

    if (
      email &&
      !isValidOrganizerEmail(
        email
      )
    ) {
      errors.push(
        "The co-organizer email address is invalid."
      );
    }

    if (
      !Array.isArray(permissions)
    ) {
      errors.push(
        "Permissions must be provided as an array."
      );
    }

    return {
      valid:
        errors.length === 0,
      errors,
    };
  };

/**
 * Check whether a user is already
 * a co-organizer.
 */
export const isExistingCoOrganizer = (
  coOrganizers = [],
  {
    userId = "",
    email = "",
  } = {}
) => {
  if (
    !Array.isArray(
      coOrganizers
    )
  ) {
    return false;
  }

  const normalizedUserId =
    normalizeOrganizerId(
      userId
    );

  const normalizedEmail =
    normalizeOrganizerEmail(
      email
    );

  return coOrganizers.some(
    (coOrganizer) => {
      const sameUser =
        normalizedUserId &&
        normalizeOrganizerId(
          coOrganizer.userId
        ) === normalizedUserId;

      const sameEmail =
        normalizedEmail &&
        normalizeOrganizerEmail(
          coOrganizer.email
        ) === normalizedEmail;

      return (
        sameUser || sameEmail
      );
    }
  );
};

/**
 * Find a co-organizer by ID.
 */
export const findCoOrganizer = (
  coOrganizers = [],
  coOrganizerId
) => {
  if (
    !Array.isArray(
      coOrganizers
    )
  ) {
    return null;
  }

  const normalizedId =
    normalizeOrganizerId(
      coOrganizerId
    );

  return (
    coOrganizers.find(
      (coOrganizer) =>
        normalizeOrganizerId(
          coOrganizer.id
        ) === normalizedId
    ) || null
  );
};

/**
 * Find a co-organizer by user ID.
 */
export const findCoOrganizerByUserId = (
  coOrganizers = [],
  userId
) => {
  if (
    !Array.isArray(
      coOrganizers
    )
  ) {
    return null;
  }

  const normalizedUserId =
    normalizeOrganizerId(
      userId
    );

  return (
    coOrganizers.find(
      (coOrganizer) =>
        normalizeOrganizerId(
          coOrganizer.userId
        ) === normalizedUserId
    ) || null
  );
};

/**
 * Find a co-organizer by email.
 */
export const findCoOrganizerByEmail = (
  coOrganizers = [],
  email
) => {
  if (
    !Array.isArray(
      coOrganizers
    )
  ) {
    return null;
  }

  const normalizedEmail =
    normalizeOrganizerEmail(
      email
    );

  return (
    coOrganizers.find(
      (coOrganizer) =>
        normalizeOrganizerEmail(
          coOrganizer.email
        ) === normalizedEmail
    ) || null
  );
};

/**
 * Add a co-organizer invitation.
 */
export const addCoOrganizer = (
  coOrganizers = [],
  invitation
) => {
  if (!invitation) {
    return Array.isArray(
      coOrganizers
    )
      ? [...coOrganizers]
      : [];
  }

  if (
    isExistingCoOrganizer(
      coOrganizers,
      {
        userId:
          invitation.userId,
        email:
          invitation.email,
      }
    )
  ) {
    return Array.isArray(
      coOrganizers
    )
      ? [...coOrganizers]
      : [];
  }

  return [
    ...(Array.isArray(
      coOrganizers
    )
      ? coOrganizers
      : []),
    invitation,
  ];
};

/**
 * Update co-organizer permissions.
 */
export const updateCoOrganizerPermissions =
  (
    coOrganizers = [],
    coOrganizerId,
    permissions = []
  ) => {
    if (
      !Array.isArray(
        coOrganizers
      )
    ) {
      return [];
    }

    const normalizedPermissions =
      normalizePermissions(
        permissions
      );

    const normalizedId =
      normalizeOrganizerId(
        coOrganizerId
      );

    return coOrganizers.map(
      (coOrganizer) => {
        if (
          normalizeOrganizerId(
            coOrganizer.id
          ) !== normalizedId
        ) {
          return coOrganizer;
        }

        return {
          ...coOrganizer,
          permissions:
            normalizedPermissions,
          updatedAt:
            new Date().toISOString(),
        };
      }
    );
  };

/**
 * Add one permission to a
 * co-organizer.
 */
export const grantCoOrganizerPermission =
  (
    coOrganizers = [],
    coOrganizerId,
    permission
  ) => {
    if (
      !isValidPermission(
        permission
      )
    ) {
      return Array.isArray(
        coOrganizers
      )
        ? [...coOrganizers]
        : [];
    }

    const coOrganizer =
      findCoOrganizer(
        coOrganizers,
        coOrganizerId
      );

    if (!coOrganizer) {
      return [...coOrganizers];
    }

    const permissions =
      normalizePermissions([
        ...(coOrganizer.permissions ||
          []),
        permission,
      ]);

    return updateCoOrganizerPermissions(
      coOrganizers,
      coOrganizerId,
      permissions
    );
  };

/**
 * Remove one permission from a
 * co-organizer.
 */
export const revokeCoOrganizerPermission =
  (
    coOrganizers = [],
    coOrganizerId,
    permission
  ) => {
    if (
      !Array.isArray(
        coOrganizers
      )
    ) {
      return [];
    }

    const coOrganizer =
      findCoOrganizer(
        coOrganizers,
        coOrganizerId
      );

    if (!coOrganizer) {
      return [...coOrganizers];
    }

    const permissions =
      normalizePermissions(
        coOrganizer.permissions
      ).filter(
        (item) =>
          item !== permission
      );

    return updateCoOrganizerPermissions(
      coOrganizers,
      coOrganizerId,
      permissions
    );
  };

/**
 * Accept a co-organizer invitation.
 */
export const acceptCoOrganizerInvitation =
  (
    coOrganizers = [],
    coOrganizerId
  ) => {
    if (
      !Array.isArray(
        coOrganizers
      )
    ) {
      return [];
    }

    const normalizedId =
      normalizeOrganizerId(
        coOrganizerId
      );

    const now =
      new Date().toISOString();

    return coOrganizers.map(
      (coOrganizer) => {
        if (
          normalizeOrganizerId(
            coOrganizer.id
          ) !== normalizedId
        ) {
          return coOrganizer;
        }

        return {
          ...coOrganizer,
          status:
            CO_ORGANIZER_STATUSES.ACCEPTED,
          acceptedAt: now,
          updatedAt: now,
        };
      }
    );
  };

/**
 * Decline a co-organizer invitation.
 */
export const declineCoOrganizerInvitation =
  (
    coOrganizers = [],
    coOrganizerId
  ) => {
    if (
      !Array.isArray(
        coOrganizers
      )
    ) {
      return [];
    }

    const normalizedId =
      normalizeOrganizerId(
        coOrganizerId
      );

    const now =
      new Date().toISOString();

    return coOrganizers.map(
      (coOrganizer) => {
        if (
          normalizeOrganizerId(
            coOrganizer.id
          ) !== normalizedId
        ) {
          return coOrganizer;
        }

        return {
          ...coOrganizer,
          status:
            CO_ORGANIZER_STATUSES.DECLINED,
          declinedAt: now,
          updatedAt: now,
        };
      }
    );
  };

/**
 * Remove a co-organizer.
 */
export const removeCoOrganizer = (
  coOrganizers = [],
  coOrganizerId
) => {
  if (
    !Array.isArray(
      coOrganizers
    )
  ) {
    return [];
  }

  const normalizedId =
    normalizeOrganizerId(
      coOrganizerId
    );

  const now =
    new Date().toISOString();

  return coOrganizers.map(
    (coOrganizer) => {
      if (
        normalizeOrganizerId(
          coOrganizer.id
        ) !== normalizedId
      ) {
        return coOrganizer;
      }

      return {
        ...coOrganizer,
        status:
          CO_ORGANIZER_STATUSES.REMOVED,
        removedAt: now,
        updatedAt: now,
      };
    }
  );
};

/**
 * Get active co-organizers.
 */
export const getActiveCoOrganizers = (
  coOrganizers = []
) => {
  if (
    !Array.isArray(
      coOrganizers
    )
  ) {
    return [];
  }

  return coOrganizers.filter(
    (coOrganizer) =>
      coOrganizer.status ===
      CO_ORGANIZER_STATUSES.ACCEPTED
  );
};

/**
 * Get pending invitations.
 */
export const getPendingCoOrganizerInvitations =
  (
    coOrganizers = []
  ) => {
    if (
      !Array.isArray(
        coOrganizers
      )
    ) {
      return [];
    }

    return coOrganizers.filter(
      (coOrganizer) =>
        coOrganizer.status ===
        CO_ORGANIZER_STATUSES.PENDING
    );
  };

/**
 * Get declined invitations.
 */
export const getDeclinedCoOrganizerInvitations =
  (
    coOrganizers = []
  ) => {
    if (
      !Array.isArray(
        coOrganizers
      )
    ) {
      return [];
    }

    return coOrganizers.filter(
      (coOrganizer) =>
        coOrganizer.status ===
        CO_ORGANIZER_STATUSES.DECLINED
    );
  };

/**
 * Get removed co-organizers.
 */
export const getRemovedCoOrganizers = (
  coOrganizers = []
) => {
  if (
    !Array.isArray(
      coOrganizers
    )
  ) {
    return [];
  }

  return coOrganizers.filter(
    (coOrganizer) =>
      coOrganizer.status ===
      CO_ORGANIZER_STATUSES.REMOVED
  );
};

/**
 * Create a co-organizer activity
 * record.
 */
export const createCoOrganizerActivity = ({
  eventId,
  actorId,
  coOrganizerId,
  action,
  details = "",
} = {}) => {
  return {
    id:
      generateCoOrganizerActivityId(),
    eventId:
      normalizeOrganizerId(
        eventId
      ),
    actorId:
      normalizeOrganizerId(
        actorId
      ),
    coOrganizerId:
      normalizeOrganizerId(
        coOrganizerId
      ),
    action:
      String(action || "").trim(),
    details:
      String(details || "").trim(),
    timestamp:
      new Date().toISOString(),
  };
};

/**
 * Add an activity record.
 */
export const addCoOrganizerActivity = (
  activities = [],
  activity
) => {
  if (!activity) {
    return Array.isArray(
      activities
    )
      ? [...activities]
      : [];
  }

  return [
    ...(Array.isArray(
      activities
    )
      ? activities
      : []),
    activity,
  ];
};

/**
 * Get activity for a specific
 * co-organizer.
 */
export const getCoOrganizerActivity = (
  activities = [],
  coOrganizerId
) => {
  if (
    !Array.isArray(
      activities
    )
  ) {
    return [];
  }

  const normalizedId =
    normalizeOrganizerId(
      coOrganizerId
    );

  return activities.filter(
    (activity) =>
      normalizeOrganizerId(
        activity.coOrganizerId
      ) === normalizedId
  );
};

/**
 * Get permission labels for display.
 */
export const getCoOrganizerPermissionLabels =
  (
    permissions = []
  ) => {
    return normalizePermissions(
      permissions
    ).map(
      (permission) =>
        getPermissionConfig(
          permission
        )?.label ||
        permission
    );
  };

/**
 * Get a readable status label.
 */
export const getCoOrganizerStatusLabel =
  (status) => {
    const labels = {
      [CO_ORGANIZER_STATUSES.PENDING]:
        "Pending",
      [CO_ORGANIZER_STATUSES.ACCEPTED]:
        "Accepted",
      [CO_ORGANIZER_STATUSES.DECLINED]:
        "Declined",
      [CO_ORGANIZER_STATUSES.REMOVED]:
        "Removed",
    };

    return (
      labels[status] ||
      "Unknown"
    );
  };

/**
 * Count active co-organizers.
 */
export const getActiveCoOrganizerCount = (
  coOrganizers = []
) => {
  return getActiveCoOrganizers(
    coOrganizers
  ).length;
};

/**
 * Check whether a user is the
 * primary organizer.
 */
export const isPrimaryOrganizer = (
  organizerId,
  userId
) => {
  return (
    normalizeOrganizerId(
      organizerId
    ) ===
    normalizeOrganizerId(
      userId
    )
  );
};

/**
 * Check whether a user can perform
 * an action for an event.
 */
export const canCoOrganizerPerformAction =
  ({
    organizerId,
    userId,
    coOrganizers = [],
    permission,
  } = {}) => {
    // Primary organizer has full access.
    if (
      isPrimaryOrganizer(
        organizerId,
        userId
      )
    ) {
      return true;
    }

    const coOrganizer =
      findCoOrganizerByUserId(
        coOrganizers,
        userId
      );

    if (
      !coOrganizer ||
      coOrganizer.status !==
        CO_ORGANIZER_STATUSES.ACCEPTED
    ) {
      return false;
    }

    return hasCoOrganizerPermission(
      coOrganizer,
      permission
    );
  };

/**
 * Get a co-organizer's role summary.
 */
export const getCoOrganizerRoleSummary = (
  coOrganizer
) => {
  if (!coOrganizer) {
    return {
      status: "Unknown",
      permissions: [],
      permissionLabels: [],
    };
  }

  const permissions =
    normalizePermissions(
      coOrganizer.permissions
    );

  return {
    status:
      getCoOrganizerStatusLabel(
        coOrganizer.status
      ),
    permissions,
    permissionLabels:
      getCoOrganizerPermissionLabels(
        permissions
      ),
  };
};

/**
 * Normalize a complete co-organizer
 * collection.
 */
export const normalizeCoOrganizers = (
  coOrganizers = []
) => {
  if (
    !Array.isArray(
      coOrganizers
    )
  ) {
    return [];
  }

  return coOrganizers.map(
    (coOrganizer) => ({
      ...coOrganizer,
      id:
        normalizeOrganizerId(
          coOrganizer.id
        ) ||
        generateCoOrganizerId(),
      eventId:
        normalizeOrganizerId(
          coOrganizer.eventId
        ),
      organizerId:
        normalizeOrganizerId(
          coOrganizer.organizerId
        ),
      userId:
        normalizeOrganizerId(
          coOrganizer.userId
        ),
      email:
        normalizeOrganizerEmail(
          coOrganizer.email
        ),
      name:
        String(
          coOrganizer.name ||
            ""
        ).trim(),
      permissions:
        normalizePermissions(
          coOrganizer.permissions
        ),
      status:
        coOrganizer.status ||
        CO_ORGANIZER_STATUSES.PENDING,
      invitedAt:
        coOrganizer.invitedAt ||
        new Date().toISOString(),
    })
  );
};

/**
 * Get a compact summary of co-organizer
 * management.
 */
export const getCoOrganizerSummary = (
  coOrganizers = []
) => {
  const normalized =
    normalizeCoOrganizers(
      coOrganizers
    );

  return {
    total:
      normalized.length,
    active:
      getActiveCoOrganizers(
        normalized
      ).length,
    pending:
      getPendingCoOrganizerInvitations(
        normalized
      ).length,
    declined:
      getDeclinedCoOrganizerInvitations(
        normalized
      ).length,
    removed:
      getRemovedCoOrganizers(
        normalized
      ).length,
  };
};