package com.sandeep.eventrabackend.model;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class EventRoleTests {

    @Test
    void higherEventRolesIncludeLowerPermissions() {
        assertTrue(EventRole.OWNER.includes(EventRole.ORGANIZER));
        assertTrue(EventRole.ORGANIZER.includes(EventRole.MODERATOR));
        assertTrue(EventRole.MODERATOR.includes(EventRole.ATTENDEE));
    }

    @Test
    void lowerEventRolesDoNotIncludeHigherPermissions() {
        assertFalse(EventRole.ATTENDEE.includes(EventRole.MODERATOR));
        assertFalse(EventRole.MODERATOR.includes(EventRole.ORGANIZER));
        assertFalse(EventRole.ORGANIZER.includes(EventRole.OWNER));
    }

    @Test
    void parsesRoleNamesCaseInsensitively() {
        assertSame(EventRole.OWNER, EventRole.from("owner"));
        assertSame(EventRole.MODERATOR, EventRole.from("Moderator"));
    }
}
