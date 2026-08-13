package com.sandeep.eventrabackend.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

/**
 * Verifies that the refresh-token grace window is shared across handler
 * instances when they are backed by the same {@link TokenGraceStore}, so a token
 * rotated on one instance is honoured on another (issue #16245).
 */
class TokenRefreshQueueHandlerTest {

    @Test
    void graceIsSharedAcrossInstancesViaSharedStore() {
        // Two handler instances that do NOT share memory, backed by ONE store.
        TokenGraceStore sharedStore = new InMemoryTokenGraceStore();
        TokenRefreshQueueHandler instanceA = new TokenRefreshQueueHandler(sharedStore);
        TokenRefreshQueueHandler instanceB = new TokenRefreshQueueHandler(sharedStore);

        // Instance A performs the rotation.
        instanceA.registerTokenRotation("rotated-refresh-token");

        // Instance B, which never saw the rotation locally, must still accept
        // the just-rotated token within the grace window.
        assertTrue(
                instanceB.isWithinGracePeriod("rotated-refresh-token"),
                "grace must be honoured on a different instance sharing the store");

        // And the rotating instance naturally accepts it too.
        assertTrue(instanceA.isWithinGracePeriod("rotated-refresh-token"));

        // An unrelated token is not within grace.
        assertFalse(instanceB.isWithinGracePeriod("some-other-token"));
    }

    @Test
    void graceRejectsAfterExpiry() throws InterruptedException {
        TokenGraceStore sharedStore = new InMemoryTokenGraceStore();
        TokenRefreshQueueHandler handler = new TokenRefreshQueueHandler(sharedStore);

        handler.registerTokenRotation("short-lived-token");
        assertTrue(handler.isWithinGracePeriod("short-lived-token"));

        // Simulate the grace window elapsing.
        Thread.sleep(10);
        sharedStore.pruneExpired(0);
        assertFalse(handler.isWithinGracePeriod("short-lived-token"));
    }
}
