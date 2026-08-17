package com.sandeep.eventrabackend.security;

import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * JWT Grace-Period Key Rotation Manager (#14083).
 *
 * Maintains a small keyring of the current signing key plus the immediately
 * previous key, so tokens issued under the previous key remain valid during
 * the grace period after a rotation instead of invalidating every session.
 * The keyring is bounded: only the current and the most recent previous key
 * are retained, so it cannot grow without limit.
 *
 * Issuance and validation delegate to this manager via {@link JwtTokenProvider}.
 */
@Component
public class JwtKeyRotationManager {

    private static final int MAX_RETAINED_KEYS = 2;

    private final Map<String, SecretKey> keyRing = new ConcurrentHashMap<>();
    private final Deque<String> keyOrder = new ConcurrentLinkedDeque<>();
    private volatile String currentKeyId;

    /**
     * Registers {@code secretKey} as the current signing key. The previously
     * current key is retained as a grace key; older keys are evicted.
     */
    public synchronized void rotateKeys(String nextKeyId, SecretKey secretKey) {
        if (nextKeyId == null || secretKey == null) {
            return;
        }
        if (secretKey.equals(keyRing.get(nextKeyId))) {
            return; // Re-registering the same key id with the same key: no-op
        }

        keyRing.put(nextKeyId, secretKey);
        keyOrder.remove(nextKeyId);
        keyOrder.addFirst(nextKeyId);
        this.currentKeyId = nextKeyId;

        while (keyOrder.size() > MAX_RETAINED_KEYS) {
            String oldest = keyOrder.removeLast();
            if (oldest != null) {
                keyRing.remove(oldest);
            }
        }
    }

    /**
     * @return the current signing key, or {@code null} if none has been registered
     */
    public SecretKey getCurrentKey() {
        String keyId = currentKeyId;
        return keyId == null ? null : keyRing.get(keyId);
    }

    public String getCurrentKeyId() {
        return currentKeyId;
    }

    public SecretKey getKey(String keyId) {
        if (keyId == null) {
            return null;
        }
        return keyRing.get(keyId);
    }

    /**
     * @return the retained grace keys (all keys other than the current one),
     *         ordered from most recently current to oldest
     */
    public synchronized List<SecretKey> getGraceKeys() {
        List<SecretKey> graceKeys = new ArrayList<>();
        String currentId = currentKeyId;
        for (String keyId : keyOrder) {
            if (currentId == null || !keyId.equals(currentId)) {
                SecretKey key = keyRing.get(keyId);
                if (key != null) {
                    graceKeys.add(key);
                }
            }
        }
        return Collections.unmodifiableList(graceKeys);
    }
}
