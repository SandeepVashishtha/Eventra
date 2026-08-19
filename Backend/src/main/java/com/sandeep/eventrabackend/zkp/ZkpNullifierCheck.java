package com.sandeep.eventrabackend.zkp;

import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ZkpNullifierCheck {

    private final ConcurrentHashMap<String, Boolean> consumedNullifiers = new ConcurrentHashMap<>();

    public synchronized void checkAndConsume(String nullifier) throws LockException {
        if (consumedNullifiers.containsKey(nullifier)) {
            throw new LockException("ZKP Nullifier has already been consumed - double submission prevented");
        }
        consumedNullifiers.put(nullifier, true);
    }

    public void resetNullifiers() {
        consumedNullifiers.clear();
    }
}
