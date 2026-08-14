package com.sandeep.eventrabackend.security.passkey;

import org.springframework.stereotype.Repository;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Repository interface mapping user credentials profiles (#17672).
 */
@Repository
public class PasskeyCredentialRepository {

    private final Map<String, String> credentialStorage = new ConcurrentHashMap<>();

    public void saveCredential(String username, String publicKey) {
        credentialStorage.put(username, publicKey);
    }

    public String getCredential(String username) {
        return credentialStorage.get(username);
    }
}
