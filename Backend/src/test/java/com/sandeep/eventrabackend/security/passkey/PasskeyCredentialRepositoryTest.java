package com.sandeep.eventrabackend.security.passkey;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class PasskeyCredentialRepositoryTest {

    private PasskeyCredentialRepository repository;

    @BeforeEach
    void setUp() {
        repository = new PasskeyCredentialRepository();
    }

    @Test
    @DisplayName("Successfully save and retrieve credential for a user")
    void saveAndRetrieveForUser() {
        PasskeyCredentialRepository.PasskeyCredential cred =
                new PasskeyCredentialRepository.PasskeyCredential("cred-1", "alice@example.com", "pem-key-1");

        repository.save(cred);

        Optional<PasskeyCredentialRepository.PasskeyCredential> byId = repository.findByCredentialId("cred-1");
        assertTrue(byId.isPresent());
        assertEquals("alice@example.com", byId.get().getUserEmail());

        Optional<PasskeyCredentialRepository.PasskeyCredential> byEmailAndId =
                repository.findByUserEmailAndCredentialId("alice@example.com", "cred-1");
        assertTrue(byEmailAndId.isPresent());
        assertEquals("pem-key-1", byEmailAndId.get().getPublicKeyPem());
    }

    @Test
    @DisplayName("Cross-user passkey overwrite attempt is rejected with IllegalArgumentException")
    void crossUserOverwriteRejected() {
        PasskeyCredentialRepository.PasskeyCredential aliceCred =
                new PasskeyCredentialRepository.PasskeyCredential("shared-cred-id", "alice@example.com", "alice-pem");
        repository.save(aliceCred);

        PasskeyCredentialRepository.PasskeyCredential bobCred =
                new PasskeyCredentialRepository.PasskeyCredential("shared-cred-id", "bob@example.com", "bob-pem");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> repository.save(bobCred));
        assertEquals("Credential ID is already registered to another account.", ex.getMessage());

        // Verify Alice's credential remains unchanged
        Optional<PasskeyCredentialRepository.PasskeyCredential> aliceRetrieved =
                repository.findByCredentialId("shared-cred-id");
        assertTrue(aliceRetrieved.isPresent());
        assertEquals("alice@example.com", aliceRetrieved.get().getUserEmail());
        assertEquals("alice-pem", aliceRetrieved.get().getPublicKeyPem());

        // Verify Bob cannot lookup Alice's credential under Bob's user email
        Optional<PasskeyCredentialRepository.PasskeyCredential> bobLookup =
                repository.findByUserEmailAndCredentialId("bob@example.com", "shared-cred-id");
        assertFalse(bobLookup.isPresent());
    }

    @Test
    @DisplayName("Same-user passkey update is allowed")
    void sameUserUpdateAllowed() {
        PasskeyCredentialRepository.PasskeyCredential initial =
                new PasskeyCredentialRepository.PasskeyCredential("cred-1", "alice@example.com", "old-pem");
        repository.save(initial);

        PasskeyCredentialRepository.PasskeyCredential updated =
                new PasskeyCredentialRepository.PasskeyCredential("cred-1", "alice@example.com", "new-pem");
        updated.setSignCount(5);
        repository.save(updated);

        Optional<PasskeyCredentialRepository.PasskeyCredential> retrieved =
                repository.findByUserEmailAndCredentialId("alice@example.com", "cred-1");
        assertTrue(retrieved.isPresent());
        assertEquals("new-pem", retrieved.get().getPublicKeyPem());
        assertEquals(5, retrieved.get().getSignCount());
    }

    @Test
    @DisplayName("Email and credential ID lookups are case-insensitive and trim whitespace")
    void emailAndCredentialIdNormalization() {
        PasskeyCredentialRepository.PasskeyCredential cred =
                new PasskeyCredentialRepository.PasskeyCredential("  cred-xyz  ", " Alice@Example.com ", "pem-123");
        repository.save(cred);

        assertTrue(repository.findByCredentialId("cred-xyz").isPresent());
        assertTrue(repository.findByUserEmailAndCredentialId("alice@example.com", "cred-xyz").isPresent());
        assertEquals(1, repository.findByUserEmail("ALICE@EXAMPLE.COM").size());
    }

    @Test
    @DisplayName("findByUserEmail returns only credentials belonging to specified user")
    void findByUserEmailReturnsOnlyUserCredentials() {
        repository.save(new PasskeyCredentialRepository.PasskeyCredential("c1", "alice@example.com", "p1"));
        repository.save(new PasskeyCredentialRepository.PasskeyCredential("c2", "alice@example.com", "p2"));
        repository.save(new PasskeyCredentialRepository.PasskeyCredential("c3", "bob@example.com", "p3"));

        List<PasskeyCredentialRepository.PasskeyCredential> aliceCreds = repository.findByUserEmail("alice@example.com");
        assertEquals(2, aliceCreds.size());

        List<PasskeyCredentialRepository.PasskeyCredential> bobCreds = repository.findByUserEmail("bob@example.com");
        assertEquals(1, bobCreds.size());
    }

    @Test
    @DisplayName("Null or blank parameters in save throw IllegalArgumentException")
    void invalidInputsRejected() {
        assertThrows(IllegalArgumentException.class, () -> repository.save(null));
        assertThrows(IllegalArgumentException.class, () ->
                repository.save(new PasskeyCredentialRepository.PasskeyCredential(null, "alice@example.com", "pem")));
        assertThrows(IllegalArgumentException.class, () ->
                repository.save(new PasskeyCredentialRepository.PasskeyCredential("   ", "alice@example.com", "pem")));
        assertThrows(IllegalArgumentException.class, () ->
                repository.save(new PasskeyCredentialRepository.PasskeyCredential("cred-1", null, "pem")));
        assertThrows(IllegalArgumentException.class, () ->
                repository.save(new PasskeyCredentialRepository.PasskeyCredential("cred-1", "  ", "pem")));
    }
}
