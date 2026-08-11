package com.sandeep.eventrabackend.security.passkey;

import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * FIDO2 Passkey Public Key Credential Repository.
 */
@Repository
public class PasskeyCredentialRepository {

    public static class PasskeyCredential {
        private String credentialId;
        private String userEmail;
        private String publicKeyPem;
        private long signCount;

        public PasskeyCredential() {}
        public PasskeyCredential(String credentialId, String userEmail, String publicKeyPem) {
            this.credentialId = credentialId;
            this.userEmail = userEmail;
            this.publicKeyPem = publicKeyPem;
            this.signCount = 0;
        }

        public String getCredentialId() { return credentialId; }
        public String getUserEmail() { return userEmail; }
        public String getPublicKeyPem() { return publicKeyPem; }
        public long getSignCount() { return signCount; }
        public void setSignCount(long signCount) { this.signCount = signCount; }
    }

    private final Map<String, PasskeyCredential> store = new ConcurrentHashMap<>();

    public void save(PasskeyCredential credential) {
        if (credential != null && credential.getCredentialId() != null) {
            store.put(credential.getCredentialId(), credential);
        }
    }

    public Optional<PasskeyCredential> findByCredentialId(String credentialId) {
        return Optional.ofNullable(store.get(credentialId));
    }
}
