package com.sandeep.eventrabackend.security.passkey;

import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * FIDO2 Passkey Public Key Credential Repository.
 * Stores credentials scoped per user and enforces cross-account credential isolation (#17866).
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

    // Outer map keyed by normalized userEmail, inner map keyed by normalized credentialId
    private final Map<String, Map<String, PasskeyCredential>> userStore = new ConcurrentHashMap<>();
    // Global index tracking credentialId owner (normalized credentialId -> normalized userEmail)
    private final Map<String, String> credentialOwnerMap = new ConcurrentHashMap<>();

    public void save(PasskeyCredential credential) {
        if (credential == null) {
            throw new IllegalArgumentException("Credential cannot be null.");
        }
        if (credential.getCredentialId() == null || credential.getCredentialId().isBlank()) {
            throw new IllegalArgumentException("credentialId is required.");
        }
        if (credential.getUserEmail() == null || credential.getUserEmail().isBlank()) {
            throw new IllegalArgumentException("userEmail is required.");
        }

        String normEmail = credential.getUserEmail().trim().toLowerCase();
        String normId = credential.getCredentialId().trim();

        // Check if credentialId is already claimed by a different user
        String existingOwner = credentialOwnerMap.putIfAbsent(normId, normEmail);
        if (existingOwner != null && !existingOwner.equals(normEmail)) {
            throw new IllegalArgumentException("Credential ID is already registered to another account.");
        }

        userStore.computeIfAbsent(normEmail, k -> new ConcurrentHashMap<>()).put(normId, credential);
    }

    public Optional<PasskeyCredential> findByCredentialId(String credentialId) {
        if (credentialId == null || credentialId.isBlank()) {
            return Optional.empty();
        }
        String normId = credentialId.trim();
        String ownerEmail = credentialOwnerMap.get(normId);
        if (ownerEmail == null) {
            return Optional.empty();
        }
        Map<String, PasskeyCredential> userMap = userStore.get(ownerEmail);
        return userMap != null ? Optional.ofNullable(userMap.get(normId)) : Optional.empty();
    }

    public Optional<PasskeyCredential> findByUserEmailAndCredentialId(String userEmail, String credentialId) {
        if (userEmail == null || userEmail.isBlank() || credentialId == null || credentialId.isBlank()) {
            return Optional.empty();
        }
        String normEmail = userEmail.trim().toLowerCase();
        String normId = credentialId.trim();
        Map<String, PasskeyCredential> userMap = userStore.get(normEmail);
        return userMap != null ? Optional.ofNullable(userMap.get(normId)) : Optional.empty();
    }

    public List<PasskeyCredential> findByUserEmail(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            return Collections.emptyList();
        }
        String normEmail = userEmail.trim().toLowerCase();
        Map<String, PasskeyCredential> userMap = userStore.get(normEmail);
        return userMap != null ? new ArrayList<>(userMap.values()) : Collections.emptyList();
    }

    public void clear() {
        userStore.clear();
        credentialOwnerMap.clear();
    }
}

