package com.sandeep.eventrabackend.security.passkey;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth/webauthn")
@CrossOrigin(origins = "*")
public class WebAuthnController {

    private final PasskeyCredentialRepository credentialRepository;

    public WebAuthnController(PasskeyCredentialRepository credentialRepository) {
        this.credentialRepository = credentialRepository;
    }

    @PostMapping("/register-challenge")
    public ResponseEntity<Map<String, Object>> generateRegisterChallenge(@RequestParam String userEmail) {
        Map<String, Object> response = new HashMap<>();
        response.put("challenge", UUID.randomUUID().toString());
        response.put("rpName", "Eventra Platform");
        response.put("userEmail", userEmail);
        response.put("timeout", 60000);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-registration")
    public ResponseEntity<Map<String, Object>> verifyRegistration(@RequestBody Map<String, String> payload) {
        String credentialId = payload.get("credentialId");
        String userEmail = payload.get("userEmail");
        String publicKeyPem = payload.get("publicKey");

        PasskeyCredentialRepository.PasskeyCredential cred =
                new PasskeyCredentialRepository.PasskeyCredential(credentialId, userEmail, publicKeyPem);
        credentialRepository.save(cred);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "WebAuthn Passkey registered successfully.");
        return ResponseEntity.ok(response);
    }
}
