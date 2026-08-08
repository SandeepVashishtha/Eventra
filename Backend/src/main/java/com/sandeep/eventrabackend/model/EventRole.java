package com.sandeep.eventrabackend.model;

import java.util.Arrays;

public enum EventRole {
    ATTENDEE(0),
    MODERATOR(1),
    ORGANIZER(2),
    OWNER(3);

    private final int rank;

    EventRole(int rank) {
        this.rank = rank;
    }

    public boolean includes(EventRole requiredRole) {
        return this.rank >= requiredRole.rank;
    }

    public static EventRole from(String role) {
        return Arrays.stream(values())
                .filter(value -> value.name().equalsIgnoreCase(role))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid event role: " + role + ". Valid roles: OWNER, ORGANIZER, MODERATOR, ATTENDEE"));
    }
}
