package com.sandeep.eventrabackend.model;

public enum Role {
    CLIENT,
    ATTENDEE,
    MODERATOR,
    OWNER,
    ORGANIZER,
    ADMIN,
    SUPER_ADMIN;

    public static Role from(String role) {
        return java.util.Arrays.stream(values())
                .filter(value -> value.name().equalsIgnoreCase(role))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid user role: " + role));
    }
}
