package com.sandeep.eventrabackend.subtitles;

/**
 * Status of a subtitle session
 */
public enum SessionStatus {
    ACTIVE,      // Session is currently active and accepting subtitles
    PAUSED,      // Session is paused (no new subtitles but maintaining state)
    ENDED,       // Session has ended normally
    EXPIRED,     // Session has expired due to inactivity
    ERROR,       // Session encountered an error
    CANCELLED    // Session was cancelled
}
